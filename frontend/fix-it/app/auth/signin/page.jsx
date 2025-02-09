// pages/auth/signin.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    // Add your sign-in logic here, then redirect if successful
    console.log("Signed In with:", email, password);
    router.push("/dashboard"); // Redirect to dashboard or home after successful login
  };

  const handleSocialSignIn = (platform) => {
    console.log(`Sign in with ${platform}`);
    // Add actual social sign-in logic here (OAuth, etc.)
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">Sign In</h2>
        
        {/* Sign In Form */}
        <div className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSignIn}
            className="w-full py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Sign In
          </button>
        </div>

        {/* Social Media Sign-In */}
        <div className="mt-6 text-center space-y-4">
          <button
            onClick={() => handleSocialSignIn("Google")}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
