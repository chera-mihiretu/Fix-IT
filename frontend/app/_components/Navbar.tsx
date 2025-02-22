"use client";

import { useAuth } from "../_hooks/authHook";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        LearnAI
      </Link>

      <div className="flex space-x-6">
        {user ? (
          <>
            <span className="text-gray-700">Hello, {user.username}!</span>
            <button
              onClick={logout}
              className="text-red-600 hover:underline font-bold "
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signin"
              className="text-gray-700 hover:font-bold transition-all hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
