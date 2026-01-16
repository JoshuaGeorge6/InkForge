import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { llmProvider } from '@/lib/llm/provider'
import type { AnalyzeRequest, AnalyzeResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AnalyzeRequest = await request.json()

    if (!body.document_id || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: document_id, content' },
        { status: 400 }
      )
    }

    // Verify document ownership
    const { data: document } = await supabase
      .from('documents')
      .select('project_id')
      .eq('id', body.document_id)
      .single()

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Extract text content from Tiptap JSON
    const extractText = (node: any): string => {
      if (typeof node === 'string') return node
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join(' ')
      }
      return ''
    }

    const textContent = extractText(body.content)

    // TODO: Implement actual character extraction and analysis
    const analysis = await llmProvider.analyze(textContent)

    // Update or create character profiles
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', document.project_id)
      .single()

    let updatesApplied = 0

    for (const char of analysis.characters) {
      // Check if character already exists
      const { data: existing } = await supabase
        .from('characters')
        .select('id, profile')
        .eq('project_id', document.project_id)
        .eq('name', char.name)
        .single()

      if (existing) {
        // Update existing character profile
        // TODO: Merge profile intelligently instead of replacing
        const { error } = await supabase
          .from('characters')
          .update({
            profile: {
              // Placeholder profile structure
              traits: [],
              motivations: [],
              emotional_state: { current: 'neutral' },
              arc_progression: { stage: 'active' },
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (!error) updatesApplied++
      } else {
        // Create new character
        const { error } = await supabase.from('characters').insert({
          project_id: document.project_id,
          name: char.name,
          profile: {
            traits: [],
            motivations: [],
            emotional_state: { current: 'neutral' },
            arc_progression: { stage: 'introduction' },
          },
        })

        if (!error) updatesApplied++
      }
    }

    const response: AnalyzeResponse = {
      characters_detected: analysis.characters.map((c) => c.name),
      updates_applied: updatesApplied,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}
