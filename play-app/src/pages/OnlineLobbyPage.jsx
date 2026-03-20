import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getSocket } from "../socket";
import { BASE_URL } from "../constants";
import { useAuth } from "../context/AuthContext";

const OnlineLobbyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, logout } = useAuth();

  const [onlineRooms, setOnlineRooms] = useState([]);
  const [publicGames, setPublicGames] = useState([]);
  // Default username from authenticated user
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("rooms"); // "rooms" | "create"
  const [roomVisibility, setRoomVisibility] = useState("public"); // "public" | "friends" | "private"

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/online/auth");
    }
  }, [user, authLoading, navigate]);

  // Set default username from auth
  useEffect(() => {
    if (user && !username) {
      setUsername(user.firstName);
    }
  }, [user, username]);

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

  // Auto-join from invite
  useEffect(() => {
    const joinCode = location.state?.joinRoomCode;
    if (joinCode && user && username.trim()) {
      const socket = getSocket({ userId: user._id });
      socket.emit("joinOnlineRoom", { roomCode: joinCode, username: username.trim() });
      // Clear the state so it doesn't re-trigger
      navigate("/online", { replace: true, state: {} });
    }
  }, [location.state, user, username, navigate]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket({ userId: user._id });

    // Update presence to in_lobby
    socket.emit("updatePresence", { status: "in_lobby" });

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

    socket.on("onlineRoomCreated", (data) => {
      toast.success(`Room created! Joining "${data.gameTitle}"...`);
      navigate(`/online/game/${data.roomCode}`, {
        state: {
          username,
          roomCode: data.roomCode,
          emoji: data.emoji,
          gameTitle: data.gameTitle,
          guessTimeLimit: data.guessTimeLimit,
          guessInputMethod: data.guessInputMethod,
          songCount: data.songCount,
          isCreator: true,
          visibility: data.visibility || "public",
        },
      });
    });

    socket.on("onlineRoomJoined", (data) => {
      toast.success(`Joined "${data.gameTitle}"!`);
      navigate(`/online/game/${data.roomCode}`, {
        state: {
          username,
          roomCode: data.roomCode,
          emoji: data.emoji,
          gameTitle: data.gameTitle,
          guessTimeLimit: data.guessTimeLimit,
          guessInputMethod: data.guessInputMethod,
          songCount: data.songCount,
          players: data.players,
          isCreator: false,
        },
      });
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
      socket.off("onlineRoomCreated");
      socket.off("onlineRoomJoined");
      socket.off("onlineError");
      clearInterval(interval);
    };
  }, [navigate, username, fetchPublicGames, user]);

  const handleCreateRoom = (gameId) => {
    if (!username.trim()) {
      toast.error("Please enter a nickname first");
      return;
    }
    const socket = getSocket({ userId: user?._id });
    socket.emit("createOnlineRoom", { gameId, username: username.trim(), visibility: roomVisibility });
  };

  const handleJoinRoom = (roomCode) => {
    if (!username.trim()) {
      toast.error("Please enter a nickname first");
      return;
    }
    const socket = getSocket({ userId: user?._id });
    socket.emit("joinOnlineRoom", { roomCode, username: username.trim() });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-purple-200">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  const waitingRooms = onlineRooms.filter((r) => r.status === "waiting");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 py-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-purple-200 hover:text-white transition-colors text-lg"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">🌐 Online Games</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/online/friends")}
              className="bg-white bg-opacity-10 text-purple-200 hover:text-white hover:bg-opacity-20 text-sm px-3 py-1 rounded-lg transition-all"
            >
              👥 Friends
            </button>
            <button
              onClick={handleLogout}
              className="text-purple-300 hover:text-white text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* User Info + Nickname */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-200 text-sm">
              Signed in as <span className="text-white font-semibold">{user.firstName} {user.lastName}</span>
            </p>
          </div>
          <label className="text-purple-200 text-sm mb-1 block">
            Display Name (in game)
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, 20))}
            placeholder="Enter your display name..."
            className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
            maxLength={20}
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("rooms")}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              tab === "rooms"
                ? "bg-purple-600 text-white"
                : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20"
            }`}
          >
            Join a Room ({waitingRooms.length})
          </button>
          <button
            onClick={() => {
              setTab("create");
              fetchPublicGames();
            }}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
              tab === "create"
                ? "bg-purple-600 text-white"
                : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20"
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
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-purple-200">Loading rooms...</p>
              </div>
            ) : waitingRooms.length === 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 text-center">
                <div className="text-4xl mb-4">🎵</div>
                <p className="text-white text-lg font-semibold mb-2">
                  No rooms available
                </p>
                <p className="text-purple-200 text-sm mb-4">
                  Be the first to create one!
                </p>
                <button
                  onClick={() => setTab("create")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                  Create a Room
                </button>
              </div>
            ) : (
              waitingRooms.map((room) => (
                <div
                  key={room.roomCode}
                  className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20 hover:bg-opacity-15 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">
                        {room.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-purple-200">
                        <span>
                          👥 {room.playerCount}/{room.maxPlayers} players
                        </span>
                        <span>🎵 {room.songCount} songs</span>
                        <span>⏱️ {room.guessTimeLimit}s</span>
                      </div>
                      <p className="text-purple-300 text-xs mt-1">
                        Created by {room.creatorUsername}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.roomCode)}
                      disabled={!username.trim()}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-5 py-2 rounded-xl hover:from-green-400 hover:to-emerald-400 disabled:from-gray-500 disabled:to-gray-600 transition-all transform hover:scale-105 shadow-lg"
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
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20">
              <label className="text-purple-200 text-sm font-semibold mb-2 block">
                Room Visibility
              </label>
              <div className="flex gap-2">
                {[
                  { value: "public", label: "Public", icon: "🌐", desc: "Anyone can join" },
                  { value: "friends", label: "Friends", icon: "👥", desc: "Friends only" },
                  { value: "private", label: "Private", icon: "🔒", desc: "Invite only" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRoomVisibility(opt.value)}
                    className={`flex-1 py-2 px-2 rounded-xl text-center transition-all ${
                      roomVisibility === opt.value
                        ? "bg-purple-600 text-white border border-purple-400"
                        : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20 border border-transparent"
                    }`}
                  >
                    <div className="text-lg">{opt.icon}</div>
                    <div className="text-xs font-semibold mt-0.5">{opt.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {publicGames.length === 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-white text-lg font-semibold mb-2">
                  No public games available
                </p>
                <p className="text-purple-200 text-sm">
                  Game creators need to mark their games as public for them to
                  appear here.
                </p>
              </div>
            ) : (
              publicGames.map((game) => (
                <div
                  key={game._id}
                  className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20 hover:bg-opacity-15 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">
                        {game.title}
                      </h3>
                      {game.description && (
                        <p className="text-purple-200 text-sm mt-1 line-clamp-1">
                          {game.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-sm text-purple-300">
                        <span>🎵 {game.songCount} songs</span>
                        <span>⏱️ {game.guessTimeLimit}s</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateRoom(game._id)}
                      disabled={!username.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-5 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
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
  );
};

export default OnlineLobbyPage;
