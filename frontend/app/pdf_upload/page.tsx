"use client";
import { useState } from "react";
import { CloudUpload, FileText, Clock, XCircle } from "lucide-react";

export default function Page() {
  const [uploads, setUploads] = useState<{ name: string; time: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);  

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB!");
      return;
    }

    const newFile = {
      name: file.name,
      time: `Uploaded just now`,
    };

    setUploads((prev) => [...prev, newFile]);
    setSelectedFile(file);
  };

  const handleSendPdf = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "https://fix-it-afxt.onrender.com/a/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      alert("PDF sent successfully!");

      setUploads([]);
      setSelectedFile(null);
      (document.getElementById("file-upload") as HTMLInputElement).value = "";
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to send PDF. Please try again.");
    }
  };

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

          {/* Hidden file input */}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 cursor-pointer"
          >
            Browse Files
          </label>

          <p className="text-sm text-gray-500 mt-2">Maximum file size: 50MB</p>
        </div>

        {/* Supported Format Info */}
        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          ✅ Supported format: PDF
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          🔒 Your files are secure and encrypted
        </div>

        {/* Send PDF Button */}
        <button
          onClick={handleSendPdf}
          className="mt-6 w-full bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 disabled:opacity-50"
          disabled={uploads.length === 0}
        >
          Send PDF
        </button>

        {/* Recent Uploads */}
        <div className="mt-3 space-y-3">
          {uploads.map((file, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg flex items-center justify-between shadow-md cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <FileText size={28} className="text-red-500" />
                <div>
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock size={14} /> {file.time}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploads((prev) => prev.filter((_, i) => i !== index));
                  if (uploads.length === 1) {
                    setSelectedFile(null); // Clear selected file if the last upload is removed
                  }
                }}
              >
                <XCircle
                  size={20}
                  className="text-gray-400 hover:text-red-500"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
