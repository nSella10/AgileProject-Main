import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-blue-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Logo / Title */}
        <div className="mb-10">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Guessify
          </h1>
          <p className="text-purple-200 text-lg">
            The ultimate music guessing game
          </p>
        </div>

        {/* Join Local Game */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/join")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 bg-opacity-80 backdrop-blur-lg rounded-2xl p-6 border border-purple-400 border-opacity-30 shadow-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">
                🏠
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Join a Game
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Enter a room code from your host to join a local game
                </p>
                <p className="text-purple-200 text-xs mt-1">
                  No account needed
                </p>
              </div>
              <div className="ml-auto text-white text-2xl group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
