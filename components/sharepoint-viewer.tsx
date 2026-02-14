'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, LogIn } from 'lucide-react'
import { msalInstance, loginRequest } from '@/lib/microsoft-auth'

interface SharePointViewerProps {
  documentUrl?: string | null
  documentName?: string | null
}

export default function SharePointViewer({ documentUrl, documentName }: SharePointViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        console.log('[v0] User already authenticated')
        setIsAuthenticated(true)
        await getAccessToken()
      }
    } catch (error) {
      console.error('[v0] Error checking authentication:', error)
    }
  }

  const getAccessToken = async () => {
    try {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length === 0) {
        return null
      }

      const account = accounts[0]
      const response = await msalInstance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account,
      })

      console.log('[v0] Access token acquired')
      setAccessToken(response.accessToken)
      return response.accessToken
    } catch (error) {
      console.error('[v0] Error acquiring token:', error)
      return null
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await msalInstance.loginPopup(loginRequest)
      console.log('[v0] User logged in:', response.account?.username)
      setIsAuthenticated(true)
      const token = await getAccessToken()
      setAccessToken(token)
    } catch (error) {
      console.error('[v0] Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!documentUrl) {
    return null
  }

  const fileName = documentName || 'Documento'
  const proxyUrl = accessToken
    ? `/api/sharepoint/document?url=${encodeURIComponent(documentUrl)}&token=${accessToken}`
    : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <FileText className="w-4 h-4" />
          Ver documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{fileName}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('[v0] Opening document in new tab:', documentUrl)
              window.open(documentUrl, '_blank', 'noopener,noreferrer')
            }}
            title="Abrir en SharePoint"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <p className="text-center text-gray-600">
                Necesitas autenticarte con Microsoft para acceder a documentos privados de SharePoint
              </p>
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Autenticando...' : 'Iniciar sesión con Microsoft'}
              </Button>
            </div>
          ) : proxyUrl ? (
            <iframe
              src={proxyUrl}
              width="100%"
              height="600"
              frameBorder="0"
              title={fileName}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Cargando documento...</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          <p>Si el documento no se carga, haz click en "Abrir" para verlo en SharePoint</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
