import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  EmailAuthProvider, 
  linkWithCredential, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext'; // ✅ Import Context

export default function Register() {
  const navigate = useNavigate();
  const { googleSignIn } = useAuth(); 

  // Form State
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Logic State
  const [expandForm, setExpandForm] = useState(false); // To show Email/Pass after OTP
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 1. GENERATE RECAPTCHA ---
  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  // --- 2. SEND OTP ---
  const requestOtp = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);
    setError('');
    generateRecaptcha();
    
    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = "+91" + formData.phone; // Assuming India (+91). Change if needed.

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      alert("OTP Sent to " + phoneNumber);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. VERIFY OTP ---
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setExpandForm(true); // OTP verified, show rest of form
      setOtpSent(false); // Hide OTP input
    } catch (err) {
      console.error(err);
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. FINAL REGISTER (Link Email + Save to DB) ---
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser; // User is already logged in via Phone

      // A. Link Email/Password credential to the Phone Account
      const credential = EmailAuthProvider.credential(formData.email, formData.password);
      await linkWithCredential(user, credential);

      // B. Update Profile Name
      await updateProfile(user, { displayName: formData.fullName });

      // C. Save User to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: formData.fullName,
        email: formData.email,
        phoneNumber: user.phoneNumber,
        photoURL: "",
        role: 'client',
        createdAt: serverTimestamp()
      });

      navigate('/');
    } catch (err) {
      console.error("Registration Error:", err);
      if (err.code === 'auth/credential-already-in-use') {
        setError("This email is already linked to another account.");
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGN IN ---
  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate('/');
    } catch (err) {
      setError("Google Sign In Failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded text-center">{error}</div>}

        {/* --- Hidden Recaptcha Div --- */}
        <div id="recaptcha-container"></div>

        <form onSubmit={expandForm ? handleFinalRegister : (otpSent ? verifyOtp : requestOtp)} className="space-y-4">
          
          {/* STEP 1: PHONE NUMBER */}
          {!expandForm && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  disabled={otpSent}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                />
                {!otpSent && (
                  <button type="submit" disabled={loading} className="bg-gray-800 text-white px-4 rounded text-sm font-bold whitespace-nowrap">
                    {loading ? '...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: OTP INPUT */}
          {otpSent && !expandForm && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none tracking-widest text-center text-lg"
              />
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full mt-3 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {/* STEP 3: DETAILS FORM (Shown after OTP verified) */}
          {expandForm && (
            <>
              <div className="bg-green-50 text-green-700 p-2 rounded text-xs text-center mb-4 border border-green-200">
                ✅ Phone Verified: {formData.phone}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff4d4d] text-white py-3 rounded font-bold hover:bg-red-600 transition-colors shadow-sm"
              >
                {loading ? 'Registering...' : 'COMPLETE REGISTRATION'}
              </button>
            </>
          )}

        </form>

        {!expandForm && !otpSent && (
          <>
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-[#ff4d4d] font-semibold hover:underline">Login</Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with social account</span></div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-gray-100 py-3 rounded hover:bg-gray-200 transition duration-200 font-medium text-gray-700"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              SIGN UP WITH GOOGLE
            </button>
          </>
        )}
      </div>
    </div>
  );
}