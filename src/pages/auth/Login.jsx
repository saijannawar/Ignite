import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase'; 
import { useAuth } from '../../context/AuthContext';
import { Mail, Smartphone, Lock, X, Loader } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { googleSignIn } = useAuth();
  
  // Login Method Toggle: 'email' or 'phone'
  const [loginMethod, setLoginMethod] = useState('email');

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Phone State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // --- 1. SETUP RECAPTCHA (For Phone Login) ---
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  }, []);

  // --- 2. HANDLE EMAIL LOGIN ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. HANDLE GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await googleSignIn();
      navigate('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 4. HANDLE PHONE OTP FLOW ---
  const requestOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return setError("Enter valid 10-digit number");
    
    setLoading(true);
    setError('');
    
    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = "+91" + phone; // Add country code

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setSuccessMsg(`OTP sent to ${phoneNumber}`);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Try again.");
      if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Check if user exists in Firestore, if not create basic profile
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: "Mobile User",
          email: "",
          phoneNumber: user.phoneNumber,
          role: "client",
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err) {
      setError("Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. HANDLE FORGOT PASSWORD ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setError("Please enter your email");
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccessMsg("Reset link sent! Check your inbox.");
      setTimeout(() => setShowForgotModal(false), 3000);
    } catch (err) {
      setError("Failed to send reset email. User not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Hidden Recaptcha */}
      <div id="recaptcha-container"></div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-[#7D2596] p-6 text-center">
          <h2 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h2>
          <p className="text-purple-200 text-sm mt-1">Login to access your account</p>
        </div>

        <div className="p-8">
          {/* Custom Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${loginMethod === 'email' ? 'bg-white text-[#7D2596] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setLoginMethod('email'); setError(''); setSuccessMsg(''); }}
            >
              <Mail size={16} /> Email
            </button>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${loginMethod === 'phone' ? 'bg-white text-[#7D2596] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setLoginMethod('phone'); setError(''); setSuccessMsg(''); }}
            >
              <Smartphone size={16} /> Mobile
            </button>
          </div>

          {/* Feedback Messages */}
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 text-center">{successMsg}</div>}

          {/* --- EMAIL FORM --- */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7D2596] outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7D2596] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-[#7D2596] font-bold hover:underline">
                  Forgot Password?
                </button>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-[#7D2596] hover:bg-[#631d76] text-white font-bold py-3.5 rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
                {loading && <Loader className="animate-spin" size={18} />} LOGIN
              </button>
            </form>
          )}

          {/* --- MOBILE OTP FORM --- */}
          {loginMethod === 'phone' && (
            <form onSubmit={otpSent ? verifyOtp : requestOtp} className="space-y-4">
              {!otpSent ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 font-bold">+91</span>
                    <input 
                      type="number" required value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-[#7D2596] outline-none transition-all"
                      placeholder="9876543210" maxLength={10}
                    />
                  </div>
                  <button disabled={loading} type="submit" className="w-full mt-4 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
                    {loading && <Loader className="animate-spin" size={18} />} SEND OTP
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter OTP</label>
                  <input 
                    type="number" required value={otp} onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7D2596] outline-none transition-all"
                    placeholder="123456" maxLength={6}
                  />
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => setOtpSent(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">Back</button>
                    <button disabled={loading} type="submit" className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
                      {loading && <Loader className="animate-spin" size={18} />} VERIFY
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center justify-between my-6">
            <hr className="w-full border-gray-200" />
            <span className="px-3 text-xs text-gray-400 font-bold uppercase whitespace-nowrap">Or Continue With</span>
            <hr className="w-full border-gray-200" />
          </div>

          {/* Google Login */}
          <button 
            onClick={handleGoogleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-[#7D2596] font-bold hover:underline">Register Now</Link>
          </p>
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 text-[#7D2596]">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
            </div>

            {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs text-center rounded">{error}</div>}
            {successMsg && <div className="mb-3 p-2 bg-green-50 text-green-600 text-xs text-center rounded">{successMsg}</div>}

            <form onSubmit={handleForgotPassword}>
              <input 
                type="email" required value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7D2596] outline-none mb-4"
                placeholder="name@example.com"
              />
              <button disabled={loading} type="submit" className="w-full bg-[#7D2596] hover:bg-[#631d76] text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}