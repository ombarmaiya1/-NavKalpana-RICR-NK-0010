import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import StudentDashboard from './pages/learning/Dashboard';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import './index.css';

/**
 * App — root component.
 * Wrap all page content with <ThemeProvider> so every child
 * can access useTheme().
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
