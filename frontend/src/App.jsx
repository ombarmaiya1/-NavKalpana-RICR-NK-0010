import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MockInterviewStart from './pages/interview/MockInterviewStart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MockInterviewStart />} />
      </Routes>
    </Router>
  );
}

export default App;
