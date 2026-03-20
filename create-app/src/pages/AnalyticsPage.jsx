// src/pages/AnalyticsPage.jsx
import React from "react";
import PageLayout from "../components/PageLayout";
import { useNavigate } from "react-router-dom";
import { useAnalyticsWithState } from "../hooks/useGames";
import {
  FaChartLine,
  FaGamepad,
  FaMusic,
  FaUsers,
  FaGlobe,
  FaLock,
  FaArrowLeft,
  FaTrophy,
  FaClock,
  FaFire,
} from "react-icons/fa";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { analytics, isLoading, error } = useAnalyticsWithState();

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading analytics...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-600 text-lg font-semibold mb-4">
              Failed to load analytics
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // בדיקה שהנתונים קיימים לפני destructuring
  if (!analytics) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading analytics...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const {
    overview = {},
    chartData = [],
    mostPopularGame = null,
    genreDistribution = [],
    recentActivity = [],
  } = analytics;

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-purple-100 hover:text-white mb-6 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-center">
              <div className="mb-4">
                <span className="text-5xl">📊</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Track your music game performance and player engagement
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Games
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.totalGames || 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <FaGamepad className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Songs
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.totalSongs || 0}
                  </p>
                </div>
                <div className="bg-pink-100 p-3 rounded-2xl">
                  <FaMusic className="text-pink-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Avg Songs/Game
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.avgSongsPerGame || 0}
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-2xl">
                  <FaChartLine className="text-indigo-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Recent Games
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.recentGamesCount || 0}
                  </p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <FaClock className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Game Visibility */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-2xl">
                  <FaUsers className="text-indigo-600 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Game Visibility
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaGlobe className="text-purple-600" />
                    <span className="font-medium text-gray-700">
                      Public Games
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {overview.publicGames || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaLock className="text-gray-500" />
                    <span className="font-medium text-gray-700">
                      Private Games
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-600">
                    {overview.privateGames || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Most Popular Game */}
            {mostPopularGame && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-yellow-100 p-3 rounded-2xl">
                    <FaTrophy className="text-yellow-600 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Most Popular Game
                  </h2>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {mostPopularGame.title}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <FaMusic />
                      {mostPopularGame.songCount} songs
                    </span>
                    <span className="flex items-center gap-1">
                      {mostPopularGame.isPublic ? (
                        <FaGlobe className="text-purple-600" />
                      ) : (
                        <FaLock className="text-gray-500" />
                      )}
                      {mostPopularGame.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Created{" "}
                    {new Date(mostPopularGame.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Genre Distribution */}
          {genreDistribution.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-100 p-3 rounded-2xl">
                  <FaFire className="text-pink-600 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Genre Distribution
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {genreDistribution.map((genre, index) => (
                  <div
                    key={genre.genre}
                    className="text-center p-4 bg-gray-50 rounded-2xl"
                  >
                    <p className="font-semibold text-gray-800">{genre.genre}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {genre.count}
                    </p>
                    <p className="text-xs text-gray-500">songs</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <FaClock className="text-purple-600 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Recent Activity
                </h2>
              </div>

              <div className="space-y-4">
                {recentActivity.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {game.songCount} songs •{" "}
                        {game.isPublic ? "Public" : "Private"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(game.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(overview.totalGames || 0) === 0 && (
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 text-center">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No Data Yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first music game to start seeing analytics and
                insights about your games.
              </p>
              <button
                onClick={() => navigate("/create")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300"
              >
                Create Your First Game
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyticsPage;
