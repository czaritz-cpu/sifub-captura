import { google } from 'googleapis'

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

export const handler = async () => {
  const headers = { 'Content-Type': 'application/json' }
  try {
    const auth    = getAuth()
    const sheets  = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'general'

    const [padronRes, controlRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${sheetName}!A:H` }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'CONTROL!A:I' }).catch(() => ({ data: { values: [] } })),
    ])

    const padronRows  = (padronRes.data.values  || []).slice(1)
    const controlRows = (controlRes.data.values || []).slice(1)

    const total      = padronRows.length
    const capturados = controlRows.length
    const pendientes = Math.max(0, total - capturados)

    const legajoIdx = (padronRes.data.values?.[0] || []).findIndex(h => /legajo/i.test(h))
    const legajoMap = {}
    padronRows.forEach(r => {
      const l = r[legajoIdx] || 'Sin legajo'
      if (!legajoMap[l]) legajoMap[l] = { total: 0, capturados: 0 }
      legajoMap[l].total++
    })
    const capturedAcuses = new Set(controlRows.map(r => String(r[0])))
    padronRows.forEach(r => {
      const acuse = String(r[0] || '')
      const l     = r[legajoIdx] || 'Sin legajo'
      if (capturedAcuses.has(acuse) && legajoMap[l]) legajoMap[l].capturados++
    })
    const por_legajo = Object.entries(legajoMap)
      .map(([legajo, v]) => ({ legajo, ...v }))
      .sort((a, b) => a.legajo.localeCompare(b.legajo, 'es', { numeric: true }))

    const captMap = {}
    controlRows.forEach(r => {
      const nombre = r[5] || 'Desconocido'
      if (!captMap[nombre]) captMap[nombre] = { capturas: 0, ultima: r[7] || '' }
      captMap[nombre].capturas++
      if (r[7] > captMap[nombre].ultima) captMap[nombre].ultima = r[7]
    })
    const por_capturista = Object.entries(captMap)
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.capturas - a.capturas)

    const ultimas = controlRows.slice(-10).reverse().map(r => ({
      nombre:      r[2] || '',
      capturista:  r[5] || '',
      fecha:       r[7] || '',
    }))

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ total, capturados, pendientes, por_legajo, por_capturista, ultimas }),
    }
  } catch (e) {
    console.error(e)
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }
  }
}
