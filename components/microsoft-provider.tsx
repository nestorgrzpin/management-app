'use client'

import { ReactNode, useEffect, useState } from 'react'
import { getMsalInstance } from '@/lib/microsoft-auth'

export function MicrosoftProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        const msalInstance = await getMsalInstance()
        if (msalInstance) {
          await msalInstance.initialize()
          console.log('[v0] MSAL initialized')
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('[v0] Error initializing MSAL:', error)
        setIsInitialized(true) // Continue anyway
      }
    }

    initialize()
  }, [])

  if (!isInitialized) {
    return <div>Inicializando...</div>
  }

  return <>{children}</>
}
