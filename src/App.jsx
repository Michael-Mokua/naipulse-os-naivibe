import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';
import AuthSuccessPage from './pages/AuthSuccessPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import SocialFeedPage from './pages/SocialFeedPage.jsx';
import SafeRoutePage from './pages/SafeRoutePage.jsx';
import CommunityWatchPage from './pages/CommunityWatchPage.jsx';
import EventCalendarPage from './pages/EventCalendarPage.jsx';
import LostAndFoundPage from './pages/LostAndFoundPage.jsx';
import SmartCarpoolPage from './pages/SmartCarpoolPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/feed" element={<SocialFeedPage />} />
      <Route path="/safe-routes" element={<SafeRoutePage />} />
      <Route path="/community-watch" element={<CommunityWatchPage />} />
      <Route path="/events" element={<EventCalendarPage />} />
      <Route path="/lost-found" element={<LostAndFoundPage />} />
      <Route path="/carpool" element={<SmartCarpoolPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth/success" element={<AuthSuccessPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
