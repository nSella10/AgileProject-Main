import React, { useState } from "react";
import { useRegisterMutation } from "../slices/usersApiSlice";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [register, { isLoading }] = useRegisterMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (email !== confirmEmail) {
      setErrorMessage("Emails do not match");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await register({ firstName, lastName, email, password }).unwrap();
      setSuccessMessage("Registration successful! You can now log in.");

      setFirstName("");
      setLastName("");
      setEmail("");
      setConfirmEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(
        err?.data?.message || err?.error || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-300 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Welcome content */}
        <div className="text-white space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Join the Music Revolution! 🎵
            </h1>
            <p className="text-xl text-purple-100">
              Create engaging music quiz games and bring people together through
              the power of music.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-purple-400/30 backdrop-blur rounded-full flex items-center justify-center border border-purple-300/30">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-lg text-purple-100">Create unlimited music games</span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-purple-400/30 backdrop-blur rounded-full flex items-center justify-center border border-purple-300/30">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-lg text-purple-100">Access to thousands of songs</span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <div className="w-8 h-8 bg-purple-400/30 backdrop-blur rounded-full flex items-center justify-center border border-purple-300/30">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-lg text-purple-100">
                Perfect for education & entertainment
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <p className="text-sm italic">
                "Guessify! has transformed how we teach music in our classroom.
                Students are more engaged than ever!" - Music Teacher
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Registration form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto border border-white/20">
          {successMessage ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto border border-white/20">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to Guessify!
              </h2>
              <p className="text-purple-200">{successMessage}</p>
              <a
                href="/login"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-medium shadow-lg"
              >
                Continue to Login →
              </a>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <span className="text-3xl">🎵</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Create Your Account
                </h2>
                <p className="text-purple-200">
                  Start your musical journey today!
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    {errorMessage}
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={submitHandler}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-purple-200 font-medium mb-2 text-sm"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="Enter your first name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-purple-200 font-medium mb-2 text-sm"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Enter your last name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-purple-200 font-medium mb-2 text-sm"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmEmail"
                    className="block text-purple-200 font-medium mb-2 text-sm"
                  >
                    Confirm Email Address
                  </label>
                  <input
                    id="confirmEmail"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    required
                    placeholder="Confirm your email address"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-purple-200 font-medium mb-2 text-sm"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-purple-200 font-medium mb-2 text-sm"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating your account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🎵</span>
                      Create My Account
                    </div>
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-white/10">
                <p className="text-purple-300">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-pink-300 hover:text-pink-200 font-medium transition-colors"
                  >
                    Sign in here →
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
