// Core TypeScript type definitions for InkForge

// Database types (matching Supabase schema)
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: TiptapJSON; // Tiptap editor JSON format
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: TiptapJSON;
  version_number: number;
  created_at: string;
}

// Character profile structure
export interface CharacterProfile {
  traits: string[];
  motivations: string[];
  emotional_state: {
    current: string;
    trajectory?: string; // e.g., "increasing anxiety"
  };
  arc_progression: {
    stage: string; // e.g., "introduction", "conflict", "resolution"
    notes?: string;
  };
  relationships?: {
    [characterName: string]: string; // e.g., "friend", "enemy", "mentor"
  };
  physical_description?: string;
  background?: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  profile: CharacterProfile;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  character_id: string;
  document_id: string | null;
  snippet: string; // The text that triggered this evidence
  character_change: Partial<CharacterProfile>; // What changed
  inference_reasoning: string; // AI explanation
  created_at: string;
}

// Tiptap JSON format (simplified)
export type TiptapJSON = {
  type: string;
  content?: TiptapJSON[];
  [key: string]: any;
};

// API request/response types
export interface TransformRequest {
  instruction: string;
  text: string; // Selected text or paragraph
  scope: 'selection' | 'paragraph' | 'document';
  context?: {
    project_id?: string;
    document_id?: string;
    character_names?: string[];
  };
}

export interface TransformResponse {
  replacementText: string;
  explanation: string;
}

export interface AnalyzeRequest {
  document_id: string;
  content: TiptapJSON;
}

export interface AnalyzeResponse {
  characters_detected: string[];
  updates_applied: number;
}

export interface ConsistencyCheckRequest {
  document_id: string;
  content: TiptapJSON;
  character_ids?: string[]; // Optional: check specific characters
}

export interface ConsistencyIssue {
  character_id: string;
  character_name: string;
  issue_type: 'contradiction' | 'inconsistency' | 'plot_hole';
  description: string;
  evidence_snippets: string[];
  conflicting_evidence: {
    previous: string;
    current: string;
  };
}

export interface ConsistencyCheckResponse {
  issues: ConsistencyIssue[];
}

// LLM Provider abstraction
export interface LLMProvider {
  transform(request: TransformRequest): Promise<TransformResponse>;
  analyze(content: string): Promise<{
    characters: Array<{ name: string; context: string }>;
    insights: string[];
  }>;
  checkConsistency(
    content: string,
    characterProfiles: Character[]
  ): Promise<ConsistencyIssue[]>;
}
