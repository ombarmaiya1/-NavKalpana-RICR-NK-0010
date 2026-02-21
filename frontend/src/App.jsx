import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import MockInterviewStart from './pages/interview/MockInterviewStart';
import './index.css';

/**
 * App — root component.
 * Wrap all page content with <ThemeProvider> so every child
 * can access useTheme(). Navbar is placed at the top-level
 * layout; individual page routes go below the Navbar.
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MockInterviewStart />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
