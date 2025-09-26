import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Forum from './pages/Forum'
import ResourceLibrary from './pages/ResourceLibrary'
import ScreeningTests from './pages/ScreeningTests'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import PostPage from './pages/PostPage'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './styles/index.css';
// We will use the App.css from the previous step for the main layout
import './styles/App.css'; 

// CHANGED: Renamed 'Layout' to 'MainLayout' for clarity.
// This layout is ONLY for pages that need the sidebar, header, and footer.
function MainLayout({ children }) {
  return (
    <>
      {/* The sticky header now lives outside the flex container */}
      <Header />
      <div className="app-layout"> {/* This class comes from App.css */}
        <Sidebar />
        <div className="main-content"> {/* This class also comes from App.css */}
          <main style={{ flex: 1, padding: '16px' }}>{children}</main>
          <Footer />
        </div>
      </div>
    </>
  )
}

export default function App() {
  return (
    // REMOVED: The old <Layout> wrapper is gone from here.
    // Instead, we will wrap specific routes with the MainLayout.
    <Routes>
      {/* --- Routes WITHOUT the main layout --- */}
      {/* These routes will now appear on their own, without the sidebar/header */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* --- Routes WITH the main layout --- */}
      {/* All the routes that need the sidebar and header are nested here */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/forum" element={<MainLayout><Forum /></MainLayout>} />
      <Route path="/resources" element={<MainLayout><ResourceLibrary /></MainLayout>} />
      <Route path="/tests" element={<MainLayout><ScreeningTests /></MainLayout>} />
      <Route path="/posts/:id" element={<MainLayout><PostPage /></MainLayout>} />
      <Route
        path="/admin"
        element={<MainLayout><ProtectedRoute><Admin /></ProtectedRoute></MainLayout>}
      />
      <Route
        path="/profile"
        element={<MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout>}
      />
      
      {/* The "Not Found" page can be styled differently or use the main layout */}
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  )
}
