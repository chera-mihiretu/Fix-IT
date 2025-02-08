// pages/index.js
"use client";

import { useRouter } from "next/navigation";  // Using next/navigation

const HomePage = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth/signin");  // Redirect to the Sign In page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-extrabold text-gray-800 mb-6">
          Welcome to Fix-IT
        </h1>
        <p className="text-2xl text-gray-600">
          {`Be Best at what you suck!`}  {/* Placeholder for motto */}
        </p>
        <button
          onClick={handleGetStarted}
          className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;
