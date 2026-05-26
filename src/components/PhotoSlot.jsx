import React, { useRef } from 'react'
import { Camera, Upload, X, Check } from 'lucide-react'

const LABELS = {
  frontal: 'INE Frontal',
  trasera: 'INE Trasera',
  acuse:   'Acuse Firmado',
  foto:    'Foto Beneficiario',
}

export default function PhotoSlot({ tipo, file, onChange, onClear }) {
  const fileRef   = useRef()
  const cameraRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f) onChange(tipo, f)
    e.target.value = ''
  }

  return (
    <div style={{
      border: `1px solid ${file ? 'rgba(74,222,128,0.3)' : 'var(--border2)'}`,
      borderRadius: 'var(--radius)',
      background: file ? 'rgba(74,222,128,0.04)' : 'var(--bg3)',
      padding: '14px 16px',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: file ? 'var(--accent-dim)' : 'var(--bg4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {file
              ? <Check size={16} color="var(--accent)" />
              : <Upload size={16} color="var(--text3)" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: file ? 'var(--accent)' : 'var(--text2)' }}>
              {LABELS[tipo]}
            </div>
            {file && (
              <div style={{
                fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {file.name}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {!file ? (
            <>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
              <input ref={fileRef}   type="file" accept="image/*"                       style={{ display: 'none' }} onChange={handleFile} />
              <button className="btn btn-ghost" style={{ height: 34, padding: '0 10px', fontSize: 12 }}
                onClick={() => cameraRef.current.click()}>
                <Camera size={14} /> Cámara
              </button>
              <button className="btn btn-ghost" style={{ height: 34, padding: '0 10px', fontSize: 12 }}
                onClick={() => fileRef.current.click()}>
                <Upload size={14} /> Archivo
              </button>
            </>
          ) : (
            <button className="btn btn-danger" style={{ height: 34, padding: '0 10px', fontSize: 12 }}
              onClick={() => onClear(tipo)}>
              <X size={14} /> Quitar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
