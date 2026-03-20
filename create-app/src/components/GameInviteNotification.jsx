import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../socket";
import { PLAY_APP_URL } from "../constants";

const GameInviteNotification = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    if (!userInfo) return;

    const socket = getSocket({ userId: userInfo._id });

    const handleInvite = (data) => {
      setInvite(data);
      // Auto-dismiss after 15 seconds
      setTimeout(() => setInvite(null), 15000);
    };

    socket.on("gameInvite", handleInvite);
    return () => socket.off("gameInvite", handleInvite);
  }, [userInfo]);

  if (!invite) return null;

  const handleAccept = () => {
    const username = userInfo.firstName;
    window.location.href = `${PLAY_APP_URL}/online/entry?action=join&roomCode=${invite.roomCode}&username=${encodeURIComponent(username)}`;
    setInvite(null);
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-purple-700 to-pink-700 rounded-2xl p-4 shadow-2xl border border-purple-400 border-opacity-30 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎮</div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Game Invite!</p>
            <p className="text-purple-100 text-xs mt-1">
              <span className="font-semibold">{invite.fromUsername}</span> invited you to play{" "}
              <span className="font-semibold">"{invite.gameTitle}"</span>
            </p>
            <p className="text-purple-200 text-xs mt-0.5">
              {invite.playerCount}/{invite.maxPlayers} players
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAccept}
                className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-green-400 transition-all"
              >
                Join Game
              </button>
              <button
                onClick={() => setInvite(null)}
                className="bg-white bg-opacity-20 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-opacity-30 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInviteNotification;
