import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaTimes, FaPaperPlane, FaRobot, FaUser, FaCheck, FaBan, FaTrash } from "react-icons/fa";
import {
  useAssistantChatMutation,
  useAssistantConfirmMutation,
} from "../slices/assistantApiSlice";
import { useAssistantContext } from "../context/AssistantContext";
import { invalidateCache, setCurrentGame } from "../slices/gamesSlice";

// ─── LocalStorage persistence ───

const STORAGE_KEY = "guessify_assistant_chat";
const MAX_STORED_MESSAGES = 50;

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm the Guessify AI Assistant. I can help you create games, manage songs, and answer questions about your games. How can I help?",
};

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic shape validation
    if (
      typeof parsed !== "object" ||
      !Array.isArray(parsed.messages)
    ) {
      return null;
    }
    return {
      isOpen: !!parsed.isOpen,
      messages: parsed.messages
        .filter(
          (m) =>
            m &&
            typeof m.content === "string" &&
            (m.role === "user" || m.role === "assistant")
        )
        .slice(-MAX_STORED_MESSAGES),
      // Do NOT restore pendingConfirmation — destructive actions must not persist
    };
  } catch {
    return null;
  }
}

function persistState(isOpen, messages) {
  try {
    const toStore = {
      isOpen,
      messages: messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-MAX_STORED_MESSAGES),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ─── Tools that mutate game data ───

const MUTATING_TOOLS = new Set([
  "createGame",
  "renameGame",
  "updateGameSettings",
  "addSongsToGame",
  "removeSongFromGame",
  "deleteGame",
]);

function hasMutatingToolResult(toolResults) {
  return toolResults?.some((tr) => MUTATING_TOOLS.has(tr.tool));
}

// ─── Component ───

const AssistantChat = () => {
  const persisted = useRef(loadPersistedState()).current;

  const [isOpen, setIsOpen] = useState(persisted?.isOpen ?? false);
  const [messages, setMessages] = useState(
    persisted?.messages?.length > 0
      ? persisted.messages
      : [WELCOME_MESSAGE]
  );
  const [input, setInput] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { pageContext } = useAssistantContext();

  const [sendMessage, { isLoading: isSending }] = useAssistantChatMutation();
  const [confirmAction, { isLoading: isConfirming }] =
    useAssistantConfirmMutation();

  // Persist state when it changes
  useEffect(() => {
    persistState(isOpen, messages);
  }, [isOpen, messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Force UI refresh after assistant mutations
  const handleMutationComplete = useCallback(() => {
    // Clear the Redux freshness cache so useGamesWithState/useGameWithState refetch
    dispatch(invalidateCache());
    // Clear currentGame so EditGamePage refetches fresh data
    dispatch(setCurrentGame(null));
  }, [dispatch]);

  // Build conversation history for the API (only user/assistant text messages)
  const getConversationHistory = useCallback(() => {
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const result = await sendMessage({
        message: trimmed,
        conversationHistory: getConversationHistory(),
        context: pageContext,
      }).unwrap();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);

      if (result.pendingConfirmation) {
        setPendingConfirmation(result.pendingConfirmation);
      }

      // If assistant performed game mutations, force UI to refresh
      if (hasMutatingToolResult(result.toolResults)) {
        handleMutationComplete();
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.data?.message ||
            "Sorry, something went wrong. Please try again.",
          isError: true,
        },
      ]);
    }
  };

  const handleConfirm = async () => {
    if (!pendingConfirmation || isConfirming) return;

    try {
      const result = await confirmAction({
        pendingAction: {
          toolName: pendingConfirmation.toolName,
          args: pendingConfirmation.args,
        },
      }).unwrap();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.result?.message || "Action completed successfully!",
        },
      ]);
      setPendingConfirmation(null);

      // Destructive actions always mutate — force UI refresh
      handleMutationComplete();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.data?.message || "Failed to execute the action.",
          isError: true,
        },
      ]);
      setPendingConfirmation(null);
    }
  };

  const handleReject = () => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Action cancelled. No changes were made." },
    ]);
    setPendingConfirmation(null);
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setPendingConfirmation(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!userInfo) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Open AI Assistant"
        >
          <FaRobot className="text-xl" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <FaRobot className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  AI Assistant
                </h3>
                <p className="text-purple-100 text-xs">
                  {pageContext.currentGameTitle
                    ? `Viewing: ${pageContext.currentGameTitle}`
                    : "Ready to help"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Clear chat"
              >
                <FaTrash className="text-xs" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="bg-purple-100 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <FaRobot className="text-purple-600 text-xs" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed overflow-hidden ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md"
                      : msg.isError
                      ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-md"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words" style={{ overflowWrap: "anywhere" }}>{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                    <FaUser className="text-gray-600 text-xs" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isSending && (
              <div className="flex gap-2 justify-start">
                <div className="bg-purple-100 rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                  <FaRobot className="text-purple-600 text-xs" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation dialog */}
            {pendingConfirmation && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mx-1">
                <p className="text-amber-800 text-sm font-medium mb-2">
                  Confirm action:
                </p>
                <p className="text-amber-700 text-sm mb-3">
                  {pendingConfirmation.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    {isConfirming ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FaCheck className="text-xs" /> Confirm
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isConfirming}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    <FaBan className="text-xs" /> Cancel
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-3 py-3 bg-white shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-20 overflow-y-auto"
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl p-2.5 transition-all duration-200 shrink-0"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantChat;
