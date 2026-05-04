-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create storage bucket for materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
CREATE POLICY "Public read access for materials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can upload materials"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Users can manage their own materials"
ON storage.objects
FOR ALL
USING (bucket_id = 'materials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials table (metadata for uploaded files)
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'image', 'slide', etc.
    file_size BIGINT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table for chunked content with embeddings
CREATE TYPE content_type AS ENUM ('pdf_text', 'image_ocr', 'slide_text', 'note');

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Additional metadata (page numbers, etc.)
    embedding vector(1536), -- OpenAI embeddings dimension
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Enable pgvector similarity search
    CONSTRAINT valid_embedding CHECK (array_length(embedding) = 1536)
);

-- Create index for similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create HNSW index for faster approximate search (alternative to IVF)
-- CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- Chat sessions table
CREATE TYPE chat_message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role chat_message_role NOT NULL,
    content TEXT NOT NULL,
    context_sources JSONB DEFAULT '[]', -- Document IDs used for context
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts and questions
CREATE TYPE quiz_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    difficulty quiz_difficulty DEFAULT 'intermediate',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB, -- For multiple choice: ["A", "B", "C", "D"]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER, -- Score out of 100
    answers JSONB NOT NULL, -- User's answers {question_id: answer}
    completed_at TIMESTAMPTZ,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subjects"
ON subjects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects"
ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects"
ON subjects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects"
ON subjects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own materials"
ON materials FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own materials"
ON materials FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own materials"
ON materials FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents"
ON documents FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON documents FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat sessions"
ON chat_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages"
ON chat_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quizzes"
ON quizzes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quizzes"
ON quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes"
ON quizzes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes"
ON quizzes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz questions"
ON quiz_questions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz questions"
ON quiz_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz attempts"
ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON materials
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
