import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, TrendingUp, Users, CheckSquare, Clock } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function StatCard({ icon, label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { size: 18, color })}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.rol !== 'admin') { navigate('/buscar'); return }
    fetch('/.netlify/functions/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="page">
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Loader size={28} className="spin" color="var(--accent)" />
      </div>
    </div>
  )

  if (error) return (
    <div className="page"><Navbar />
      <div className="container" style={{ paddingTop: 40, color: 'var(--danger)' }}>{error}</div>
    </div>
  )

  const pct = data ? Math.round((data.capturados / data.total) * 100) : 0

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Dashboard</h2>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>SIFUB 95 — Avance de captura</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard icon={<CheckSquare />} label="Capturados"  value={data.capturados} color="var(--accent)" />
          <StatCard icon={<Clock />}       label="Pendientes"  value={data.pendientes} color="var(--warn)" />
          <StatCard icon={<TrendingUp />}  label="Avance"      value={`${pct}%`}        color="var(--info)" />
          <StatCard icon={<Users />}       label="Total padrón" value={data.total}      color="var(--text2)" />
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="label">Progreso general</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 100 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 100, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {data.por_legajo?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="label" style={{ marginBottom: 14 }}>Avance por legajo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.por_legajo.map(l => {
                const p = Math.round((l.capturados / l.total) * 100)
                return (
                  <div key={l.legajo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{l.legajo}</span>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {l.capturados}/{l.total} — {p}%
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg4)', borderRadius: 100 }}>
                      <div style={{ height: '100%', width: `${p}%`, background: p === 100 ? 'var(--accent)' : 'var(--info)', borderRadius: 100 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {data.por_capturista?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="label" style={{ marginBottom: 14 }}>Producción por capturista</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Capturista', 'Capturas', 'Última captura'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text3)', fontWeight: 600, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.por_capturista.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{c.nombre}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className="badge badge-success">{c.capturas}</span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{c.ultima}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.ultimas?.length > 0 && (
          <div className="card">
            <div className="label" style={{ marginBottom: 14 }}>Últimas capturas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.ultimas.map((u, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: 'var(--bg3)',
                  borderRadius: 'var(--radius)', fontSize: 13,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.nombre}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {u.capturista} · {u.fecha}
                    </div>
                  </div>
                  <span className="badge badge-success">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
