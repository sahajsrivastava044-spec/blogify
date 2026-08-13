import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 Blogify
      </Link>
      <div>
        {isAuthenticated ? (
          <button onClick={handleLogout} className="premium-btn">
            Logout
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login">
              <button className="premium-btn">Login</button>
            </Link>
            <Link to="/register">
              <button className="premium-btn premium-btn-primary">Register</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
