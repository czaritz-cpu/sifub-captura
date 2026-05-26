import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/buscar') }, [user])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
      background: 'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.06) 0%, transparent 60%)',
    }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>

        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--accent-dim)', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 26 }}>📋</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>SIFUB 95</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 32 }}>
          Sistema de Captura PCD
        </p>

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={loginWithGoogle}
          style={{ gap: 12 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#fff" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#fff" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
            <path fill="#fff" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
            <path fill="#fff" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.48a4.77 4.77 0 014.48-3.3z"/>
          </svg>
          Entrar con Google
        </button>

        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 20 }}>
          Solo cuentas autorizadas por el administrador pueden acceder.
        </p>
      </div>
    </div>
  )
}
