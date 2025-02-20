import Link from "next/link";

export default function page() {
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

        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">
              Email address
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">📧</span>
              <input
                type="email"
                className="w-full outline-none ml-2"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">Username</label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">👤</span>
              <input
                type="text"
                className="w-full outline-none ml-2"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">
              Academic Level
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">📚</span>
              <select className="w-full outline-none ml-2">
                <option>High School</option>
                <option>Undergraduate</option>
                <option>Graduate</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">Age</label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">📅</span>
              <input
                type="number"
                className="w-full outline-none ml-2"
                placeholder="Enter your age"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">Password</label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">🔒</span>
              <input
                type="password"
                className="w-full outline-none ml-2"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm mb-1">
              Confirm Password
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <span className="text-gray-500">🔒</span>
              <input
                type="password"
                className="w-full outline-none ml-2"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
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
