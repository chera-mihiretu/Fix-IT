import React from "react";

export default function page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-2">
          Chapter 1: Introduction to Economics
        </h2>
        <div className="flex justify-between text-gray-600 mb-4">
          <span className="text-sm">Question 3/10</span>
          <span className="text-sm">Time: 12:45</span>
        </div>

        <div className="flex space-x-4 mb-4">
          <span className="text-green-600 font-semibold">2 Correct</span>
          <span className="text-red-600 font-semibold">0 Wrong</span>
        </div>

        <h3 className="text-lg font-medium mb-4">
          What is the primary function of a market economy system?
        </h3>

        <div className="space-y-4">
          <label className="flex items-center space-x-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="quiz"
              className="form-radio text-blue-600"
            />
            <span>A. Central planning of resources</span>
          </label>
          <label className="flex items-center space-x-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="quiz"
              className="form-radio text-blue-600"
            />
            <span>B. Resource allocation through price mechanism</span>
          </label>
          <label className="flex items-center space-x-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="quiz"
              className="form-radio text-blue-600"
            />
            <span>C. Government control of production</span>
          </label>
          <label className="flex items-center space-x-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="quiz"
              className="form-radio text-blue-600"
            />
            <span>D. Equal distribution of wealth</span>
          </label>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button className="text-blue-600 hover:underline">Previous</button>
          <div className="flex-1 h-2 bg-gray-200 rounded-lg mx-4 overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: "30%" }}></div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
