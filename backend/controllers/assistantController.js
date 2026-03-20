import asyncHandler from "../middlewares/asyncHandler.js";
import { chat, confirmAndExecute } from "../services/assistantService.js";

// @desc    Send a message to the AI assistant
// @route   POST /api/assistant/chat
// @access  Private
export const assistantChat = asyncHandler(async (req, res) => {
  const { message, conversationHistory, context } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400);
    throw new Error("Message is required");
  }

  if (message.length > 2000) {
    res.status(400);
    throw new Error("Message too long (max 2000 characters)");
  }

  // Validate context if provided
  const safeContext = {};
  if (context) {
    if (context.currentGameId && typeof context.currentGameId === "string") {
      safeContext.currentGameId = context.currentGameId;
    }
    if (context.currentGameTitle && typeof context.currentGameTitle === "string") {
      safeContext.currentGameTitle = context.currentGameTitle.slice(0, 200);
    }
    if (context.page && typeof context.page === "string") {
      safeContext.page = context.page.slice(0, 100);
    }
  }

  // Validate conversation history
  const safeHistory = [];
  if (Array.isArray(conversationHistory)) {
    for (const msg of conversationHistory.slice(-20)) {
      if (
        msg &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string"
      ) {
        safeHistory.push({
          role: msg.role,
          content: msg.content.slice(0, 3000),
        });
      }
    }
  }

  const result = await chat(
    req.user._id,
    message.trim(),
    safeHistory,
    safeContext
  );

  res.json({
    reply: result.reply,
    toolResults: result.toolResults,
    pendingConfirmation: result.pendingConfirmation,
  });
});

// @desc    Confirm a destructive action from the assistant
// @route   POST /api/assistant/confirm
// @access  Private
export const assistantConfirm = asyncHandler(async (req, res) => {
  const { pendingAction } = req.body;

  if (
    !pendingAction ||
    !pendingAction.toolName ||
    !pendingAction.args
  ) {
    res.status(400);
    throw new Error("Invalid pending action");
  }

  const result = await confirmAndExecute(req.user._id, pendingAction);

  res.json({
    success: true,
    result,
  });
});
