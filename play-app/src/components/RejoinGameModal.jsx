import React from "react";

const RejoinGameModal = ({ 
  isOpen, 
  roomCode, 
  username, 
  gameTitle, 
  onAccept, 
  onDecline 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
        <div className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome Back!
            </h2>
            <p className="text-purple-200">
              We found your previous game session
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Game:</span>
                <span className="font-semibold text-white">{gameTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Room Code:</span>
                <span className="font-mono font-bold text-pink-300 text-lg">{roomCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Username:</span>
                <span className="font-semibold text-white">{username}</span>
              </div>
            </div>
          </div>

          <p className="text-purple-200 mb-6 text-sm">
            The game organizer is waiting for you to return.
            Would you like to rejoin the game?
          </p>

          <div className="flex space-x-4">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              No, Start Fresh
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Yes, Rejoin Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejoinGameModal;
