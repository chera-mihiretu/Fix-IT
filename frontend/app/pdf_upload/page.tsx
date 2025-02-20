/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { CloudUpload, FileText, Clock } from "lucide-react";

export default function Page() {
  const [uploads, setUploads] = useState([
    { name: "Mathematics_Chapter1.pdf", time: "Uploaded 2 hours ago" },
    { name: "Physics_Notes.pdf", time: "Uploaded yesterday" },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center">Upload Your PDF</h1>
        <p className="text-gray-600 text-center">
          Start your learning journey by uploading your educational material
        </p>

        {/* Upload Box */}
        <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
          <CloudUpload size={48} className="text-blue-500" />
          <p className="mt-3 text-gray-700">Drag and drop your PDF here</p>
          <p className="text-gray-500">or</p>
          <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600">
            Browse Files
          </button>
          <p className="text-sm text-gray-500 mt-2">Maximum file size: 50MB</p>
        </div>

        {/* Supported Format Info */}
        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          ✅ Supported format: PDF
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          🔒 Your files are secure and encrypted
        </div>

        {/* Recent Uploads */}
        <h2 className="mt-6 text-lg font-semibold">Recent Uploads</h2>
        <div className="mt-3 space-y-3">
          {uploads.map((file, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 shadow-md"
            >
              <FileText size={28} className="text-red-500" />
              <div>
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock size={14} /> {file.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
