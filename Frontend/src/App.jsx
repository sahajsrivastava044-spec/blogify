import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BackgroundIcons from './components/BackgroundIcons';
import './index.css';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user_id = localStorage.getItem('userId');
    if (token) {
      setIsAuthenticated(true);
      setUserId(user_id);
    }
  }, []);

  return (
    <Router>
      <BackgroundIcons />
      <Toaster position="top-right" />
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} setUserId={setUserId} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Home userId={userId} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
