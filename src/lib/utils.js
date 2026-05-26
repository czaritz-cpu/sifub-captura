export function normalize(str) {
  if (!str) return ''
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s_]/gi, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim()
    .toUpperCase()
}

export function buildFolderName(b) {
  const parts = [b.no_acuse, b.id_padron, b.paterno, b.materno, b.nombre]
  return parts.map(normalize).join('_')
}

export function buildFileName(b, tipo) {
  const prefix = `${normalize(String(b.no_acuse))}_${normalize(String(b.id_padron))}`
  const tipos = {
    frontal:  'IDENTIFICACION_FRONTAL',
    trasera:  'IDENTIFICACION_TRASERA',
    acuse:    'ACUSE',
    foto:     'FOTO',
  }
  return `${prefix}_${tipos[tipo]}`
}

export function formatDateTime(d = new Date()) {
  return d.toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
}

export function fullName(b) {
  return [b.paterno, b.materno, b.nombre].filter(Boolean).join(' ')
}
