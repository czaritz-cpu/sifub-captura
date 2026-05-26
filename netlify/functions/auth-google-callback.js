export const handler = async (event) => {
  const code        = event.queryStringParameters?.code
  const redirectUri = process.env.URL + '/.netlify/functions/auth-google-callback'
  const appUrl      = process.env.URL || 'http://localhost:8888'
  if (!code) return redirect(appUrl + '/login?error=no_code')
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (tokens.error) return redirect(appUrl + '/login?error=token_failed')

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    const profile = await profileRes.json()
    const email   = profile.email?.toLowerCase()
    const allowed = JSON.parse(process.env.ALLOWED_USERS || '[]')
    const match   = allowed.find(u => u.email?.toLowerCase() === email)
    if (!match) return redirect(appUrl + '/login?error=not_authorized')

    const user = {
      email,
      nombre:       profile.name || match.nombre || email,
      rol:          match.rol || 'capturista',
      access_token: tokens.access_token,   // ← NUEVO: necesario para subir a Drive
    }
    const token = Buffer.from(JSON.stringify(user)).toString('base64')
    return redirect(`${appUrl}/buscar?token=${token}`)
  } catch (e) {
    console.error(e)
    return redirect(appUrl + '/login?error=server_error')
  }
}

function redirect(url) {
  return { statusCode: 302, headers: { Location: url }, body: '' }
}