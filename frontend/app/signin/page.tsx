import Link from "next/link";

export default function page() {
  return (
    <div className="flex items-center justify-center min-h-[88vh] bg-gray-100 border">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex flex-col items-center mb-6">
          <div className="text-blue-600 text-4xl mb-2">🎓</div>
          <h2 className="text-2xl font-semibold">Sign in to your account</h2>
          <p className="text-gray-500 text-sm">
            Welcome back! Please enter your details.
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

          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center text-gray-600 text-sm">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <Link href="#" className="text-blue-600 text-sm hover:underline">
              Forgot password?
            </Link>
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
