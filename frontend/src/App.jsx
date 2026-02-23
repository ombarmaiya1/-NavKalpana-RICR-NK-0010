import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/landing/Landing';
import Dashboard from './pages/learning/Dashboard';
import ResumeAnalysis from './pages/learning/ResumeAnalysis';
import LearningPage from './pages/learning/LearningPage';
import AssignmentPage from './pages/assignments/AssignmentPage';
import AssignmentDetail from './pages/assignments/AssignmentDetail';
import InterviewPage from './pages/interview/InterviewPage';
import MockInterviewStart from './pages/interview/MockInterviewStart';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import QuizSetup from './pages/quiz/QuizSetup';
import QuizSession from './pages/quiz/QuizSession';
import QuizResult from './pages/quiz/QuizResult';
import Settings from './pages/settings/Settings';
import './index.css';

/**
 * App — root component.
 * ThemeProvider wraps everything so every component (MainLayout,
 * Navbar, ThemeToggle) can access useTheme().
 *
 * Add more <Route> entries here as new pages are built.
 */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page at root */}
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-analysis" element={<ResumeAnalysis />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/assignments" element={<AssignmentPage />} />
          <Route path="/assignments/:assignmentId" element={<AssignmentDetail />} />
          <Route path="/mock-interview" element={<MockInterviewStart />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />

          {/* Quiz Flow */}
          <Route path="/quiz-setup" element={<QuizSetup />} />
          <Route path="/quiz-session/:quizId" element={<QuizSession />} />
          <Route path="/quiz-result/:quizId" element={<QuizResult />} />

          {/* 404 fallback → also goes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
