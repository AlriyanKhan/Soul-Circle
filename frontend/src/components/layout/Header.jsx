import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Header.css'; // <-- IMPORT THE CSS

export default function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="header">
      <div className="header-logo">
        <h1><Link to="/">SOUL-CIRCLE</Link></h1>
      </div>
      <nav className="header-nav">
        <Link to="/tests">Take Test</Link>
        <Link to="/forum">Forum</Link>
        <Link to="/resources">Resource Library</Link>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            {/* We apply the global .btn class for consistency */}
            <button onClick={logout} className="btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            {/* We use the global .btn and our new .btn-signup class */}
            <Link to="/signup" className="btn btn-signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}