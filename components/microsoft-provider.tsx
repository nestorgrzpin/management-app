'use client'

import { ReactNode, useEffect, useState } from 'react'

export function MicrosoftProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        // Only try to load MSAL on client side
        if (typeof window === 'undefined') {
          setIsInitialized(true)
          return
        }

        const { getMsalInstance } = await import('@/lib/microsoft-auth')
        const msalInstance = await getMsalInstance()
        
        if (msalInstance) {
          try {
            await msalInstance.initialize()
            console.log('[v0] MSAL initialized successfully')
          } catch (error) {
            console.warn('[v0] MSAL initialize error (non-critical):', error)
          }
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.warn('[v0] MSAL setup error (continuing anyway):', error)
        setIsInitialized(true) // Continue anyway
      }
    }

    initialize()
  }, [])

  return <>{children}</>
}
