import React, { createContext, useContext, useState, useCallback } from "react";

const AssistantContext = createContext();

export function AssistantProvider({ children }) {
  const [pageContext, setPageContext] = useState({
    page: null,
    currentGameId: null,
    currentGameTitle: null,
  });

  const updatePageContext = useCallback((ctx) => {
    setPageContext((prev) => ({ ...prev, ...ctx }));
  }, []);

  const clearPageContext = useCallback(() => {
    setPageContext({ page: null, currentGameId: null, currentGameTitle: null });
  }, []);

  return (
    <AssistantContext.Provider
      value={{ pageContext, updatePageContext, clearPageContext }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistantContext() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error(
      "useAssistantContext must be used within an AssistantProvider"
    );
  }
  return ctx;
}
