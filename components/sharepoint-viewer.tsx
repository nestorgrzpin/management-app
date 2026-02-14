'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, LogIn, Loader2 } from 'lucide-react'
import { useSharePointAuth } from '@/hooks/use-sharepoint-auth'

interface SharePointViewerProps {
  documentUrl?: string | null
  documentName?: string | null
}

export default function SharePointViewer({ documentUrl, documentName }: SharePointViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, accessToken, isLoading, login, checkAuth } = useSharePointAuth()

  useEffect(() => {
    if (isOpen) {
      checkAuth()
    }
  }, [isOpen, checkAuth])

  if (!documentUrl) return null

  const fileName = documentName || 'Documento'

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
            onClick={() => window.open(documentUrl, '_blank', 'noopener,noreferrer')}
            title="Abrir en SharePoint"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex items-center justify-center">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <p className="text-center text-gray-600">
                Necesitas autenticarte con Microsoft para acceder a documentos privados
              </p>
              <Button onClick={login} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Iniciar sesión con Microsoft
                  </>
                )}
              </Button>
            </div>
          ) : accessToken ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`}
              width="100%"
              height="600"
              frameBorder="0"
              title={fileName}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-gray-500">Cargando documento...</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          <p>Si el documento no se carga correctamente, haz click en "Abrir" para verlo en SharePoint</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
