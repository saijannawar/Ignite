import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'; 
import { auth, googleProvider } from '../../config/firebase'; 

export default function Login() {
  const navigate = useNavigate();
  
  // State for form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 1. HANDLE GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    if (loading) return; // Prevent double-click

    setLoading(true);
    setError('');

    try {
      await signInWithPopup(auth, googleProvider);
      // Login Successful -> Redirect to Home
      navigate('/'); 
    } catch (err) {
      // Gracefully handle "Popup Closed by User"
      if (err.code === 'auth/popup-closed-by-user') {
        console.log("User closed the popup without logging in.");
        // We do NOT set an error message here, so the user sees nothing wrong.
      } else {
        console.error("Google Login Error:", err);
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false); // Re-enable buttons
    }
  };

  // --- 2. HANDLE EMAIL/PASSWORD LOGIN ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); 
    } catch (err) {
      console.error("Email Login Error:", err);
      // Simple error handling for wrong password/user not found
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-100">
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to your account</h2>

        {/* Error Message Bar */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* --- Email Login Form --- */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="text-right">
             <span className="text-xs text-gray-500 hover:text-red-500 cursor-pointer">Forgot Password?</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#ff4d4d] text-white font-bold py-3 rounded hover:bg-red-600 transition-colors shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>

        {/* --- Divider --- */}
        <div className="flex items-center justify-between my-6">
          <hr className="w-full border-gray-200" />
          <span className="px-3 text-sm text-gray-500 whitespace-nowrap">Or continue with social account</span>
          <hr className="w-full border-gray-200" />
        </div>

        {/* --- Google Login Button --- */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded transition-colors border border-gray-200"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5" 
          />
          LOGIN WITH GOOGLE
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Not Registered? <Link to="/register" className="text-red-500 font-bold hover:underline">Sign Up</Link>
        </p>

      </div>
    </div>
  );
}