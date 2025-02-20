import React from "react";

export default function page() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl w-full">
        <h1 className="text-2xl font-bold text-center mb-2">
          Quiz Results & Analysis
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Great job completing the quiz! Here&appos;s a detailed breakdown of
          your performance.
        </p>

        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium">Overall Performance</h2>
            <p className="text-sm text-gray-500">Completed on March 15, 2025</p>
          </div>
          <div className="text-blue-600 text-3xl font-bold">
            85%
            <p className="text-sm text-gray-500 font-normal">34/40 Points</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-gray-50 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-medium flex items-center mb-4">
              <span className="text-yellow-500 mr-2">⭐</span> Your Strengths
            </h3>
            <div>
              <p className="text-sm text-gray-600">Mathematics</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "95%" }}
                ></div>
              </div>
              <p className="text-sm text-right text-gray-600">95%</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Science</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "90%" }}
                ></div>
              </div>
              <p className="text-sm text-right text-gray-600">90%</p>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-gray-50 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-medium flex items-center mb-4">
              <span className="text-blue-500 mr-2">📈</span> Areas for
              Improvement
            </h3>
            <div>
              <p className="text-sm text-gray-600">History</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
              <p className="text-sm text-right text-gray-600">70%</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Geography</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
              <p className="text-sm text-right text-gray-600">65%</p>
            </div>
          </div>
        </div>

        {/* Question Analysis */}
        <div className="bg-gray-50 rounded-lg p-4 shadow-md mb-6">
          <h3 className="text-lg font-medium mb-4">Question Analysis</h3>
          <div className="mb-4">
            <p className="text-sm font-medium">Question 1</p>
            <p className="text-sm text-gray-600">
              What is the capital of France?
            </p>
            <p className="text-sm">
              Your answer: <span className="text-gray-800">Paris</span>
            </p>
            <span className="text-green-600 text-sm font-medium">Correct</span>
          </div>
          <div>
            <p className="text-sm font-medium">Question 2</p>
            <p className="text-sm text-gray-600">
              Which river is the longest in the world?
            </p>
            <p className="text-sm">
              Your answer: <span className="text-gray-800">Amazon River</span>
            </p>
            <p className="text-sm">
              Correct answer: <span className="text-gray-800">Nile River</span>
            </p>
            <span className="text-red-600 text-sm font-medium">Incorrect</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">
            Retake Quiz
          </button>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-400">
            Download Results
          </button>
        </div>
      </div>
    </div>
  );
}
