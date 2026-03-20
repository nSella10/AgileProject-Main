import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const OnlineAuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/online");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !regEmail || !regPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (regPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(firstName, lastName, regEmail, regPassword);
      toast.success("Account created! Welcome!");
      navigate("/online");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="text-purple-200 hover:text-white transition-colors text-lg mb-4 block"
        >
          ← Back
        </button>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-6 border border-white border-opacity-20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🌐</div>
            <h1 className="text-2xl font-bold text-white">Play Online</h1>
            <p className="text-purple-200 text-sm mt-1">
              Sign in to play with people around the world
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                mode === "login"
                  ? "bg-purple-600 text-white"
                  : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                mode === "register"
                  ? "bg-purple-600 text-white"
                  : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20"
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:from-gray-500 disabled:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-purple-200 text-sm mb-1 block">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-purple-200 text-sm mb-1 block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="text-purple-200 text-sm mb-1 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:from-gray-500 disabled:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnlineAuthPage;
