import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import StudentDashboard from './pages/learning/Dashboard';
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
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
