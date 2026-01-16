'use client'

import { useState } from 'react'
import { Editor } from '@tiptap/react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface CommandPanelProps {
  editor: Editor
  selectedText: string
  projectId: string
  onClose: () => void
}

export default function CommandPanel({
  editor,
  selectedText,
  projectId,
  onClose,
}: CommandPanelProps) {
  const [instruction, setInstruction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleTransform = async () => {
    if (!instruction.trim()) return

    setIsLoading(true)
    try {
      const scope = selectedText ? 'selection' : 'paragraph'
      const text = selectedText || editor.state.doc.textContent

      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          text,
          scope,
          context: {
            project_id: projectId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Transform failed')
      }

      const data = await response.json()
      setPreview(data.replacementText)
    } catch (error) {
      console.error('Transform error:', error)
      alert('Failed to transform text. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    if (!preview) return

    if (selectedText) {
      // Replace selected text
      const { from, to } = editor.state.selection
      editor.chain().focus().deleteRange({ from, to }).insertContent(preview).run()
    } else {
      // Replace current paragraph
      const { $anchor } = editor.state.selection
      const paragraph = $anchor.parent
      editor.chain().focus().deleteRange({
        from: $anchor.start(2),
        to: $anchor.end(2),
      }).insertContent(preview).run()
    }

    setPreview(null)
    setInstruction('')
    onClose()
  }

  const handleDiscard = () => {
    setPreview(null)
    setInstruction('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">AI Command Panel</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedText
              ? `Transforming selected text (${selectedText.length} chars)`
              : 'Transform current paragraph'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Instruction
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Make this more dramatic, Add more detail, Rewrite in first person..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              autoFocus
            />
          </div>

          {preview && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Preview
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-auto">
                <p className="whitespace-pre-wrap">{preview}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {preview ? (
              <>
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Discard
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransform}
                  disabled={!instruction.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Preview'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
