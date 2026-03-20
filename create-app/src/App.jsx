import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CreateGamePage from "./pages/CreateGamePage";
import EditGamePage from "./pages/EditGamePage";
import MyGamesPage from "./pages/MyGamesPage";
import LaunchGamePage from "./pages/LaunchGamePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FinalLeaderboardPage from "./pages/FinalLeaderboardPage";

import PrivateRoute from "./components/PrivateRoute";
import RedirectIfLoggedIn from "./components/RedirectIfLoggedIn";
import ScrollToTop from "./components/ScrollToTop";
import AssistantChat from "./components/AssistantChat";
import NotFoundPage from "./pages/NotFoundPage";
import { AssistantProvider } from "./context/AssistantContext";

// Create App - Game creation and management platform
function App() {
  return (
    <AssistantProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Authentication Routes - Redirect to dashboard if already logged in */}
          <Route element={<RedirectIfLoggedIn redirectTo="/dashboard" />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes - All require authentication */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create" element={<CreateGamePage />} />
            <Route path="/edit-game/:gameId" element={<EditGamePage />} />
            <Route path="/mygames" element={<MyGamesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/launch/:gameId" element={<LaunchGamePage />} />
            <Route path="/final-leaderboard" element={<FinalLeaderboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <AssistantChat />
      </Router>
    </AssistantProvider>
  );
}

export default App;
