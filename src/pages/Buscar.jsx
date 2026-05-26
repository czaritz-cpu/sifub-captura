import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Loader } from 'lucide-react'
import Navbar from '../components/Navbar'
import { fullName } from '../lib/utils'

export default function Buscar() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const search = useCallback(async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true); setError(''); setSearched(false)
    try {
      const res  = await fetch(`/.netlify/functions/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al buscar')
      setResults(data.results || [])
      setSearched(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [query])

  const onKey = (e) => { if (e.key === 'Enter') search() }

  const select = (b) => navigate('/captura', { state: { beneficiario: b } })

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Buscar beneficiario</h2>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>
            Busca por Acuse, ID Padrón, nombre, apellidos o CURP
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            className="input-field"
            placeholder="Ej: 2267200 o ALCANTARA o REPK750927..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            autoFocus
          />
          <button className="btn btn-primary" onClick={search} disabled={loading || !query.trim()}>
            {loading ? <Loader size={16} className="spin" /> : <Search size={16} />}
          </button>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-dim)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 'var(--radius)', padding: '12px 16px',
            color: 'var(--danger)', fontSize: 14, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15 }}>No se encontraron resultados para <strong style={{ color: 'var(--text2)' }}>"{query}"</strong></p>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((b, i) => (
              <button
                key={i}
                onClick={() => select(b)}
                className="card fade-up"
                style={{
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', transition: 'border-color 0.15s',
                  border: '1px solid var(--border)',
                  animationDelay: `${i * 0.04}s`,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: b.capturado ? 'var(--accent-dim)' : 'var(--bg4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {b.capturado ? '✅' : '📄'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                    {fullName(b)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    Acuse: {b.no_acuse} &nbsp;·&nbsp; ID: {b.id_padron} &nbsp;·&nbsp; {b.legajo}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span className={`badge ${b.capturado ? 'badge-success' : 'badge-warn'}`}>
                    {b.capturado ? 'Capturado' : 'Pendiente'}
                  </span>
                  <ChevronRight size={16} color="var(--text3)" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
