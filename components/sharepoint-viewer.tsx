'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, X } from 'lucide-react'

interface SharePointViewerProps {
  documentUrl?: string | null
  documentName?: string | null
}

export default function SharePointViewer({ documentUrl, documentName }: SharePointViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!documentUrl) {
    return null
  }

  // Convert SharePoint URL to embeddable format if needed
  const getEmbedUrl = (url: string) => {
    // For SharePoint Online files, use the Office Online embed format
    if (url.includes('sharepoint.com')) {
      // Replace /view with /embed for embedding
      const embedUrl = url.replace('/view', '/embed')
      return embedUrl
    }
    return url
  }

  const embedUrl = getEmbedUrl(documentUrl)
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
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>{fileName}</span>
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              title="Abrir en SharePoint"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <iframe
            src={embedUrl}
            width="100%"
            height="600"
            frameBorder="0"
            title={fileName}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          <p>Si el documento no se carga, haz click en el icono externo para abrirlo en SharePoint</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
