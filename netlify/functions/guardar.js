import { google } from 'googleapis'
import { Readable } from 'stream'

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
}

function normalize(s) {
  if (!s) return ''
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s]/gi, ' ').replace(/\s+/g, '_').trim().toUpperCase()
}

function buildFolderName(b) {
  return [b.no_acuse, b.id_padron, b.paterno, b.materno, b.nombre].map(normalize).join('_')
}

function buildFileName(b, tipo) {
  const prefix = `${normalize(b.no_acuse)}_${normalize(b.id_padron)}`
  const tipos  = { frontal: 'IDENTIFICACION_FRONTAL', trasera: 'IDENTIFICACION_TRASERA', acuse: 'ACUSE', foto: 'FOTO' }
  return `${prefix}_${tipos[tipo]}`
}

function parseMultipart(event) {
  const boundary = event.headers['content-type']?.match(/boundary=(.+)/)?.[1]
  if (!boundary) throw new Error('No boundary')
  const body   = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
  const parts  = {}
  const sep    = Buffer.from('--' + boundary)
  let pos      = 0

  while (pos < body.length) {
    const start = body.indexOf(sep, pos)
    if (start === -1) break
    const hStart = start + sep.length + 2
    const hEnd   = body.indexOf(Buffer.from('\r\n\r\n'), hStart)
    if (hEnd === -1) break
    const headers = body.slice(hStart, hEnd).toString()
    const nameMatch    = headers.match(/name="([^"]+)"/)
    const filenameMatch = headers.match(/filename="([^"]+)"/)
    const dataStart = hEnd + 4
    const dataEnd   = body.indexOf(Buffer.from('\r\n' + '--' + boundary), dataStart)
    if (dataEnd === -1) break
    const data = body.slice(dataStart, dataEnd)
    if (nameMatch) {
      parts[nameMatch[1]] = {
        data,
        filename: filenameMatch?.[1] || null,
        text: !filenameMatch ? data.toString() : null,
      }
    }
    pos = dataEnd + 2
  }
  return parts
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }
  const headers = { 'Content-Type': 'application/json' }

  try {
    const parts = parseMultipart(event)
    const b     = JSON.parse(parts.beneficiario?.text || '{}')
    const capturista_nombre = parts.capturista_nombre?.text || 'Desconocido'
    const capturista_email  = parts.capturista_email?.text  || ''

    if (!b.no_acuse) throw new Error('Datos del beneficiario incompletos')

    const SLOTS = ['frontal', 'trasera', 'acuse', 'foto']
    for (const s of SLOTS) {
      if (!parts[s]?.data?.length) throw new Error(`Falta imagen: ${s}`)
    }

    const auth  = getAuth()
    const drive = google.drive({ version: 'v3', auth })
    const sheets = google.sheets({ version: 'v4', auth })

    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    const sheetId      = process.env.GOOGLE_SHEET_ID

    const folderName = buildFolderName(b)

    const existing = await drive.files.list({
      q: `name='${folderName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
    })
    if (existing.data.files?.length > 0) {
      throw new Error('Este beneficiario ya fue capturado anteriormente (expediente duplicado)')
    }

    const folder = await drive.files.create({
      requestBody: {
        name:     folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents:  [rootFolderId],
      },
      fields: 'id,webViewLink',
    })
    const folderId  = folder.data.id
    const folderUrl = folder.data.webViewLink

    for (const tipo of SLOTS) {
      const part = parts[tipo]
      const ext  = part.filename?.split('.').pop() || 'jpg'
      const name = buildFileName(b, tipo) + '.' + ext
      const stream = Readable.from(part.data)
      await drive.files.create({
        requestBody: { name, parents: [folderId] },
        media:       { mimeType: 'image/jpeg', body: stream },
        fields:      'id',
      })
    }

    const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
    const fullname = [b.paterno, b.materno, b.nombre].filter(Boolean).join(' ')

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range:         'CONTROL!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          b.no_acuse, b.id_padron, fullname, b.curp || '',
          b.legajo || '', capturista_nombre, capturista_email,
          now, folderUrl,
        ]],
      },
    })

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, driveUrl: folderUrl }) }
  } catch (e) {
    console.error(e)
    return { statusCode: 400, headers, body: JSON.stringify({ error: e.message }) }
  }
}
