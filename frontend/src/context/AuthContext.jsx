import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  useEffect(() => {
    setAuthToken(token)
    if (token) {
      localStorage.setItem('token', token)
      api.get('/api/auth/me').then(res => setUser(res.data.user)).catch(() => setUser(null))
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [token])

  const login = (t, u) => { setToken(t); setUser(u) }
  const logout = () => { setToken(null); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
