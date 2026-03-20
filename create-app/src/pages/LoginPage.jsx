import React, { useState } from "react";
import { useLoginMutation } from "../slices/usersApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCreate = location.state?.fromCreate;

  const [login, { isLoading }] = useLoginMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials(res));
      fromCreate ? navigate("/create") : navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-purple-300 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Welcome back content */}
        <div className="text-white space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome Back 🎶
            </h1>
            <p className="text-xl text-purple-100">
              Ready to create amazing music experiences? Sign in to continue
              your musical journey.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-purple-400/30 backdrop-blur rounded-full flex items-center justify-center border border-purple-300/30">
                <span className="text-white font-bold text-sm">🎮</span>
              </div>
              <span className="text-lg text-purple-100">Access your saved games</span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-purple-400/30 backdrop-blur rounded-full flex items-center justify-center border border-purple-300/30">
                <span className="text-white font-bold text-sm">📊</span>
              </div>
              <span className="text-lg text-purple-100">View your game analytics</span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-purple-400/30 backdrop-blur rounded-full flex items-center justify-center border border-purple-300/30">
                <span className="text-white font-bold text-sm">🚀</span>
              </div>
              <span className="text-lg text-purple-100">Create new games instantly</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <p className="text-sm italic">
                "Guessify! makes it so easy to engage my students. They love the
                interactive music games!" - Teacher Review
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <span className="text-3xl">🎵</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-purple-200">Sign in to your account</p>
          </div>

          {fromCreate && (
            <div className="mb-6 bg-purple-500/20 border border-purple-400/30 text-purple-200 px-4 py-3 rounded-xl text-sm">
              <div className="flex items-center">
                <span className="mr-2">ℹ️</span>
                You must be logged in to create a game.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {errorMessage}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={submitHandler}>
            <div>
              <label
                htmlFor="email"
                className="block text-purple-200 font-medium mb-2 text-sm"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-purple-200 font-medium mb-2 text-sm"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing you in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🎵</span>
                  Sign In
                </div>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <p className="text-purple-300">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-pink-300 hover:text-pink-200 font-medium transition-colors"
              >
                Create one here →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
