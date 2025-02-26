"use client";
import Image from "next/image";
import Link from "next/link";
import brain from "@/public/brain.png";
import { useAuth } from "./_hooks/authHook";

export default function Page() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-24 py-12">
      {/* Left Section */}
      <div className="md:w-1/2 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Transform Your Learning with AI
        </h1>
        <p className="text-gray-600 mt-4 text-sm md:text-base">
          Upload PDFs, generate quizzes, and get personalized study materials
          tailored to your learning style.
        </p>
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <Link
            href={user ? "/pdf_upload" : "/signin"}
            className="bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg text-lg hover:bg-blue-700 w-full md:w-auto text-center"
          >
            Analyze PDF
          </Link>
          <Link
            href={user ? "/quiz" : "/signin"}
            className="border border-gray-400 text-gray-800 px-4 md:px-6 py-3 rounded-lg text-lg hover:bg-gray-100 w-full md:w-auto text-center"
          >
            Answer Quizzes
          </Link>
        </div>
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
        <Image
          src={brain}
          alt="AI Learning"
          className="w-11/12 sm:w-3/4 md:w-full max-w-md rounded-lg shadow-lg object-cover"
          priority
        />
      </div>
    </div>
  );
}
