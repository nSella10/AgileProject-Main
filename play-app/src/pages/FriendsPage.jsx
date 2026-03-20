import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../socket";
import { BASE_URL } from "../constants";

const PRESENCE_LABELS = {
  online: { text: "Online", color: "bg-green-400" },
  in_lobby: { text: "In Lobby", color: "bg-yellow-400" },
  in_game: { text: "In Game", color: "bg-blue-400" },
  offline: { text: "Offline", color: "bg-gray-400" },
};

const FriendsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState("friends"); // "friends" | "requests" | "search"
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [friendsPresence, setFriendsPresence] = useState({});

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/friends`, {
        credentials: "include",
      });
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/friends/requests`, {
        credentials: "include",
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/online/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      await Promise.all([fetchFriends(), fetchRequests()]);
      setLoading(false);
    };
    load();

    // Request friends presence
    const socket = getSocket({ userId: user._id });
    socket.emit("getFriendsPresence");

    socket.on("friendsPresence", (data) => {
      setFriendsPresence(data);
    });

    socket.on("friendPresenceUpdate", ({ userId: uid, status, roomCode }) => {
      setFriendsPresence((prev) => ({
        ...prev,
        [uid]: { status, roomCode },
      }));
    });

    return () => {
      socket.off("friendsPresence");
      socket.off("friendPresenceUpdate");
    };
  }, [user, fetchFriends, fetchRequests]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/friends/search?q=${encodeURIComponent(searchQuery.trim())}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send request");
      toast.success(data.message || "Friend request sent!");
      // Re-search to update buttons
      handleSearch();
      fetchFriends();
      fetchRequests();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAccept = async (friendshipId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/friends/accept/${friendshipId}`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to accept");
      toast.success("Friend request accepted!");
      fetchFriends();
      fetchRequests();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (friendshipId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/friends/reject/${friendshipId}`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to reject");
      toast.success("Request rejected");
      fetchRequests();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveFriend = async (friendshipId, name) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/friends/${friendshipId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to remove");
      toast.success(`Removed ${name} from friends`);
      fetchFriends();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleJoinFriendGame = (roomCode) => {
    navigate("/online", { state: { joinRoomCode: roomCode } });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4 py-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/online")}
            className="text-purple-200 hover:text-white transition-colors text-lg"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">👥 Friends</h1>
          <div className="w-16"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("friends")}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all text-sm ${
              tab === "friends"
                ? "bg-purple-600 text-white"
                : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20"
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => {
              setTab("requests");
              fetchRequests();
            }}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all text-sm relative ${
              tab === "requests"
                ? "bg-purple-600 text-white"
                : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20"
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("search")}
            className={`flex-1 py-2 rounded-xl font-semibold transition-all text-sm ${
              tab === "search"
                ? "bg-purple-600 text-white"
                : "bg-white bg-opacity-10 text-purple-200 hover:bg-opacity-20"
            }`}
          >
            Search
          </button>
        </div>

        {/* Friends List */}
        {tab === "friends" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 text-center">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-white text-lg font-semibold mb-2">
                  No friends yet
                </p>
                <p className="text-purple-200 text-sm mb-4">
                  Search for players to add them as friends!
                </p>
                <button
                  onClick={() => setTab("search")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-6 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              friends.map((friend) => {
                const p = friendsPresence[friend._id] || {
                  status: "offline",
                  roomCode: null,
                };
                const presenceInfo = PRESENCE_LABELS[p.status] || PRESENCE_LABELS.offline;
                return (
                  <div
                    key={friend.friendshipId}
                    className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {friend.firstName[0]}
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${presenceInfo.color} rounded-full border-2 border-purple-900`}
                          ></div>
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {friend.firstName} {friend.lastName}
                          </p>
                          <p className="text-purple-300 text-xs">
                            {presenceInfo.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.status === "in_lobby" && p.roomCode && (
                          <button
                            onClick={() => handleJoinFriendGame(p.roomCode)}
                            className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-400 transition-all"
                          >
                            Join Game
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleRemoveFriend(
                              friend.friendshipId,
                              friend.firstName
                            )
                          }
                          className="text-red-300 hover:text-red-400 text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Friend Requests */}
        {tab === "requests" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-white text-lg font-semibold">
                  No pending requests
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {req.requester.firstName[0]}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {req.requester.firstName} {req.requester.lastName}
                        </p>
                        <p className="text-purple-300 text-xs">
                          {req.requester.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="bg-green-500 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-green-400 transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="bg-red-500 bg-opacity-50 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-opacity-70 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search */}
        {tab === "search" && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name or email..."
                className="flex-1 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={searching || searchQuery.trim().length < 2}
                className="bg-purple-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-purple-500 disabled:bg-gray-600 transition-all"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>

            <div className="space-y-3">
              {searchResults.map((result) => (
                <div
                  key={result._id}
                  className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 border border-white border-opacity-20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {result.firstName[0]}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {result.firstName} {result.lastName}
                        </p>
                        <p className="text-purple-300 text-xs">
                          {result.email}
                        </p>
                      </div>
                    </div>
                    {result.friendship ? (
                      result.friendship.status === "accepted" ? (
                        <span className="text-green-400 text-sm font-semibold">
                          Friends ✓
                        </span>
                      ) : result.friendship.status === "pending" ? (
                        result.friendship.isRequester ? (
                          <span className="text-yellow-300 text-sm">
                            Request Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(result._id)}
                            className="bg-green-500 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-green-400 transition-all"
                          >
                            Accept
                          </button>
                        )
                      ) : null
                    ) : (
                      <button
                        onClick={() => handleSendRequest(result._id)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
