import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/App.css'; // Import the new layout CSS

export default function AppLayout() {
  return (
    <>
      <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Outlet /> {/* Your page components (Home, Forum, etc.) render here */}
        </main>
      </div>
    </>
  );
}