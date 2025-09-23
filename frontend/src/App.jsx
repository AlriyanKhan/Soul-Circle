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

function Layout({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '16px' }}>{children}</main>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/resources" element={<ResourceLibrary />} />
        <Route path="/tests" element={<ScreeningTests />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
