import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

// GET documents for an activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectActivityId = searchParams.get('project_activity_id')

    if (!projectActivityId) {
      return NextResponse.json({ error: 'Missing project_activity_id' }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    const { data, error } = await supabase
      .from('activity_documents')
      .select(`
        id,
        title,
        sharepoint_url,
        document_type,
        uploaded_by,
        created_at
      `)
      .eq('project_activity_id', projectActivityId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching documents:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST to add a new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      project_activity_id,
      title,
      sharepoint_url,
      document_type = 'general',
      uploaded_by,
    } = body

    if (!project_activity_id || !title || !sharepoint_url) {
      return NextResponse.json(
        { error: 'Missing required fields: project_activity_id, title, sharepoint_url' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServer()

    const { data, error } = await supabase
      .from('activity_documents')
      .insert({
        project_activity_id,
        title,
        sharepoint_url,
        document_type,
        uploaded_by,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating document:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Document created:', data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE to remove a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')

    if (!documentId) {
      return NextResponse.json({ error: 'Missing document_id' }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    const { error } = await supabase
      .from('activity_documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error('[v0] Error deleting document:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[v0] Document deleted:', documentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
