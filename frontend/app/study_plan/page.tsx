import Link from "next/link";

export default function page() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold">Your Personalized Study Plan</h1>
        <p className="text-gray-600 text-sm">
          Based on your recent quiz performance, we&apos;ve curated these
          materials to help strengthen your knowledge.
        </p>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <span className="text-lg font-semibold">Overall Progress</span>
            <span className="text-2xl font-bold text-blue-600">68%</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <span className="text-lg font-semibold">Topics to Review</span>
            <span className="text-2xl font-bold text-purple-600">7</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <span className="text-lg font-semibold">Time Required</span>
            <span className="text-2xl font-bold text-green-600">4.5 hrs</span>
          </div>
        </div>

        {/* Priority Topics */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Priority Topics</h2>
          <div className="mt-3 space-y-3">
            <div className="bg-red-100 p-4 rounded-lg flex items-center">
              <span className="text-red-600 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-red-600 font-semibold">
                  Linear Algebra Fundamentals
                </h3>
                <p className="text-sm text-gray-600">
                  Quiz Score: 45% - Needs immediate attention
                </p>
              </div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
              <span className="text-yellow-600 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-yellow-600 font-semibold">
                  Calculus Integration
                </h3>
                <p className="text-sm text-gray-600">
                  Quiz Score: 58% - Review recommended
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Practice */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Recommended Practice</h2>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-blue-600 font-semibold">
                Practice Exercises
              </h3>
              <p className="text-sm text-gray-600">
                30 targeted exercises based on your weak areas
              </p>
              <Link
                href="#"
                className="text-blue-500 text-sm font-semibold mt-2 block"
              >
                Start Practice →
              </Link>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-purple-600 font-semibold">Video Tutorials</h3>
              <p className="text-sm text-gray-600">
                15 curated videos explaining key concepts
              </p>
              <Link
                href="#"
                className="text-purple-500 text-sm font-semibold mt-2 block"
              >
                Watch Videos →
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Additional Resources</h2>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-gray-700 font-semibold">Study Guides</h3>
              <p className="text-sm text-gray-600">Comprehensive PDF guides</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-yellow-600 font-semibold">Study Groups</h3>
              <p className="text-sm text-gray-600">
                Join peer learning sessions
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-red-600 font-semibold">1:1 Tutoring</h3>
              <p className="text-sm text-gray-600">
                Book a session with experts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
