import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentUrl = searchParams.get('url')
    const accessToken = searchParams.get('token')

    if (!documentUrl || !accessToken) {
      console.error('[v0] Missing documentUrl or accessToken')
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log('[v0] Fetching document from SharePoint:', documentUrl)

    // Fetch the document from SharePoint using the access token
    const response = await fetch(documentUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/octet-stream',
      },
    } as any)

    if (!response.ok) {
      console.error('[v0] SharePoint API error:', response.status, await response.text())
      return NextResponse.json(
        { error: `SharePoint error: ${response.status}` },
        { status: response.status as number }
      )
    }

    const buffer = await response.buffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching document:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error fetching document',
      },
      { status: 500 }
    )
  }
}
