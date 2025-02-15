"use client";
import { useState } from "react";
import Link from "next/link";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign In with:", email, password);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
