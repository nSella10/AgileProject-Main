import React, { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL, PLAY_APP_URL } from "../constants";
import {
  FaPlus,
  FaChartLine,
  FaGamepad,
  FaUsers,
  FaMusic,
  FaArrowRight,
  FaUserFriends,
  FaGlobe,
  FaEnvelopeOpenText,
  FaList,
} from "react-icons/fa";

const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [friendsCount, setFriendsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [friends, setFriends] = useState([]);
  const [loadingSocial, setLoadingSocial] = useState(true);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/friends`, { credentials: "include" }),
          fetch(`${BASE_URL}/api/friends/requests`, { credentials: "include" }),
        ]);

        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          setFriends(friendsData);
          setFriendsCount(friendsData.length);
        }
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequestsCount(requestsData.length);
        }
      } catch (err) {
        console.error("Failed to fetch social data:", err);
      } finally {
        setLoadingSocial(false);
      }
    };

    fetchSocialData();
  }, []);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="mb-4">
              <span className="text-5xl">🎵</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Welcome back, {userInfo?.firstName || "Player"}!
            </h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Play with friends, join online games, or create new music
              challenges
            </p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
              <FaUserFriends className="text-purple-500 text-xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-800">
                {loadingSocial ? "..." : friendsCount}
              </p>
              <p className="text-gray-500 text-xs font-medium">Friends</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
              <FaEnvelopeOpenText className="text-pink-500 text-xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-800">
                {loadingSocial ? "..." : requestsCount}
              </p>
              <p className="text-gray-500 text-xs font-medium">
                Friend Requests
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
              <FaGlobe className="text-indigo-500 text-xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-800">Live</p>
              <p className="text-gray-500 text-xs font-medium">Online Games</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 text-center">
              <FaMusic className="text-green-500 text-xl mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-800">Ready</p>
              <p className="text-gray-500 text-xs font-medium">To Play</p>
            </div>
          </div>
        </div>

        {/* Two Main Sections */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ========== PLAY & SOCIAL SECTION ========== */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                  <FaGamepad className="text-white text-lg" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Play & Social
                </h2>
              </div>

              <div className="space-y-4">
                {/* Play Online Card */}
                <Link
                  to="/play-online"
                  className="group block bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      <FaGlobe className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        Play Online
                      </h3>
                      <p className="text-purple-100 text-sm">
                        Join rooms, play with friends, or challenge anyone online
                      </p>
                    </div>
                    <FaArrowRight className="text-white text-xl group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* Friends Card */}
                <Link
                  to="/friends"
                  className="group block bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                      <FaUserFriends className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          Friends
                        </h3>
                        {requestsCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                            {requestsCount} new
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">
                        {friendsCount > 0
                          ? `${friendsCount} friends — see who's online and playing`
                          : "Find players and add them as friends"}
                      </p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                {/* Friends Preview (if any friends exist) */}
                {friends.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-600">
                        Your Friends
                      </p>
                      <Link
                        to="/friends"
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View all →
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {friends.slice(0, 8).map((friend) => (
                        <div
                          key={friend.friendshipId || friend._id}
                          className="flex items-center gap-2 bg-purple-50 rounded-full px-3 py-1.5"
                        >
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {friend.firstName?.[0]}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {friend.firstName}
                          </span>
                        </div>
                      ))}
                      {friends.length > 8 && (
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5">
                          <span className="text-sm text-gray-500">
                            +{friends.length - 8} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Local Play Card */}
                <a
                  href={`${PLAY_APP_URL}/join`}
                  className="group block bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                      <FaUsers className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        Join Local Game
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Join a game in the same room with a code
                      </p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </a>
              </div>
            </div>

            {/* ========== CREATE & MANAGE SECTION ========== */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-2 rounded-xl">
                  <FaPlus className="text-white text-lg" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Create & Manage
                </h2>
              </div>

              <div className="space-y-4">
                {/* Create Game Card */}
                <Link
                  to="/create"
                  className="group block bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      <FaPlus className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        Create New Game
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Build a new music quiz with your favorite songs
                      </p>
                    </div>
                    <FaArrowRight className="text-white text-xl group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* My Games Card */}
                <Link
                  to="/mygames"
                  className="group block bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                      <FaList className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        My Games
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Manage, edit, and launch your existing games
                      </p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>

                {/* Analytics Card */}
                <Link
                  to="/analytics"
                  className="group block bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                      <FaChartLine className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        Analytics
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Track performance and player engagement
                      </p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
