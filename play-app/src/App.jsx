import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import JoinGamePage from "./pages/JoinGamePage";
import OnlineEntryPage from "./pages/OnlineEntryPage";
import OnlineGamePage from "./pages/OnlineGamePage";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";

// Play App - Session participation platform
// Handles: local join by code, online game entry, and gameplay sessions
function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Home - Local join entry */}
          <Route path="/" element={<HomePage />} />

          {/* Local Game - guest flow, no auth required */}
          <Route path="/join" element={<JoinGamePage />} />

          {/* Online Game - entry from authenticated hub (create-app) */}
          <Route path="/online/entry" element={<OnlineEntryPage />} />
          <Route path="/online/game/:roomCode" element={<OnlineGamePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
