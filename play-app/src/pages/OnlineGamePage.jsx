import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSocket } from "../socket";
import GamePlayScreen from "../components/GameFlow/GamePlayScreen";

const OnlineGamePage = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // From navigation state
  const initState = location.state || {};
  const [username] = useState(initState.username || "");
  const [emoji, setEmoji] = useState(initState.emoji || "");
  const [gameTitle] = useState(initState.gameTitle || "Online Game");
  const [isCreator] = useState(initState.isCreator || false);
  const [songCount] = useState(initState.songCount || 0);
  const [guessInputMethod] = useState(initState.guessInputMethod || "freeText");

  // Waiting room state
  const [players, setPlayers] = useState(initState.players || []);
  const [gameStarted, setGameStarted] = useState(false);
  const [autoStartCountdown, setAutoStartCountdown] = useState(null);

  // Game state
  const [guess, setGuess] = useState("");
  const [hasGuessedThisRound, setHasGuessedThisRound] = useState(false);
  const [isWaitingBetweenRounds, setIsWaitingBetweenRounds] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [songNumber, setSongNumber] = useState(1);
  const [totalSongs, setTotalSongs] = useState(songCount || 1);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [maxTime, setMaxTime] = useState(initState.guessTimeLimit || 15);
  const [roundFailedForUser, setRoundFailedForUser] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [answerDetails, setAnswerDetails] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [currentSongTitle, setCurrentSongTitle] = useState("");
  const [leaderboard, setLeaderboard] = useState(null);

  // Audio ref for playing songs on player device
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const timerInterval = useRef(null);

  // Redirect if no state
  useEffect(() => {
    if (!initState.username) {
      navigate("/online");
    }
  }, [initState.username, navigate]);

  // Audio playback for online mode
  const playAudio = useCallback((audioUrl, duration) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
    });

    // Stop audio after duration
    setTimeout(() => {
      if (audioRef.current === audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }, duration);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // --- Waiting Room Events ---
    socket.on("onlinePlayerUpdate", ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
    });

    socket.on("onlineAutoStartCountdown", ({ seconds }) => {
      setAutoStartCountdown(seconds);
    });

    socket.on("onlineAutoStartCancelled", () => {
      setAutoStartCountdown(null);
    });

    socket.on("onlineGameStarting", ({ totalSongs: total, guessTimeLimit }) => {
      setGameStarted(true);
      setTotalSongs(total);
      setMaxTime(guessTimeLimit);
      setStatusMsg("Game is starting!");
    });

    // --- Game Events (reused from existing flow) ---
    socket.on(
      "nextRound",
      ({ audioUrl, roundNumber, songNumber: sNum, totalSongs: total, duration, currentSong }) => {
        setStatusMsg(`Round ${roundNumber} - Song is playing...`);
        setHasGuessedThisRound(false);
        setIsWaitingBetweenRounds(false);
        setRoundFailedForUser(false);
        setSongNumber(sNum);
        setTotalSongs(total);
        setSubmitted(false);
        setGuessResult(null);
        setAnswerDetails(null);
        setIsAudioPlaying(true);
        setGuess("");

        if (currentSong && currentSong.title) {
          setCurrentSongTitle(currentSong.title);
        }

        // Clear previous timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (timerInterval.current) clearInterval(timerInterval.current);
        setTimeLeft(null);

        // Play audio on player's device (online mode)
        if (audioUrl) {
          playAudio(audioUrl, duration);
        }

        // Fallback timer in case timerStarted never comes
        const fallbackDuration = duration || 3000;
        timeoutRef.current = setTimeout(() => {
          setIsAudioPlaying(false);
          setTimeLeft(15);
          setMaxTime(15);
          timerInterval.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timerInterval.current);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        }, fallbackDuration + 2000);
      }
    );

    socket.on("timerStarted", ({ roundDeadline, guessTimeLimit }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setStatusMsg("Listen and guess!");
      setIsAudioPlaying(false);

      const now = Date.now();
      const msLeft = roundDeadline - now;
      const seconds = Math.max(1, Math.ceil(msLeft / 1000));
      setTimeLeft(seconds);
      setMaxTime(guessTimeLimit);

      if (timerInterval.current) clearInterval(timerInterval.current);

      timerInterval.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        setIsWaitingBetweenRounds(true);
      }, msLeft);
    });

    socket.on("answerFeedback", ({ correct, skipped, score, answerType, matchedText }) => {
      if (skipped) {
        setGuessResult("skipped");
        setAnswerDetails(null);
        setIsAudioPlaying(false);
      } else {
        setGuessResult(correct ? "correct" : "wrong");
        if (correct) {
          setAnswerDetails({ score, answerType, matchedText });
        } else {
          setAnswerDetails(null);
        }
      }

      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setTimeLeft(null);
    });

    socket.on("roundSucceeded", () => {
      setStatusMsg("Someone got it! Next song coming up...");
      setHasGuessedThisRound(true);
      setIsWaitingBetweenRounds(true);
      setRoundFailedForUser(false);

      if (timerInterval.current) clearInterval(timerInterval.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimeLeft(null);
    });

    socket.on("roundFailed", () => {
      setStatusMsg("No one guessed it. Moving on...");
      setHasGuessedThisRound(true);
      setIsWaitingBetweenRounds(true);
      setRoundFailedForUser(true);

      if (timerInterval.current) clearInterval(timerInterval.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimeLeft(null);
    });

    socket.on("correctAnswer", ({ scores, username: correctUser, score, answerType }) => {
      // Someone answered correctly - show notification
      if (correctUser !== username) {
        toast.info(`${correctUser} scored ${score} points!`, { autoClose: 2000 });
      }
    });

    socket.on("gameOver", ({ leaderboard: lb }) => {
      setStatusMsg("Game over! Thanks for playing.");
      setIsGameOver(true);
      setLeaderboard(lb);

      if (timerInterval.current) clearInterval(timerInterval.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    });

    socket.on("onlineError", (msg) => {
      toast.error(msg);
    });

    return () => {
      socket.off("onlinePlayerUpdate");
      socket.off("onlineAutoStartCountdown");
      socket.off("onlineAutoStartCancelled");
      socket.off("onlineGameStarting");
      socket.off("nextRound");
      socket.off("timerStarted");
      socket.off("answerFeedback");
      socket.off("roundSucceeded");
      socket.off("roundFailed");
      socket.off("correctAnswer");
      socket.off("gameOver");
      socket.off("onlineError");

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [username, playAudio]);

  const handleSubmitGuess = () => {
    if (!guess.trim() || hasGuessedThisRound) return;
    const socket = getSocket();
    socket.emit("submitAnswer", {
      roomCode,
      username,
      answer: guess,
    });
    setGuess("");
    setHasGuessedThisRound(true);
    setSubmitted(true);
  };

  const handleSkipSong = () => {
    if (hasGuessedThisRound) return;
    const socket = getSocket();
    socket.emit("skipSong", { roomCode, username });
    setHasGuessedThisRound(true);
    setSubmitted(true);
    setGuessResult("skipped");
    setIsAudioPlaying(false);
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit("startOnlineGame", { roomCode });
  };

  const handleLeaveRoom = () => {
    const socket = getSocket();
    socket.emit("leaveOnlineRoom", { roomCode });
    navigate("/online");
  };

  // --- Waiting Room UI ---
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-6 border border-white border-opacity-20 shadow-2xl">
            {/* Room Header */}
            <div className="mb-4">
              <div className="text-4xl mb-2">🌐</div>
              <h2 className="text-2xl font-bold text-white">{gameTitle}</h2>
              <p className="text-purple-200 text-sm mt-1">
                Room Code: <span className="font-mono font-bold text-white">{roomCode}</span>
              </p>
              <p className="text-purple-200 text-sm">
                🎵 {songCount} songs
              </p>
            </div>

            {/* Your info */}
            <div className="bg-purple-600 bg-opacity-30 rounded-xl p-3 mb-4">
              <p className="text-white font-semibold">
                {emoji} {username} {isCreator && "(Host)"}
              </p>
            </div>

            {/* Players List */}
            <div className="mb-4">
              <h3 className="text-purple-200 text-sm font-semibold mb-2">
                Players ({players.length})
              </h3>
              <div className="space-y-2">
                {players.map((p) => (
                  <div
                    key={p.username}
                    className="bg-white bg-opacity-10 rounded-xl px-4 py-2 flex items-center justify-between"
                  >
                    <span className="text-white">
                      {p.emoji} {p.username}
                    </span>
                    {p.isCreator && (
                      <span className="text-yellow-300 text-xs font-bold">
                        HOST
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-start countdown */}
            {autoStartCountdown !== null && autoStartCountdown > 0 && (
              <div className="bg-green-500 bg-opacity-20 rounded-xl p-3 mb-4 border border-green-400 border-opacity-30">
                <p className="text-green-200 font-semibold">
                  Game starting in {autoStartCountdown}s...
                </p>
              </div>
            )}

            {/* Waiting message or Start button */}
            {players.length < 2 ? (
              <div className="bg-yellow-500 bg-opacity-20 rounded-xl p-4 border border-yellow-400 border-opacity-30">
                <div className="flex justify-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <p className="text-yellow-200 text-sm">
                  Waiting for more players to join... (need at least 2)
                </p>
              </div>
            ) : isCreator ? (
              <button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                Start Game Now
              </button>
            ) : (
              <div className="bg-blue-500 bg-opacity-20 rounded-xl p-4 border border-blue-400 border-opacity-30">
                <p className="text-blue-200 text-sm">
                  {autoStartCountdown
                    ? `Game will auto-start in ${autoStartCountdown}s`
                    : "Waiting for host to start the game..."}
                </p>
              </div>
            )}

            {/* Leave button */}
            <button
              onClick={handleLeaveRoom}
              className="mt-4 text-purple-300 hover:text-white text-sm underline transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Game Over UI ---
  if (isGameOver && leaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-48 h-48 bg-yellow-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-400 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-6 border border-white border-opacity-20 shadow-2xl">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-6">Game Over!</h2>

            {/* Leaderboard */}
            <div className="space-y-3 mb-6">
              {leaderboard.map((entry) => {
                const medals = ["🥇", "🥈", "🥉"];
                const isMe = entry.username === username;
                return (
                  <div
                    key={entry.username}
                    className={`rounded-xl p-3 flex items-center justify-between ${
                      isMe
                        ? "bg-yellow-500 bg-opacity-30 border border-yellow-400 border-opacity-50"
                        : "bg-white bg-opacity-10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {medals[entry.place - 1] || `#${entry.place}`}
                      </span>
                      <span className="text-lg">{entry.emoji}</span>
                      <span className={`font-bold ${isMe ? "text-yellow-200" : "text-white"}`}>
                        {entry.username}
                        {isMe && " (You)"}
                      </span>
                    </div>
                    <span className="text-yellow-300 font-bold text-lg">
                      {entry.score} pts
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/online")}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Back to Lobby
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-white bg-opacity-10 text-white font-bold py-3 rounded-xl hover:bg-opacity-20 transition-all"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Active Game UI - Reuse existing GamePlayScreen ---
  return (
    <GamePlayScreen
      guess={guess}
      statusMsg={statusMsg}
      onGuessChange={setGuess}
      onSubmitGuess={handleSubmitGuess}
      onSkipSong={handleSkipSong}
      hasGuessed={hasGuessedThisRound || isGameOver}
      isWaiting={isWaitingBetweenRounds}
      isGameOver={isGameOver}
      songNumber={songNumber}
      totalSongs={totalSongs}
      submitted={submitted}
      timeLeft={timeLeft}
      maxTime={maxTime}
      roundFailedForUser={roundFailedForUser}
      guessResult={guessResult}
      answerDetails={answerDetails}
      isAudioPlaying={isAudioPlaying}
      guessInputMethod={guessInputMethod}
      currentSongTitle={currentSongTitle}
      isGamePaused={false}
      pauseReason=""
    />
  );
};

export default OnlineGamePage;
