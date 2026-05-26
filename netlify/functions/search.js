import { google } from 'googleapis'

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

function normalize(s) {
  if (!s) return ''
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }
  try {
    const q = normalize(event.queryStringParameters?.q || '')
    if (!q) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Parámetro q requerido' }) }

    const auth    = getAuth()
    const sheets  = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'general'

    const [padronRes, controlRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${sheetName}!A:H` }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'CONTROL!A:B' }).catch(() => ({ data: { values: [] } })),
    ])

    const rows    = padronRes.data.values || []
    const control = new Set((controlRes.data.values || []).slice(1).map(r => String(r[0])))

    const header = rows[0] || []
    const idx = {
      acuse:   header.findIndex(h => /acuse/i.test(h)),
      padron:  header.findIndex(h => /padron/i.test(h)),
      paterno: header.findIndex(h => /paterno/i.test(h)),
      materno: header.findIndex(h => /materno/i.test(h)),
      nombre:  header.findIndex(h => /nombre/i.test(h)),
      curp:    header.findIndex(h => /curp/i.test(h)),
      legajo:  header.findIndex(h => /legajo/i.test(h)),
    }

    const results = rows.slice(1)
      .filter(row => {
        const vals = [
          row[idx.acuse], row[idx.padron], row[idx.paterno],
          row[idx.materno], row[idx.nombre], row[idx.curp],
        ]
        return vals.some(v => normalize(v).includes(q))
      })
      .slice(0, 20)
      .map(row => ({
        no_acuse:   String(row[idx.acuse]  || ''),
        id_padron:  String(row[idx.padron] || ''),
        paterno:    row[idx.paterno] || '',
        materno:    row[idx.materno] || '',
        nombre:     row[idx.nombre]  || '',
        curp:       row[idx.curp]    || '',
        legajo:     row[idx.legajo]  || '',
        capturado:  control.has(String(row[idx.acuse] || '')),
      }))

    return { statusCode: 200, headers, body: JSON.stringify({ results }) }
  } catch (e) {
    console.error(e)
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) }
  }
}
