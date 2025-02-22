"use client";

import { useState } from "react";
import { useAuth } from "../_hooks/authHook";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SigninPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push("/");
    } 
     finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[88vh] bg-gray-100 border">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex flex-col items-center mb-6">
          <div className="text-blue-600 text-4xl mb-2">🎓</div>
          <h2 className="text-2xl font-semibold">Sign in to your account</h2>
          <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">Email address</label>
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

          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center text-gray-600 text-sm">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <Link href="#" className="text-blue-600 text-sm hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account? {" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}