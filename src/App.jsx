import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login     from './pages/Login'
import Buscar    from './pages/Buscar'
import Captura   from './pages/Captura'
import Dashboard from './pages/Dashboard'
import { Loader } from 'lucide-react'

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
      <Loader size={28} className="spin" color="var(--accent)" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.rol !== 'admin') return <Navigate to="/buscar" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/buscar"    element={<Protected><Buscar /></Protected>} />
        <Route path="/captura"   element={<Protected><Captura /></Protected>} />
        <Route path="/dashboard" element={<Protected adminOnly><Dashboard /></Protected>} />
        <Route path="*"          element={<Navigate to="/buscar" replace />} />
      </Routes>
    </AuthProvider>
  )
}
