import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { llmProvider } from '@/lib/llm/provider'
import type {
  ConsistencyCheckRequest,
  ConsistencyCheckResponse,
} from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: any = await request.json()

    // Support both project_id (check all documents) and document_id (check specific document)
    let projectId: string
    let textContent: string = ''

    if (body.project_id) {
      // Check consistency for entire project (all documents)
      projectId = body.project_id
      const { data: documents } = await supabase
        .from('documents')
        .select('content')
        .eq('project_id', projectId)

      if (documents) {
        const extractText = (node: any): string => {
          if (typeof node === 'string') return node
          if (node.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join(' ')
          }
          return ''
        }
        textContent = documents.map((d) => extractText(d.content)).join(' ')
      }
    } else if (body.document_id && body.content) {
      // Check consistency for specific document
      const { data: document } = await supabase
        .from('documents')
        .select('project_id')
        .eq('id', body.document_id)
        .single()

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      projectId = document.project_id
      const extractText = (node: any): string => {
        if (typeof node === 'string') return node
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join(' ')
        }
        return ''
      }
      textContent = extractText(body.content)
    } else {
      return NextResponse.json(
        { error: 'Missing required fields: either project_id or (document_id + content)' },
        { status: 400 }
      )
    }

    // Fetch characters for this project
    const { data: characters } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', projectId)

    if (!characters || characters.length === 0) {
      return NextResponse.json({ issues: [] })
    }

    // Filter to specific characters if requested
    const charactersToCheck = body.character_ids
      ? characters.filter((c) => body.character_ids!.includes(c.id))
      : characters

    // TODO: Implement actual consistency checking logic
    const issues = await llmProvider.checkConsistency(textContent, charactersToCheck)

    const response: ConsistencyCheckResponse = {
      issues: issues.map((issue) => ({
        character_id: issue.character_id,
        character_name: issue.character_name,
        issue_type: issue.issue_type,
        description: issue.description,
        evidence_snippets: issue.evidence_snippets,
        conflicting_evidence: issue.conflicting_evidence,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Consistency check error:', error)
    return NextResponse.json(
      { error: 'Failed to check consistency' },
      { status: 500 }
    )
  }
}
