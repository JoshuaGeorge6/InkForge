import { NextRequest, NextResponse } from 'next/server'
import { llmProvider } from '@/lib/llm/provider'
import type { TransformRequest, TransformResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: TransformRequest = await request.json()

    // Validate input
    if (!body.instruction || !body.text) {
      return NextResponse.json(
        { error: 'Missing required fields: instruction, text' },
        { status: 400 }
      )
    }

    // TODO: Implement actual transformation logic
    // For now, return a placeholder response
    const result = await llmProvider.transform(body)

    const response: TransformResponse = {
      replacementText: result.replacementText,
      explanation: result.explanation,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Transform error:', error)
    return NextResponse.json(
      { error: 'Failed to transform text' },
      { status: 500 }
    )
  }
}
