'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink, X } from 'lucide-react'

interface DocumentViewerProps {
  documentUrl?: string
  documentTitle?: string
  isOpen: boolean
  onClose: () => void
}

export function DocumentViewer({
  documentUrl,
  documentTitle,
  isOpen,
  onClose,
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!documentUrl) return null

  // Determine if it's an Office document that can be previewed
  const isOfficeDoc = /\.(docx?|xlsx?|pptx?)$/i.test(documentUrl)
  const isSharePoint = documentUrl.includes('sharepoint')

  // SharePoint Office Web Apps Preview URL
  const getSharePointPreviewUrl = (url: string) => {
    try {
      const encoded = encodeURIComponent(url)
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`
    } catch {
      return null
    }
  }

  const previewUrl = isSharePoint && isOfficeDoc ? getSharePointPreviewUrl(documentUrl) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{documentTitle || 'Visor de Documento'}</DialogTitle>
          <DialogDescription>
            {isSharePoint && isOfficeDoc
              ? 'Vista previa del documento Office'
              : 'Haz clic en el botón de abajo para abrir el documento en SharePoint'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden rounded border bg-gray-50">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              onLoad={() => setIsLoading(false)}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-4">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  {isOfficeDoc
                    ? 'Documento de Office'
                    : 'Este tipo de documento no puede previsualizarse aquí'}
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  {documentUrl}
                </p>
              </div>

              <Button
                onClick={() => window.open(documentUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en SharePoint
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => window.open(documentUrl, '_blank')}
            className="flex-1"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir en Nueva Pestaña
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
