-- InkForge Database Schema
-- This schema defines the data model for the MVP

-- Projects table
-- A project represents a writer's novel or collection of related documents
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  Creator TEXT NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Documents table
-- Individual chapters/scenes within a project
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Tiptap JSON format
  word_count INTEGER DEFAULT 0,
  Creator TEXT NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Document versions table (optional but recommended)
-- Tracks document history for rollback capability
CREATE TABLE document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  Creator TEXT NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Characters table
-- Auto-generated and manually editable character profiles
CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profile JSONB NOT NULL, -- Structured character data: traits, motivations, emotional state, arc progression
  Creator TEXT NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, name) -- One character per name per project
);

-- Evidence / Memory records table
-- Links character updates to specific text snippets that caused them
CREATE TABLE evidence (
  id SERIAL PRIMARY KEY,
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
  snippet TEXT NOT NULL, -- The text that triggered this evidence
  character_change JSONB, -- What changed in the character profile
  inference_reasoning TEXT, -- AI explanation of why this evidence matters
  Creator TEXT NOT NULL,
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_evidence_character_id ON evidence(character_id);
CREATE INDEX idx_evidence_document_id ON evidence(document_id);

-- Row Level Security (RLS) policies
-- Users can only access their own projects and related data

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

-- Projects: users can only access their own projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Documents: users can access documents in their projects
CREATE POLICY "Users can view documents in their projects"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their projects"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents in their projects"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in their projects"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Document versions: same access pattern as documents
CREATE POLICY "Users can manage document versions in their projects"
  ON document_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN projects ON projects.id = documents.project_id
      WHERE documents.id = document_versions.document_id
      AND projects.user_id = auth.uid()
    )
  );

-- Characters: same access pattern as documents
CREATE POLICY "Users can manage characters in their projects"
  ON characters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = characters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Evidence: same access pattern as documents
CREATE POLICY "Users can manage evidence in their projects"
  ON evidence FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM characters
      JOIN projects ON projects.id = characters.project_id
      WHERE characters.id = evidence.character_id
      AND projects.user_id = auth.uid()
    )
  );
