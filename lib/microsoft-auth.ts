'use client'

import { getSiteUrl } from './get-site-url'

let msalInstance: any = null

// Lazy load MSAL to avoid module not found errors during build
const initMSAL = async () => {
  if (msalInstance) return msalInstance

  try {
    const msalBrowser = await import('@azure/msal-browser')
    const { PublicClientApplication } = msalBrowser

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

    msalInstance = new PublicClientApplication(msalConfig)
    console.log('[v0] MSAL initialized')
    return msalInstance
  } catch (error) {
    console.error('[v0] Error initializing MSAL:', error)
    return null
  }
}

export const getMsalInstance = async () => {
  return initMSAL()
}

export const loginRequest = {
  scopes: [
    'User.Read',
    'Files.Read.All',
    'Sites.Read.All',
  ],
}

export const getAccessToken = async () => {
  try {
    const instance = await getMsalInstance()
    if (!instance) {
      console.error('[v0] MSAL not initialized')
      return null
    }

    const accounts = instance.getAllAccounts()
    if (accounts.length === 0) {
      console.log('[v0] No accounts found, redirecting to login')
      await instance.loginPopup(loginRequest)
      return null
    }

    const account = accounts[0]
    const response = await instance.acquireTokenSilent({
      scopes: loginRequest.scopes,
      account,
    })

    return response.accessToken
  } catch (error) {
    console.error('[v0] Error getting access token:', error)
    return null
  }
}
