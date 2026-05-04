# Nexus Learn - Project Context

Nexus Learn is an AI-powered university learning platform designed to help students study more effectively by interacting with their course materials.

## Project Overview
- **Core Purpose**: AI-driven study assistant that enables students to chat with PDFs/slides/images, generate quizzes, and manage study notes.
- **Main Technologies**:
  - **Framework**: Next.js 15 (App Router, React 19)
  - **Language**: TypeScript (Strict Mode)
  - **AI Engine**: Google Gemini API (`@google/genai`)
  - **Backend/Database**: Supabase (PostgreSQL with `pgvector`, Auth, Storage)
  - **Styling**: Tailwind CSS v4
  - **Animations**: Motion (Framer Motion v12)
  - **Icons**: Lucide React

## Architecture & Patterns
- **RAG Pipeline**: Implements Retrieval-Augmented Generation by chunking uploaded materials, generating embeddings, and performing similarity searches using `pgvector`.
- **Authentication**: Managed via Supabase Auth with SSR support. Protected routes are handled in `middleware.ts`.
- **Layout System**: Uses a `DashboardLayout` wrapper for internal pages, providing consistent Sidebar and Topbar navigation.
- **State Management**: Primarily relies on React state and Supabase real-time/data fetching; uses client-side tabs for subject-specific views.
- **Component Strategy**: High usage of Lucide icons and Motion animations for a polished, modern UX.

## Key Directories
- `app/`: Next.js App Router routes, including API endpoints for chat, embeddings, and material processing.
- `components/`: Modular UI components, including auth forms, layout elements, and subject-specific tabs.
- `lib/`: Core business logic:
  - `ai/`: Gemini integration.
  - `embeddings/`: Vector generation logic.
  - `supabase/`: Client and server-side Supabase initializations.
  - `parsers/`: PDF and OCR parsing utilities.
- `supabase/`: Database schema definitions (`schema.sql`) and migration history.

## Development Workflow

### Prerequisites
- Node.js (Latest LTS recommended)
- Supabase Project (URL and Publishable Key)
- Google Gemini API Key

### Building and Running
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/publishable key.
- `GEMINI_API_KEY`: Google Gemini API key.

## Coding Conventions
- **TypeScript**: Use strict typing for all components and utility functions.
- **Components**: Follow the "use client" directive for interactive components. Prefer small, reusable components in the `components/` directory.
- **Styling**: Use Tailwind CSS v4 classes. Follow the established neutral-themed design system (Black/Neutral-50/900).
- **AI Interactions**: Centralize LLM prompts and configurations in `lib/ai/`.
- **Database**: All schema changes should be reflected in `supabase/schema.sql` and applied via Supabase migrations.
- **Naming**: Use kebab-case for files/directories and PascalCase for React components.
