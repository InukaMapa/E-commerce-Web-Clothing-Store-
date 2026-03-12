import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center bg-white px-6">
      <div className="text-9xl font-black text-gray-100">404</div>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-500">Sorry, we couldn't find the page you're looking for.</p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-black px-8 py-3 text-xs font-bold text-white hover:bg-black transition-colors"
      >
        Back to Shop
      </Link>
    </div>
  );
}
