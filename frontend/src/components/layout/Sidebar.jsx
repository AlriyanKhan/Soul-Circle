import React from 'react';
// Import NavLink instead of Link to get the .active class feature
import { NavLink } from 'react-router-dom';
// import {Link} from 'react-router-dom'; (previously this was there in place of navlink)
import '../../styles/Sidebar.css'; // <-- IMPORT THE CSS

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* Using NavLink will automatically add an "active" class to the link of the current page */}
        <NavLink to="/">Home</NavLink>
        <NavLink to="/tests">Take Test</NavLink>
        <NavLink to="/forum">Forum</NavLink>
        <NavLink to="/resources">Resource Library</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
    </aside>
  );
}