'use client'

import { useEffect, useState } from 'react'
import type { Character } from '@/types'

interface CharacterPanelProps {
  projectId: string
  characters: Character[]
}

export default function CharacterPanel({ projectId, characters }: CharacterPanelProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [issues, setIssues] = useState<any[]>([])

  // Placeholder content for MVP
  // TODO: Implement character profile display, editing, and consistency checking

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Characters</h2>
        <p className="text-xs text-gray-500 mt-1">
          Auto-updating character profiles
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {characters.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No characters detected yet.</p>
            <p className="mt-2">Characters will appear automatically as you write.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {characters.map((character) => (
              <div
                key={character.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <h3 className="font-semibold mb-2">{character.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {character.profile.traits && character.profile.traits.length > 0 && (
                    <div>
                      <span className="font-medium">Traits: </span>
                      <span>{character.profile.traits.join(', ')}</span>
                    </div>
                  )}
                  {character.profile.emotional_state?.current && (
                    <div>
                      <span className="font-medium">State: </span>
                      <span>{character.profile.emotional_state.current}</span>
                    </div>
                  )}
                  {character.profile.arc_progression?.stage && (
                    <div>
                      <span className="font-medium">Arc: </span>
                      <span>{character.profile.arc_progression.stage}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={async () => {
            setIsChecking(true)
            try {
              const response = await fetch('/api/consistency-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  project_id: projectId,
                }),
              })

              if (response.ok) {
                const data = await response.json()
                setIssues(data.issues || [])
              }
            } catch (error) {
              console.error('Consistency check error:', error)
            } finally {
              setIsChecking(false)
            }
          }}
          disabled={isChecking || characters.length === 0}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isChecking ? 'Checking...' : 'Check Consistency'}
        </button>

        {issues.length > 0 && (
          <div className="mt-4 space-y-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm"
              >
                <div className="font-medium text-yellow-800">{issue.character_name}</div>
                <div className="text-yellow-700 mt-1">{issue.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
