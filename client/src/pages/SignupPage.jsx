import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const EyeIcon = Eye;
  const EyeOffIcon = EyeOff;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await signup({ name, email, password });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-violet-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        {/* Left Section */}
        <div className="hidden md:flex flex-col items-center justify-center bg-linear-to-br from-indigo-600 to-purple-600 text-white p-10">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Spark It ✨
          </h1>
          <p className="text-sm opacity-90 text-center max-w-xs">
            Create a free account and start chatting.
          </p>
        </div>

        {/* Signup Section */}
        <div className="p-10 bg-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign up</h2>
          <p className="text-sm text-slate-500 mb-6">
            Start your journey today
          </p>

          {error && (
            <div className="text-sm text-red-600 bg-red-100 p-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-700 font-medium">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-700 font-medium">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <label className="text-sm text-slate-700 font-medium">
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 top-[22px] flex items-center text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-semibold rounded-lg shadow-md"
            >
              Create Account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="text-indigo-600 hover:underline" to="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
