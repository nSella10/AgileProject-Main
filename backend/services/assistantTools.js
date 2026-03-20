import * as gameService from "./gameService.js";

/**
 * Tool definitions for OpenAI function calling.
 * Each tool maps to a safe, validated backend operation.
 */

// ─── Tool Schemas (OpenAI function calling format) ───

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "listMyGames",
      description:
        "List all games created by the current user. Returns game titles, song counts, settings, and IDs.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "getGameDetails",
      description:
        "Get full details of a specific game including all songs, settings, and metadata.",
      parameters: {
        type: "object",
        properties: {
          gameId: {
            type: "string",
            description: "The MongoDB ID of the game to retrieve",
          },
        },
        required: ["gameId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchSongs",
      description:
        "Search for real songs using iTunes API. Returns song title, artist, preview URL, artwork, and trackId. Use this to find real songs before adding them to a game.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search query - can be song name, artist name, or keywords like 'hebrew pop' or 'Israeli songs'",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createGame",
      description:
        "Create a new music guessing game. Songs MUST come from searchSongs results with real trackId, previewUrl, etc. Never invent song data.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Game title" },
          description: { type: "string", description: "Game description" },
          isPublic: {
            type: "boolean",
            description: "Whether the game is public (default false)",
          },
          guessTimeLimit: {
            type: "number",
            enum: [15, 30, 45, 60],
            description: "Seconds allowed per guess (default 30)",
          },
          guessInputMethod: {
            type: "string",
            enum: ["freeText", "letterClick"],
            description: "How players input guesses (default freeText)",
          },
          songs: {
            type: "array",
            description:
              "Array of songs from searchSongs results. Each must have title, artist, trackId, previewUrl, artworkUrl.",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                artist: { type: "string" },
                trackId: { type: "string" },
                previewUrl: { type: "string" },
                artworkUrl: { type: "string" },
              },
              required: ["title", "artist", "trackId", "previewUrl"],
            },
          },
        },
        required: ["title", "songs"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "renameGame",
      description: "Rename an existing game.",
      parameters: {
        type: "object",
        properties: {
          gameId: { type: "string", description: "The game ID to rename" },
          newTitle: { type: "string", description: "The new title for the game" },
        },
        required: ["gameId", "newTitle"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateGameSettings",
      description:
        "Update game settings like visibility, guess time limit, guess input method, or description.",
      parameters: {
        type: "object",
        properties: {
          gameId: { type: "string", description: "The game ID to update" },
          isPublic: { type: "boolean", description: "Whether the game is public" },
          guessTimeLimit: {
            type: "number",
            enum: [15, 30, 45, 60],
            description: "Seconds allowed per guess",
          },
          guessInputMethod: {
            type: "string",
            enum: ["freeText", "letterClick"],
            description: "How players input guesses",
          },
          description: { type: "string", description: "Game description" },
        },
        required: ["gameId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addSongsToGame",
      description:
        "Add songs to an existing game. Songs MUST come from searchSongs results with real data.",
      parameters: {
        type: "object",
        properties: {
          gameId: { type: "string", description: "The game ID to add songs to" },
          songs: {
            type: "array",
            description: "Array of songs from searchSongs results",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                artist: { type: "string" },
                trackId: { type: "string" },
                previewUrl: { type: "string" },
                artworkUrl: { type: "string" },
              },
              required: ["title", "artist", "trackId", "previewUrl"],
            },
          },
        },
        required: ["gameId", "songs"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "removeSongFromGame",
      description:
        "Remove a song from a game by its trackId or title. This is a destructive action that requires user confirmation.",
      parameters: {
        type: "object",
        properties: {
          gameId: {
            type: "string",
            description: "The game ID to remove a song from",
          },
          songIdentifier: {
            type: "string",
            description: "The trackId or exact title of the song to remove",
          },
        },
        required: ["gameId", "songIdentifier"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteGame",
      description:
        "Delete a game entirely. This is a destructive action that requires user confirmation.",
      parameters: {
        type: "object",
        properties: {
          gameId: {
            type: "string",
            description: "The game ID to delete",
          },
        },
        required: ["gameId"],
      },
    },
  },
];

// ─── Actions that require user confirmation before execution ───

const DESTRUCTIVE_TOOLS = new Set(["removeSongFromGame", "deleteGame"]);

export function isDestructive(toolName) {
  return DESTRUCTIVE_TOOLS.has(toolName);
}

// ─── Tool Executor ───

/**
 * Execute a tool call with the authenticated user's ID.
 * All operations go through gameService which enforces ownership checks.
 */
export async function executeTool(userId, toolName, args) {
  switch (toolName) {
    case "listMyGames": {
      const games = await gameService.listGamesForUser(userId);
      return games.map((g) => ({
        id: g._id,
        title: g.title,
        description: g.description,
        isPublic: g.isPublic,
        songCount: g.songs.length,
        guessTimeLimit: g.guessTimeLimit,
        guessInputMethod: g.guessInputMethod,
        createdAt: g.createdAt,
      }));
    }

    case "getGameDetails": {
      const game = await gameService.getGameById(userId, args.gameId);
      return {
        id: game._id,
        title: game.title,
        description: game.description,
        isPublic: game.isPublic,
        guessTimeLimit: game.guessTimeLimit,
        guessInputMethod: game.guessInputMethod,
        songs: game.songs.map((s) => ({
          title: s.title,
          artist: s.artist,
          trackId: s.trackId,
          hasLyrics: !!(s.lyrics || s.fullLyrics),
        })),
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      };
    }

    case "searchSongs": {
      return gameService.searchSongsFromiTunes(args.query);
    }

    case "createGame": {
      // Validate that songs have real trackIds (not hallucinated)
      validateSongsHaveRealData(args.songs);
      const game = await gameService.createGame(userId, {
        title: args.title,
        description: args.description || "",
        isPublic: args.isPublic ?? false,
        guessTimeLimit: args.guessTimeLimit || 30,
        guessInputMethod: args.guessInputMethod || "freeText",
        songs: args.songs,
      });
      return {
        id: game._id,
        title: game.title,
        songCount: game.songs.length,
        message: `Game "${game.title}" created successfully with ${game.songs.length} songs!`,
      };
    }

    case "renameGame": {
      const game = await gameService.renameGame(userId, args.gameId, args.newTitle);
      return {
        id: game._id,
        title: game.title,
        message: `Game renamed to "${game.title}"`,
      };
    }

    case "updateGameSettings": {
      const { gameId, ...settings } = args;
      const game = await gameService.updateGameSettings(userId, gameId, settings);
      return {
        id: game._id,
        title: game.title,
        isPublic: game.isPublic,
        guessTimeLimit: game.guessTimeLimit,
        guessInputMethod: game.guessInputMethod,
        message: `Game settings updated for "${game.title}"`,
      };
    }

    case "addSongsToGame": {
      validateSongsHaveRealData(args.songs);
      const game = await gameService.addSongsToGame(userId, args.gameId, args.songs);
      return {
        id: game._id,
        title: game.title,
        songCount: game.songs.length,
        addedCount: args.songs.length,
        message: `Added ${args.songs.length} song(s) to "${game.title}". Total songs: ${game.songs.length}`,
      };
    }

    case "removeSongFromGame": {
      const game = await gameService.removeSongFromGame(
        userId,
        args.gameId,
        args.songIdentifier
      );
      return {
        id: game._id,
        title: game.title,
        songCount: game.songs.length,
        message: `Song removed from "${game.title}". Remaining songs: ${game.songs.length}`,
      };
    }

    case "deleteGame": {
      // Get game title before deleting for the confirmation message
      const game = await gameService.getGameById(userId, args.gameId);
      await gameService.deleteGame(userId, args.gameId);
      return {
        deletedGameTitle: game.title,
        message: `Game "${game.title}" has been deleted.`,
      };
    }

    default:
      throw Object.assign(new Error(`Unknown tool: ${toolName}`), {
        status: 400,
      });
  }
}

// ─── Validation Helpers ───

function validateSongsHaveRealData(songs) {
  if (!songs || !Array.isArray(songs) || songs.length === 0) {
    throw Object.assign(new Error("At least one song is required"), {
      status: 400,
    });
  }
  for (const song of songs) {
    if (!song.title || !song.artist) {
      throw Object.assign(
        new Error(`Song missing required fields: title="${song.title}", artist="${song.artist}"`),
        { status: 400 }
      );
    }
    if (!song.trackId || !song.previewUrl) {
      throw Object.assign(
        new Error(
          `Song "${song.title}" is missing trackId or previewUrl. Songs must come from real search results.`
        ),
        { status: 400 }
      );
    }
  }
}
