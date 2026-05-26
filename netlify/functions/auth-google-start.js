export const handler = async () => {
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.URL + '/.netlify/functions/auth-google-callback'

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  })

  return {
    statusCode: 302,
    headers: { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}` },
    body: '',
  }
}
