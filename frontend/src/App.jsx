import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/learning/Dashboard';
import InterviewPage from './pages/interview/InterviewPage';
import MockInterviewStart from './pages/interview/MockInterviewStart';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import './index.css';

/**
 * App — root router.
 * ThemeProvider wraps everything so every component (MainLayout,
 * Navbar, ThemeToggle) can access useTheme().
 *
 * Add more <Route> entries here as new pages are built.
 * The base path "/" redirects immediately to the Dashboard.
 */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Default: open to StudentDashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mock-interview" element={<MockInterviewStart />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 404 fallback → also goes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
