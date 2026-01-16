# InkForge Project Structure

This document outlines the MVP project structure and key components.

## 📁 Directory Structure

```
InkForge/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── transform/            # Text transformation endpoint
│   │   ├── analyze/              # Character extraction endpoint
│   │   └── consistency-check/    # Character consistency checking
│   ├── projects/                 # Project pages
│   │   ├── [id]/                 # Project editor page
│   │   └── new/                  # New project creation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (project list)
│   └── not-found.tsx             # 404 page
│
├── components/                   # React components
│   ├── CharacterPanel.tsx        # Character sidebar panel
│   ├── CommandPanel.tsx          # Cursor-style AI command panel
│   ├── DocumentEditor.tsx        # Tiptap editor with autosave
│   └── NewProjectForm.tsx        # Project creation form
│
├── lib/                          # Shared utilities
│   ├── llm/
│   │   └── provider.ts           # LLM provider abstraction
│   └── supabase/
│       ├── client.ts             # Client-side Supabase client
│       ├── server.ts             # Server-side Supabase client
│       └── database.types.ts     # TypeScript types for database
│
├── supabase/
│   └── schema.sql                # Database schema (projects, documents, characters, evidence)
│
└── types/
    └── index.ts                  # Core TypeScript type definitions
```

## 🗄️ Database Schema

The schema (`supabase/schema.sql`) defines:

1. **projects** - Writer's novels/collections
2. **documents** - Chapters/scenes within projects
3. **document_versions** - Version history for rollback capability
4. **characters** - Auto-generated character profiles with structured JSON
5. **evidence** - Links character updates to text snippets that caused them

All tables have Row Level Security (RLS) enabled for user isolation.

## 🔌 API Routes

### `POST /api/transform`
Transforms text based on natural language instructions.
- Input: `{ instruction, text, scope, context }`
- Output: `{ replacementText, explanation }`
- Status: **Stub** - TODO: Implement LLM integration

### `POST /api/analyze`
Extracts characters from document content and updates profiles.
- Input: `{ document_id, content }`
- Output: `{ characters_detected, updates_applied }`
- Status: **Stub** - TODO: Implement character extraction

### `POST /api/consistency-check`
Checks for character contradictions and inconsistencies.
- Input: `{ project_id }` or `{ document_id, content }`
- Output: `{ issues: [...] }`
- Status: **Stub** - TODO: Implement consistency checking

## 🎨 Key Components

### DocumentEditor
- Tiptap rich-text editor
- Debounced autosave (2s delay)
- Word count display
- Keyboard shortcut (Cmd/Ctrl + K) to open command panel

### CommandPanel
- Cursor-style AI command interface
- Preview before apply
- Apply/Discard functionality
- Supports selection or paragraph scope

### CharacterPanel
- Displays auto-detected characters
- Shows traits, emotional state, arc progression
- Manual consistency check button

## 🔧 Configuration

- **Next.js 14** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **Tiptap** for rich-text editing
- **Supabase** for database and auth

## 📝 Next Steps

1. Set up Supabase project and apply schema
2. Configure environment variables (`.env.local`)
3. Install dependencies: `npm install`
4. Implement LLM provider integration
5. Add authentication pages (login/logout)
6. Implement background jobs with Inngest for character analysis

## 🚧 Known TODOs

- LLM provider implementation (OpenAI/HuggingFace)
- Character extraction and profile merging logic
- Consistency checking algorithm
- Background job triggers for document analysis
- Authentication UI (login/logout pages)
- Document versioning on save
- Character profile editing UI
