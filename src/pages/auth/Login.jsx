import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ----------------------------------
     Handle Google Redirect Result
  ---------------------------------- */
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          navigate('/');
        }
      })
      .catch((err) => {
        console.error('Redirect Error:', err);
      });
  }, [navigate]);

  /* ----------------------------------
     GOOGLE LOGIN
  ---------------------------------- */
  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      // Popup blocked → fallback to redirect
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        console.error(err);
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     EMAIL / PASSWORD LOGIN
  ---------------------------------- */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     FORGOT PASSWORD
  ---------------------------------- */
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent.');
    } catch (err) {
      console.error(err);
      setError('Failed to send reset email.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-100">
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login to your account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* EMAIL LOGIN */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="text-right">
            <span
              onClick={handleForgotPassword}
              className="text-xs text-gray-500 hover:text-red-500 cursor-pointer"
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#ff4d4d] text-white font-bold py-3 rounded hover:bg-red-600 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center my-6">
          <hr className="flex-1 border-gray-200" />
          <span className="px-3 text-sm text-gray-500">
            Or continue with social account
          </span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded border border-gray-200"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          LOGIN WITH GOOGLE
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Not Registered?{' '}
          <Link to="/register" className="text-red-500 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
