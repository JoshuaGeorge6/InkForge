# InkForge

A Cursor-like AI writing agent for novelists with narrative intelligence.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Editor**: Tiptap (rich-text editor)
- **UI**: Tailwind CSS
- **Backend**: Next.js API routes
- **Database/Auth**: Supabase
- **Background Jobs**: Inngest
- **LLM**: Abstracted provider interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

3. Run database migrations:
```bash
# Apply the schema from supabase/schema.sql in your Supabase dashboard
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Shared utilities, Supabase client, provider interfaces
- `/types` - TypeScript type definitions
- `/api` - API route handlers
- `/supabase` - Database schema and migrations
