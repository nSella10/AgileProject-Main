// src/hooks/useGames.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useMyGamesQuery,
  useGetGameByIdQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useGetAnalyticsQuery,
} from "../slices/gamesApiSlice";
import {
  setGames,
  addGame,
  updateGame,
  removeGame,
  setCurrentGame,
  setAnalytics,
  setLoading,
  setError,
  clearError,
  selectGames,
  selectCurrentGame,
  selectGamesLoading,
  selectGamesError,
  selectAnalytics,
  selectIsDataFresh,
  selectGameById,
} from "../slices/gamesSlice";

// Hook for managing all games
export const useGamesWithState = () => {
  const dispatch = useDispatch();
  const games = useSelector(selectGames);
  const isLoading = useSelector(selectGamesLoading);
  const error = useSelector(selectGamesError);
  const isDataFresh = useSelector(selectIsDataFresh);

  // Only fetch if data is not fresh
  const {
    data: apiGames,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useMyGamesQuery(undefined, {
    skip: isDataFresh && games.length > 0,
  });

  // Update state when API data changes
  useEffect(() => {
    if (apiGames) {
      dispatch(setGames(apiGames));
    }
  }, [apiGames, dispatch]);

  // Update loading state
  useEffect(() => {
    if (apiLoading !== isLoading) {
      dispatch(setLoading(apiLoading));
    }
  }, [apiLoading, isLoading, dispatch]);

  // Update error state
  useEffect(() => {
    if (apiError) {
      dispatch(setError(apiError?.data?.message || "Failed to load games"));
    } else if (error && !apiError) {
      dispatch(clearError());
    }
  }, [apiError, error, dispatch]);

  return {
    games,
    isLoading: isLoading || apiLoading,
    error: error || apiError?.data?.message,
    refetch,
    refresh: () => {
      dispatch(clearError());
      refetch();
    },
  };
};

// Hook for managing a single game
export const useGameWithState = (gameId) => {
  const dispatch = useDispatch();
  const currentGame = useSelector(selectCurrentGame);
  const gameFromState = useSelector(selectGameById(gameId));
  const isDataFresh = useSelector(selectIsDataFresh);

  // Only skip fetch if we have cached data AND it's still fresh
  const shouldSkip = isDataFresh && gameFromState && (!gameId || gameFromState._id === gameId);

  const {
    data: apiGame,
    isLoading,
    error: apiError,
    refetch,
  } = useGetGameByIdQuery(gameId, {
    skip: !gameId || shouldSkip,
  });

  // Update current game when API data changes
  useEffect(() => {
    if (apiGame) {
      dispatch(setCurrentGame(apiGame));
    } else if (gameFromState && (!currentGame || currentGame._id !== gameId)) {
      dispatch(setCurrentGame(gameFromState));
    }
  }, [apiGame, gameFromState, currentGame, gameId, dispatch]);

  const game = currentGame || gameFromState || apiGame;

  return {
    game,
    isLoading,
    error: apiError?.data?.message,
    refetch,
  };
};

// Hook for creating games
export const useCreateGameWithState = () => {
  const dispatch = useDispatch();
  const [createGameApi, { isLoading, error }] = useCreateGameMutation();

  const createGame = async (gameData) => {
    try {
      const newGame = await createGameApi(gameData).unwrap();
      dispatch(addGame(newGame));
      return newGame;
    } catch (err) {
      dispatch(setError(err?.data?.message || "Failed to create game"));
      throw err;
    }
  };

  return {
    createGame,
    isLoading,
    error: error?.data?.message,
  };
};

// Hook for updating games
export const useUpdateGameWithState = () => {
  const dispatch = useDispatch();
  const [updateGameApi, { isLoading, error }] = useUpdateGameMutation();

  const updateGameData = async (gameData) => {
    try {
      const updatedGame = await updateGameApi(gameData).unwrap();
      dispatch(updateGame({ 
        gameId: gameData.gameId, 
        updatedData: updatedGame 
      }));
      return updatedGame;
    } catch (err) {
      dispatch(setError(err?.data?.message || "Failed to update game"));
      throw err;
    }
  };

  return {
    updateGame: updateGameData,
    isLoading,
    error: error?.data?.message,
  };
};

// Hook for deleting games
export const useDeleteGameWithState = () => {
  const dispatch = useDispatch();
  const [deleteGameApi, { isLoading, error }] = useDeleteGameMutation();

  const deleteGame = async (gameId) => {
    try {
      await deleteGameApi(gameId).unwrap();
      dispatch(removeGame(gameId));
      return true;
    } catch (err) {
      dispatch(setError(err?.data?.message || "Failed to delete game"));
      throw err;
    }
  };

  return {
    deleteGame,
    isLoading,
    error: error?.data?.message,
  };
};

// Hook for analytics
export const useAnalyticsWithState = () => {
  const dispatch = useDispatch();
  const analytics = useSelector(selectAnalytics);
  const isLoading = useSelector(selectGamesLoading);

  const {
    data: apiAnalytics,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useGetAnalyticsQuery();

  // Update state when API data changes
  useEffect(() => {
    if (apiAnalytics) {
      dispatch(setAnalytics(apiAnalytics));
    }
  }, [apiAnalytics, dispatch]);

  return {
    analytics: analytics || apiAnalytics,
    isLoading: isLoading || apiLoading,
    error: apiError?.data?.message,
    refetch,
  };
};
