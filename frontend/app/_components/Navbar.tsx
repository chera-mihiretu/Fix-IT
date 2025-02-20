import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 md:px-12 lg:px-24 py-4 border-b">
      <div className="text-2xl font-bold text-gray-900">
        <Link href="/">LearnAI</Link>
      </div>
      <div className="hidden md:flex space-x-6 text-gray-700">
        <Link href="#" className="hover:text-gray-900">
          Features
        </Link>
        <Link href="#" className="hover:text-gray-900">
          How it Works
        </Link>
        <Link href="#" className="hover:text-gray-900">
          Pricing
        </Link>
      </div>
      <div className="hidden md:flex space-x-4 items-center">
        <Link href="/signin" className="text-gray-700 hover:text-gray-900">
          Sign In
        </Link>
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Sign Up
        </Link>
      </div>
      <button className="md:hidden text-gray-700 text-2xl">☰</button>
    </nav>
  );
}
