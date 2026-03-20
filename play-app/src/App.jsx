import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import JoinGamePage from "./pages/JoinGamePage";
import OnlineAuthPage from "./pages/OnlineAuthPage";
import OnlineLobbyPage from "./pages/OnlineLobbyPage";
import OnlineGamePage from "./pages/OnlineGamePage";
import FriendsPage from "./pages/FriendsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";
import GameInviteNotification from "./components/GameInviteNotification";

// Play App - Game participation platform
function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Home - Mode selection */}
          <Route path="/" element={<HomePage />} />

          {/* Local Game - guest flow, no auth required */}
          <Route path="/join" element={<JoinGamePage />} />

          {/* Online Game - authenticated flow */}
          <Route path="/online/auth" element={<OnlineAuthPage />} />
          <Route path="/online" element={<OnlineLobbyPage />} />
          <Route path="/online/game/:roomCode" element={<OnlineGamePage />} />
          <Route path="/online/friends" element={<FriendsPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <GameInviteNotification />
      </Router>
    </AuthProvider>
  );
}

export default App;
