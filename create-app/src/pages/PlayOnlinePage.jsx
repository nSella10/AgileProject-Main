import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getSocket } from "../socket";
import { BASE_URL, PLAY_APP_URL } from "../constants";
import PageLayout from "../components/PageLayout";
import {
  FaArrowLeft,
  FaUserFriends,
  FaGlobe,
  FaUsers,
  FaLock,
} from "react-icons/fa";

const PlayOnlinePage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [onlineRooms, setOnlineRooms] = useState([]);
  const [publicGames, setPublicGames] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("rooms"); // "rooms" | "create"
  const [roomVisibility, setRoomVisibility] = useState("public");

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  // Set default username from auth
  useEffect(() => {
    if (userInfo && !username) {
      setUsername(userInfo.firstName);
    }
  }, [userInfo, username]);

  // Fetch public games for creating new online rooms
  const fetchPublicGames = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/games/public`);
      const data = await res.json();
      setPublicGames(data);
    } catch (err) {
      console.error("Failed to fetch public games:", err);
    }
  }, []);

  useEffect(() => {
    if (!userInfo) return;

    const socket = getSocket({ userId: userInfo._id });

    // Update presence
    socket.emit("updatePresence", { status: "online" });

    // Request lobby data
    socket.emit("getOnlineRooms");
    fetchPublicGames();

    socket.on("onlineRoomsList", (rooms) => {
      setOnlineRooms(rooms);
      setLoading(false);
    });

    socket.on("onlineLobbyUpdate", (rooms) => {
      setOnlineRooms(rooms);
    });

    socket.on("onlineError", (msg) => {
      toast.error(msg);
    });

    // Refresh lobby every 5 seconds
    const interval = setInterval(() => {
      socket.emit("getOnlineRooms");
    }, 5000);

    return () => {
      socket.off("onlineRoomsList");
      socket.off("onlineLobbyUpdate");
      socket.off("onlineError");
      clearInterval(interval);
    };
  }, [userInfo, fetchPublicGames]);

  const handleJoinRoom = (roomCode) => {
    if (!username.trim()) {
      toast.error("Please enter a nickname first");
      return;
    }
    // Redirect to play-app entry which handles the socket join
    window.location.href = `${PLAY_APP_URL}/online/entry?action=join&roomCode=${roomCode}&username=${encodeURIComponent(username.trim())}`;
  };

  const handleCreateRoom = (gameId) => {
    if (!username.trim()) {
      toast.error("Please enter a nickname first");
      return;
    }
    // Redirect to play-app entry which handles the socket create
    window.location.href = `${PLAY_APP_URL}/online/entry?action=create&gameId=${gameId}&username=${encodeURIComponent(username.trim())}&visibility=${roomVisibility}`;
  };

  if (!userInfo) return null;

  const waitingRooms = onlineRooms.filter((r) => r.status === "waiting");

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-8 sm:py-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-3xl mx-auto px-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-purple-100 hover:text-white mb-4 sm:mb-6 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-center">
              <div className="mb-3">
                <span className="text-4xl sm:text-5xl">🌐</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Play Online
              </h1>
              <p className="text-sm sm:text-lg text-purple-100 max-w-xl mx-auto">
                Join rooms, play with friends, or challenge anyone online
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Friends Quick Access */}
          <button
            onClick={() => navigate("/friends")}
            className="w-full bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6 hover:shadow-xl transition-all group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2.5 rounded-xl">
                  <FaUserFriends className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">Friends</p>
                  <p className="text-gray-500 text-xs">
                    See who's online, send invites, join games
                  </p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all text-lg">
                →
              </span>
            </div>
          </button>

          {/* User Info + Nickname */}
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm">
                Signed in as{" "}
                <span className="text-gray-800 font-semibold">
                  {userInfo.firstName} {userInfo.lastName}
                </span>
              </p>
            </div>
            <label className="text-gray-600 text-sm font-medium mb-1.5 block">
              Display Name (in game)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 20))}
              placeholder="Enter your display name..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              maxLength={20}
            />
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("rooms")}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                tab === "rooms"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              Join a Room ({waitingRooms.length})
            </button>
            <button
              onClick={() => {
                setTab("create");
                fetchPublicGames();
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                tab === "create"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              Create Room
            </button>
          </div>

          {/* Tab Content */}
          {tab === "rooms" && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading rooms...</p>
                </div>
              ) : waitingRooms.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                  <div className="text-4xl mb-4">🎵</div>
                  <p className="text-gray-800 text-lg font-semibold mb-2">
                    No rooms available
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Be the first to create one!
                  </p>
                  <button
                    onClick={() => setTab("create")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-2.5 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
                  >
                    Create a Room
                  </button>
                </div>
              ) : (
                waitingRooms.map((room) => (
                  <div
                    key={room.roomCode}
                    className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-gray-800 font-bold text-lg">
                          {room.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>
                            👥 {room.playerCount}/{room.maxPlayers} players
                          </span>
                          <span>🎵 {room.songCount} songs</span>
                          <span>⏱️ {room.guessTimeLimit}s</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          Created by {room.creatorUsername}
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(room.roomCode)}
                        disabled={!username.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-5 py-2.5 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-105 shadow-lg"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "create" && (
            <div className="space-y-3">
              {/* Room Visibility Selector */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                <label className="text-gray-700 text-sm font-semibold mb-3 block">
                  Room Visibility
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "public", label: "Public", icon: <FaGlobe className="text-purple-600" />, desc: "Anyone can join" },
                    { value: "friends", label: "Friends", icon: <FaUsers className="text-purple-600" />, desc: "Friends only" },
                    { value: "private", label: "Private", icon: <FaLock className="text-gray-500" />, desc: "Invite only" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRoomVisibility(opt.value)}
                      className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
                        roomVisibility === opt.value
                          ? "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400 shadow-md"
                          : "bg-gray-50 border-2 border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div className="text-lg flex justify-center mb-1">{opt.icon}</div>
                      <div className={`text-xs font-semibold mt-0.5 ${roomVisibility === opt.value ? "text-purple-700" : "text-gray-700"}`}>{opt.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {publicGames.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-800 text-lg font-semibold mb-2">
                    No public games available
                  </p>
                  <p className="text-gray-500 text-sm">
                    Game creators need to mark their games as public for them to
                    appear here.
                  </p>
                </div>
              ) : (
                publicGames.map((game) => (
                  <div
                    key={game._id}
                    className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-gray-800 font-bold text-lg">
                          {game.title}
                        </h3>
                        {game.description && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                            {game.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>🎵 {game.songCount} songs</span>
                          <span>⏱️ {game.guessTimeLimit}s</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCreateRoom(game._id)}
                        disabled={!username.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-5 py-2.5 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                      >
                        Host
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PlayOnlinePage;
