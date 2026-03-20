import OpenAI from "openai";
import {
  toolDefinitions,
  executeTool,
  isDestructive,
} from "./assistantTools.js";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is missing");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── System Prompt ───

function buildSystemPrompt(context) {
  let prompt = `You are the Guessify AI Assistant — a helpful, friendly assistant built into the Guessify game creation platform.

Your job is to help game hosts create, manage, and improve their music guessing games.

You can:
- Answer questions about the user's games (titles, songs, settings, etc.)
- Create new games with real songs
- Add or remove songs from existing games
- Rename games and update settings (guess time, input method, visibility)
- Search for real songs to add to games

CRITICAL RULES:
1. NEVER invent or hallucinate song data. Always use the searchSongs tool first to find real songs, then use those exact results (with trackId, previewUrl, etc.) when creating games or adding songs.
2. When the user asks to create a game with songs, ALWAYS search for songs first, then create the game with the real search results.
3. For destructive actions (removing songs, deleting games), clearly describe what you're about to do and ask for confirmation.
4. Be concise but helpful. Use short responses unless the user asks for detail.
5. If the user references "this game" or "the current game", use the page context provided below.
6. You can respond in the same language the user writes in (Hebrew or English).

Game settings reference:
- Guess time limit options: 15, 30, 45, or 60 seconds
- Guess input methods: "freeText" (players type freely) or "letterClick" (players click letters to fill in blanks)
- Visibility: public (anyone can join) or private (invite only)`;

  if (context) {
    if (context.currentGameId) {
      prompt += `\n\nPage Context: The user is currently viewing game ID "${context.currentGameId}".`;
      if (context.currentGameTitle) {
        prompt += ` Game title: "${context.currentGameTitle}".`;
      }
    }
    if (context.page) {
      prompt += `\nCurrent page: ${context.page}`;
    }
  }

  return prompt;
}

// ─── Main Chat Handler ───

/**
 * Process a user message through the AI assistant.
 * Handles the full tool-calling loop:
 *   user message → LLM → tool calls → execute → feed results back → final response
 *
 * Returns:
 * {
 *   reply: string,              // The assistant's text response
 *   toolResults: Array,         // Results from executed tools (for frontend cache invalidation)
 *   pendingConfirmation: object | null  // If a destructive action needs confirmation
 * }
 */
export async function chat(userId, message, conversationHistory, context) {
  const openai = getOpenAIClient();

  // Build messages array
  const messages = [
    { role: "system", content: buildSystemPrompt(context) },
  ];

  // Add conversation history (keep last 20 messages to stay within limits)
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-20);
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  // Add current user message
  messages.push({ role: "user", content: message });

  const toolResults = [];
  let pendingConfirmation = null;

  // Tool-calling loop (max 5 iterations to prevent infinite loops)
  const MAX_ITERATIONS = 5;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: toolDefinitions,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 1500,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    // If no tool calls, we have the final text response
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return {
        reply: assistantMessage.content || "I'm not sure how to help with that.",
        toolResults,
        pendingConfirmation,
      };
    }

    // Process tool calls
    messages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      let args;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: "Invalid tool arguments" }),
        });
        continue;
      }

      // Check if this is a destructive action that needs confirmation
      if (isDestructive(toolName)) {
        pendingConfirmation = {
          toolName,
          args,
          toolCallId: toolCall.id,
          description: buildDestructiveDescription(toolName, args),
        };

        // Tell the LLM the action is pending confirmation
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            status: "pending_confirmation",
            message: "This action requires user confirmation before execution.",
            description: pendingConfirmation.description,
          }),
        });
        continue;
      }

      // Execute non-destructive tool
      try {
        const result = await executeTool(userId, toolName, args);
        toolResults.push({ tool: toolName, result });
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: error.message || "Tool execution failed",
          }),
        });
      }
    }
  }

  // If we hit the iteration limit, return what we have
  return {
    reply: "I completed the available operations. Let me know if you need anything else!",
    toolResults,
    pendingConfirmation,
  };
}

// ─── Confirm & Execute a Destructive Action ───

export async function confirmAndExecute(userId, pendingAction) {
  const { toolName, args } = pendingAction;

  if (!isDestructive(toolName)) {
    throw Object.assign(
      new Error("This action does not require confirmation"),
      { status: 400 }
    );
  }

  const result = await executeTool(userId, toolName, args);
  return result;
}

// ─── Helpers ───

function buildDestructiveDescription(toolName, args) {
  switch (toolName) {
    case "removeSongFromGame":
      return `Remove song "${args.songIdentifier}" from the game`;
    case "deleteGame":
      return `Delete the entire game (ID: ${args.gameId}). This cannot be undone.`;
    default:
      return `Execute destructive action: ${toolName}`;
  }
}
