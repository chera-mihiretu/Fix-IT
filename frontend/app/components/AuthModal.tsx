'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const academicLevels = [
  'High School',
  'Undergraduated'
];

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    academic: 'High School'
  });

  const validateForm = () => {
    // Validate username (only alphabets)
    if (!/^[a-zA-Z]+$/.test(formData.username)) {
      setError('Username must contain only alphabets');
      return false;
    }

    // Validate password (at least 6 characters with mix of letters and numbers)
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(formData.password)) {
      setError('Password must be at least 6 characters long and contain both letters and numbers');
      return false;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate age
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 13 || age > 120) {
      setError('Age must be between 13 and 120');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (isSignUp && !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      
      if (isSignUp) {
        try {
          // Create the request body for signup
          const signupBody = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            age: parseInt(formData.age),
            academic: formData.academic
          };

          console.log('Signup request body:', signupBody);

          // Get the token if it exists
          const token = localStorage.getItem('authToken');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };

          // Add Authorization header if token exists
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${baseUrl}/u/register`, {
            method: 'POST',
            headers,
            body: JSON.stringify(signupBody)
          });

          let data;
          const rawResponse = await response.text();
          console.log('Raw response text:', rawResponse);
          
          try {
            data = JSON.parse(rawResponse);
            console.log('Parsed response:', data);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid response from server');
          }

          if (!response.ok) {
            switch (response.status) {
              case 409:
                throw new Error(data.message || 'User already exists or username is taken');
              case 400:
                throw new Error(data.message || 'Invalid input. Please check your details.');
              case 500:
                throw new Error(data.message || 'Server error. Please try again later.');
              default:
                throw new Error(data.message || `Server error: ${response.status}`);
            }
          }

          // Set the success message directly from the server response
          if (data && data.message) {
            setSuccessMessage(data.message);
          } else {
            setSuccessMessage('Registration successful! Verify Your email');
          }

          // Clear form data
          setFormData({
            username: '',
            email: '',
            password: '',
            age: '',
            academic: 'High School'
          });
          // Don't close modal immediately so user can see the success message
          setTimeout(onClose, 5000);
        } catch (networkError) {
          console.error('Network error:', networkError);
          if (networkError instanceof TypeError && networkError.message === 'Failed to fetch') {
            throw new Error('Unable to connect to the server. Please check if the server is running.');
          }
          throw networkError;
        }
      } else {
        // Handle login logic
        try {
          // Create the login request body
          const loginBody = {
            email: formData.email,
            password: formData.password
          };

          console.log('Login request body:', loginBody);

          // Get the token if it exists
          const token = localStorage.getItem('authToken');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };

          // Add Authorization header if token exists
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${baseUrl}/u/login`, {
            method: 'POST',
            headers,
            body: JSON.stringify(loginBody)
          });

          let data;
          const rawResponse = await response.text();
          console.log('Raw response text:', rawResponse);
          
          try {
            data = JSON.parse(rawResponse);
            console.log('Parsed response:', data);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid response from server');
          }

          if (!response.ok) {
            throw new Error(data.message || 'Login failed. Please check your credentials.');
          }

          // Store the token in localStorage
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            // Store the email for display
            localStorage.setItem('userEmail', formData.email);
            
          }

          // Set success message and close modal
          setSuccessMessage(data.message || 'Logged in successfully');
          // Clear form
          setFormData({
            username: '',
            email: '',
            password: '',
            age: '',
            academic: 'High School'
          });
          // Close modal after showing success message
          setTimeout(onClose, 2000);
        } catch (networkError) {
          console.error('Login error:', networkError);
          throw networkError;
        }
      }
    } catch (err) {
      console.error('Full error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold magical-text">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 text-sm text-green-500 bg-green-50 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignUp && (
                <div>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--ai-purple))] focus:border-transparent transition-all"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--ai-purple))] focus:border-transparent transition-all"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--ai-purple))] focus:border-transparent transition-all"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {isSignUp && (
                <>
                  <div>
                    <input
                      type="number"
                      name="age"
                      required
                      min="13"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--ai-purple))] focus:border-transparent transition-all"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <select
                      name="academic"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--ai-purple))] focus:border-transparent transition-all"
                      value={formData.academic}
                      onChange={handleChange}
                    >
                      <option value="High School">High School</option>
                      <option value="Undergraduated">Undergraduate</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-4 text-center text-sm">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  className="ml-1 text-[rgb(var(--ai-purple))] hover:underline font-medium"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 