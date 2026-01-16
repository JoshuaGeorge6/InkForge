import { createServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DocumentEditor from '@/components/DocumentEditor'
import CharacterPanel from '@/components/CharacterPanel'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (!project) {
    notFound()
  }

  // Fetch documents for this project
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: true })

  // Fetch characters for this project
  const { data: characters } = await supabase
    .from('characters')
    .select('*')
    .eq('project_id', params.id)
    .order('name', { ascending: true })

  // Get the first document, or create a new one if none exist
  const currentDocument = documents && documents.length > 0 
    ? documents[0] 
    : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                ← Projects
              </a>
              <h1 className="text-xl font-semibold">{project.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Main editor area */}
        <div className="flex-1 overflow-auto">
          <DocumentEditor 
            projectId={params.id} 
            document={currentDocument}
          />
        </div>

        {/* Character panel sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
          <CharacterPanel 
            projectId={params.id} 
            characters={characters || []}
          />
        </div>
      </div>
    </div>
  )
}
