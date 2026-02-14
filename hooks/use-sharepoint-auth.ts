'use client'

import { useState, useCallback } from 'react'

let msalInstance: any = null

export function useSharePointAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const initMsal = useCallback(async () => {
    if (msalInstance) return msalInstance

    try {
      const { PublicClientApplication } = await import('@azure/msal-browser')
      const { msalConfig, loginRequest } = await import('@/lib/msal-config')

      msalInstance = new PublicClientApplication(msalConfig)
      await msalInstance.initialize()
      return msalInstance
    } catch (error) {
      console.error('[v0] Error initializing MSAL:', error)
      return null
    }
  }, [])

  const login = useCallback(async () => {
    setIsLoading(true)
    try {
      const instance = await initMsal()
      if (!instance) return

      const { loginRequest } = await import('@/lib/msal-config')
      await instance.loginPopup(loginRequest)
      setIsAuthenticated(true)
      await getToken()
    } catch (error) {
      console.error('[v0] Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [initMsal])

  const getToken = useCallback(async () => {
    try {
      const instance = await initMsal()
      if (!instance) return null

      const { loginRequest } = await import('@/lib/msal-config')
      const accounts = instance.getAllAccounts()

      if (accounts.length === 0) return null

      const response = await instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: accounts[0],
      })

      setAccessToken(response.accessToken)
      return response.accessToken
    } catch (error) {
      console.error('[v0] Error getting token:', error)
      return null
    }
  }, [initMsal])

  const checkAuth = useCallback(async () => {
    try {
      const instance = await initMsal()
      if (!instance) return

      const accounts = instance.getAllAccounts()
      if (accounts.length > 0) {
        setIsAuthenticated(true)
        await getToken()
      }
    } catch (error) {
      console.error('[v0] Error checking auth:', error)
    }
  }, [initMsal, getToken])

  return {
    isAuthenticated,
    accessToken,
    isLoading,
    login,
    getToken,
    checkAuth,
  }
}
