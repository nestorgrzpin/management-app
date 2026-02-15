'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink } from 'lucide-react'

interface SharePointViewerProps {
  documentUrl?: string | null
  documentName?: string | null
}

export default function SharePointViewer({ documentUrl, documentName }: SharePointViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

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
            onClick={() => {
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
          <iframe
            src={documentUrl}
            width="100%"
            height="600"
            frameBorder="0"
            title={fileName}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          <p>Si el documento no se carga correctamente, haz clic en "Abrir" para verlo en SharePoint</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
