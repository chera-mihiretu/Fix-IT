"use client";

import { useState } from "react";
import { useAuth } from "../_hooks/authHook";
import Link from "next/link";

export default function Page() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    academic: "High School",
    age: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, academic: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation check
    if (
      !formData.email ||
      !formData.username ||
      !formData.age ||
      !formData.password
    ) {
      return alert("Please fill in all fields.");
    }

    await signup({ ...formData, age: Number(formData.age) });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-lg shadow-md w-[400px]">
        <div className="flex flex-col items-center mb-6">
          <div className="text-blue-600 text-4xl mb-2">🎓</div>
          <h2 className="text-2xl font-semibold">Create your account</h2>
          <p className="text-gray-500 text-sm">
            Join our academic community today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">
              Email address
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">📧</span>
              <input
                type="email"
                name="email"
                className="w-full outline-none ml-2"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">Username</label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">👤</span>
              <input
                type="text"
                name="username"
                className="w-full outline-none ml-2"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">
              Academic Level
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">📚</span>
              <select
                name="academic"
                className="w-full outline-none ml-2"
                value={formData.academic}
                onChange={handleChangeSelect}
                required
              >
                <option>High School</option>
                <option>Undergraduated</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">Age</label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">📅</span>
              <input
                type="number"
                name="age"
                className="w-full outline-none ml-2"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm mb-1">Password</label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">🔒</span>
              <input
                type="password"
                name="password"
                className="w-full outline-none ml-2"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
