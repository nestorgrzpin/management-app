import { PublicClientApplication } from '@azure/msal-browser'

const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
}

const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: `${getSiteUrl()}/auth/microsoft/callback`,
  },
  cache: {
    cacheLocation: 'localStorage' as const,
  },
}

export const msalInstance = new PublicClientApplication(msalConfig)

export const loginRequest = {
  scopes: [
    'User.Read',
    'Files.Read.All',
    'Sites.Read.All',
  ],
}

export const getAccessToken = async () => {
  try {
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length === 0) {
      console.log('[v0] No accounts found, redirecting to login')
      await msalInstance.loginPopup(loginRequest)
      return null
    }

    const account = accounts[0]
    const response = await msalInstance.acquireTokenSilent({
      scopes: loginRequest.scopes,
      account,
    })

    return response.accessToken
  } catch (error) {
    console.error('[v0] Error getting access token:', error)
    return null
  }
}
