import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewProjectForm from '@/components/NewProjectForm'

export default async function NewProjectPage() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                ← Projects
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
        <NewProjectForm userId={session.user.id} />
      </main>
    </div>
  )
}
