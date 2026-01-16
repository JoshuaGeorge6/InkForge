'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import CommandPanel from './CommandPanel'
import type { Document as DocumentType, TiptapJSON } from '@/types'

interface DocumentEditorProps {
  projectId: string
  document: DocumentType | null
}

export default function DocumentEditor({ projectId, document }: DocumentEditorProps) {
  const [isCommandPanelOpen, setIsCommandPanelOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const supabase = createSupabaseClient()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
    ],
    content: document?.content || {
      type: 'doc',
      content: [],
    },
    onUpdate: ({ editor }) => {
      // Debounced autosave
      let timer: NodeJS.Timeout
      timer = setTimeout(async () => {
        const content = editor.getJSON()
        const text = editor.getText()
        const wordCount = text.split(/\s+/).filter(Boolean).length

        if (document) {
          await supabase
            .from('documents')
            .update({
              content: content as TiptapJSON,
              word_count: wordCount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', document.id)
        } else {
          // Create new document if none exists
          await supabase
            .from('documents')
            .insert({
              project_id: projectId,
              title: 'Untitled Chapter',
              content: content as TiptapJSON,
              word_count: wordCount,
            })
        }
      }, 2000)

      return () => {
        if (timer) clearTimeout(timer)
      }
    },
  })

  // Update editor content when document changes
  useEffect(() => {
    if (document && editor) {
      editor.commands.setContent(document.content)
    }
  }, [document, editor])

  // Handle text selection for command panel
  const handleSelectionUpdate = useCallback(() => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    if (from !== to) {
      const selected = editor.state.doc.textBetween(from, to)
      setSelectedText(selected)
    } else {
      setSelectedText('')
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, handleSelectionUpdate])

  // Keyboard shortcut to open command panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command panel (Cursor-style)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPanelOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!editor) {
    return <div className="p-8">Loading editor...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {isCommandPanelOpen && (
        <CommandPanel
          editor={editor}
          selectedText={selectedText}
          projectId={projectId}
          onClose={() => setIsCommandPanelOpen(false)}
        />
      )}

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="prose prose-lg max-w-none">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-8 py-2 text-sm text-gray-500">
        Word count: {editor.getText().split(/\s+/).filter(Boolean).length}
      </div>
    </div>
  )
}
