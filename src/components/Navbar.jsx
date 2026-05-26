import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, LayoutDashboard, Search } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header style={{
      background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, gap: 12,
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.04em', color: 'var(--accent)' }}>
          SIFUB <span style={{ color: 'var(--text3)', fontWeight: 400 }}>95</span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.rol === 'admin' && (
            <button
              className={`btn btn-ghost ${loc.pathname === '/dashboard' ? 'active' : ''}`}
              style={{ height: 36, padding: '0 14px', fontSize: 13 }}
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard size={15} /> Dashboard
            </button>
          )}
          <button
            className="btn btn-ghost"
            style={{ height: 36, padding: '0 14px', fontSize: 13 }}
            onClick={() => navigate('/buscar')}
          >
            <Search size={15} /> Buscar
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingLeft: 12, borderLeft: '1px solid var(--border)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--accent-dim)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'var(--accent)',
            }}>
              {(user?.nombre || user?.email || '?')[0].toUpperCase()}
            </div>
            <button className="btn btn-ghost" style={{ height: 36, padding: '0 12px' }} onClick={handleLogout}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
