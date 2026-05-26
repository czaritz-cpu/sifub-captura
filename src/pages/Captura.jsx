import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import PhotoSlot from '../components/PhotoSlot'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { buildFolderName, buildFileName, fullName } from '../lib/utils'

const SLOTS = ['frontal', 'trasera', 'acuse', 'foto']

export default function Captura() {
  const { state }   = useLocation()
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const { toasts, show } = useToast()

  const beneficiario = state?.beneficiario
  const [fotos, setFotos]     = useState({})
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(null)
  const [blocked, setBlocked] = useState(false)

  if (!beneficiario) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text2)' }}>No se seleccionó ningún beneficiario.</p>
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/buscar')}>
            ← Volver a buscar
          </button>
        </div>
      </div>
    )
  }

  const allReady = SLOTS.every(s => fotos[s])
  const handleChange = (tipo, file) => setFotos(f => ({ ...f, [tipo]: file }))
  const handleClear  = (tipo)       => setFotos(f => { const n = { ...f }; delete n[tipo]; return n })

  const handleSave = async () => {
    if (!allReady) { show('Debes cargar las 4 fotos obligatorias', 'error'); return }
    if (blocked)   { show('Ya se está guardando, espera...', 'error'); return }
    if (beneficiario.capturado) { show('Este beneficiario ya fue capturado anteriormente', 'error'); return }

    if (!user?.access_token) {
      show('Sesión expirada. Por favor vuelve a iniciar sesión con Google.', 'error')
      return
    }

    setSaving(true); setBlocked(true)
    try {
      const fd = new FormData()
      fd.append('beneficiario',      JSON.stringify(beneficiario))
      fd.append('capturista_nombre', user?.nombre || user?.email || 'Desconocido')
      fd.append('capturista_email',  user?.email  || '')
      fd.append('access_token',      user.access_token)

      SLOTS.forEach(tipo => {
        const ext  = fotos[tipo].name.split('.').pop() || 'jpg'
        const name = buildFileName(beneficiario, tipo) + '.' + ext
        fd.append(tipo, fotos[tipo], name)
      })

      const res  = await fetch('/.netlify/functions/guardar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')

      setDone({ carpeta: buildFolderName(beneficiario), driveUrl: data.driveUrl })
    } catch (e) {
      show(e.message, 'error')
      setBlocked(false)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ paddingTop: 48, textAlign: 'center' }}>
          <div className="fade-up" style={{ maxWidth: 480, margin: '0 auto' }}>
            <CheckCircle size={56} color="var(--accent)" style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>¡Captura guardada!</h2>
            <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 28 }}>
              El expediente fue creado correctamente en Google Drive.
            </p>
            <div style={{
              background: 'var(--bg3)', borderRadius: 'var(--radius)',
              padding: '14px 18px', textAlign: 'left', marginBottom: 24,
            }}>
              <div className="label" style={{ marginBottom: 8 }}>Expediente creado</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>
                {done.carpeta}
              </div>
            </div>
            {done.driveUrl && (
              <a href={done.driveUrl} target="_blank" rel="noreferrer"
                className="btn btn-ghost btn-full" style={{ marginBottom: 12 }}>
                Ver en Google Drive ↗
              </a>
            )}
            <button className="btn btn-primary btn-full" onClick={() => navigate('/buscar')}>
              Nueva captura
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <Toast toasts={toasts} />
      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>

        <button className="btn btn-ghost"
          style={{ marginBottom: 20, height: 36, padding: '0 12px', fontSize: 13 }}
          onClick={() => navigate('/buscar')}>
          <ArrowLeft size={15} /> Volver
        </button>

        {beneficiario.capturado && (
          <div style={{
            background: 'var(--warn-dim)', border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 'var(--radius)', padding: '12px 16px',
            color: 'var(--warn)', fontSize: 14, marginBottom: 20, fontWeight: 600,
          }}>
            ⚠️ Este beneficiario ya tiene una captura previa. Guardar creará un duplicado.
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="label" style={{ marginBottom: 12 }}>Datos del beneficiario</div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{fullName(beneficiario)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
            {[
              ['No. Acuse',   beneficiario.no_acuse],
              ['ID Padrón',   beneficiario.id_padron],
              ['Ap. Paterno', beneficiario.paterno],
              ['Ap. Materno', beneficiario.materno],
              ['Nombre',      beneficiario.nombre],
              ['CURP',        beneficiario.curp],
              ['Legajo',      beneficiario.legajo],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <div className="label" style={{ marginBottom: 3 }}>{lbl}</div>
                <div className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>{val || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="label">Fotografías obligatorias</div>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text3)' }}>
              {SLOTS.filter(s => fotos[s]).length}/4
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SLOTS.map(tipo => (
              <PhotoSlot key={tipo} tipo={tipo}
                file={fotos[tipo]} onChange={handleChange} onClear={handleClear} />
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handleSave}
          disabled={!allReady || saving || blocked}
        >
          {saving
            ? <><Loader size={18} className="spin" /> Guardando en Drive...</>
            : <><Send size={18} /> Guardar expediente</>}
        </button>

        {!allReady && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
            Carga las 4 fotos para habilitar el guardado
          </p>
        )}
      </div>
    </div>
  )
}