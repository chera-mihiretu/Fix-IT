"use client";
import { useState } from "react";
import Link from "next/link";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    academicLevel: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign Up Data:", formData);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg text-black"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            className="w-full p-3 border rounded-lg text-black"
            value={formData.age}
            onChange={handleChange}
            required
          />
          <select
            name="academicLevel"
            className="w-full p-3 border rounded-lg text-black"
            value={formData.academicLevel}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Academic Level</option>
            <option value="High School" >High School</option>
            <option value="Undergraduate">Undergraduate</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
