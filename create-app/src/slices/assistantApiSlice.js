import { apiSlice } from "./apiSlice";
import { ASSISTANT_URL } from "../constants";

export const assistantApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    assistantChat: builder.mutation({
      query: (data) => ({
        url: `${ASSISTANT_URL}/chat`,
        method: "POST",
        body: data,
      }),
      // Invalidate Game tags when assistant performs mutations
      invalidatesTags: (result) => {
        if (result?.toolResults?.length > 0) {
          const mutatingTools = [
            "createGame",
            "renameGame",
            "updateGameSettings",
            "addSongsToGame",
            "removeSongFromGame",
            "deleteGame",
          ];
          const hasMutation = result.toolResults.some((tr) =>
            mutatingTools.includes(tr.tool)
          );
          if (hasMutation) return ["Game"];
        }
        return [];
      },
    }),
    assistantConfirm: builder.mutation({
      query: (data) => ({
        url: `${ASSISTANT_URL}/confirm`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Game"],
    }),
  }),
});

export const { useAssistantChatMutation, useAssistantConfirmMutation } =
  assistantApiSlice;
