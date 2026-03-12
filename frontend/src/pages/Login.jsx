import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * PRODUCTION-READY LOGIN PAGE
 * Feature Set:
 * - Robust error handling & status tracking
 * - Inline form validation
 * - Dynamic loading states
 * - Auto-redirect if already authenticated
 * - Responsive, accessible premium design (Tailwind ready)
 */
export default function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in - Smart redirection by Role
  useEffect(() => {
    if (user && !authLoading) {
      const from = location.state?.from?.pathname || "/";
      
      // If logging in from the home or login page without a specific "from" target
      if (from === "/") {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'producer') {
          navigate('/producer/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        // Redirect back to where they were trying to go
        navigate(from, { replace: true });
      }
    }
  }, [user, authLoading, navigate, location]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError("");

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      const message = err.response?.data?.message || "Invalid credentials. Please try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-6 py-4 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-1 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-gray-600">
          Welcome back to Slaughter
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white px-2 py-8 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xs font-medium text-red-800">{serverError}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ${errors.email ? "ring-red-500" : "ring-gray-300"} focus:ring-2 focus:ring-black sm:text-xs px-3 outline-none`}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700">Password</label>
                <div className="text-xs"><a href="#" className="font-semibold text-black hover:text-black">Forgot?</a></div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ${errors.password ? "ring-red-500" : "ring-gray-300"} focus:ring-2 focus:ring-black sm:text-xs px-3 outline-none`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full justify-center rounded-md bg-black px-3 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-black ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.99]"}`}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-black hover:text-black">Create one today</Link>
        </p>
      </div>
    </div>
  );
}
