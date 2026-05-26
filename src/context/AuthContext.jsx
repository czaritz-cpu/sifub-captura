import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('sifub_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    if (token) {
      try {
        const u = JSON.parse(atob(token))
        setUser(u)
        sessionStorage.setItem('sifub_user', JSON.stringify(u))
        window.history.replaceState({}, '', window.location.pathname)
      } catch {}
    }
    setLoading(false)
  }, [])

  const loginWithGoogle = () => {
    window.location.href = '/.netlify/functions/auth-google-start'
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('sifub_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
