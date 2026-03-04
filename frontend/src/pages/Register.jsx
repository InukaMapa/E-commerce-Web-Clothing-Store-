import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

const Field = ({ id, label, type = "text", placeholder, hint, value, onChange, error, autoComplete }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      autoComplete={autoComplete || id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset
        ${error ? "ring-red-500 bg-red-50" : "ring-gray-300"} 
        placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all outline-none`}
    />
    {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

export default function Register() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect away
  useEffect(() => {
    if (user && !authLoading) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Full name is required";
    if (!formData.email) next.email = "Email is required";
    else if (!validateEmail(formData.email)) next.email = "Invalid email format";
    if (!formData.password) next.password = "Password is required";
    else if (formData.password.length < 6) next.password = "Password must be at least 6 characters";
    if (!formData.confirm) next.confirm = "Please confirm your password";
    else if (formData.confirm !== formData.password) next.confirm = "Passwords do not match";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post("/api/auth/register", {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });

      // Auto login after successful registration
      const token = res.data?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        // Reload page to trigger AuthContext.fetchMe
        window.location.href = "/";
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-6 py-12 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
          SL
        </div>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join <span className="font-bold text-indigo-600">Slaughter</span> — style starts here.
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white px-8 py-8 shadow-xl rounded-2xl border border-gray-100">
          {/* Server Error */}
          {serverError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
              <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-red-800">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name */}
            <Field 
              id="name" 
              label="Full name" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete="name"
            />

            {/* Email */}
            <Field 
              id="email" 
              label="Email address" 
              type="email" 
              placeholder="john@example.com" 
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />

            {/* Password */}
            <Field
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              hint="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Field
              id="confirm"
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={formData.confirm}
              onChange={handleChange}
              error={errors.confirm}
              autoComplete="new-password"
            />

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full justify-center items-center rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-sm transition-all
                  ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99]"}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sign-in Link */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
