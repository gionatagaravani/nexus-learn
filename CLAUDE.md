# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nexus Learn is an AI-powered university learning platform built with Next.js 15 and Supabase. The platform helps students study, chat with AI about their course materials (PDFs, slides, images), generate quizzes, and track learning progress through adaptive memory systems.

## Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Build & Production
npm run build            # Build for production
npm start                # Start production server
npm run clean            # Clean .next build directory

# Code Quality
npm run lint             # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Backend**: Supabase (Postgres with pgvector, Storage, Auth)
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion v12)
- **Forms**: React Hook Form + Zod resolvers

## Architecture

### Directory Structure

```
app/
├── layout.tsx           # Root layout with fonts (Inter, JetBrains Mono)
├── page.tsx             # Dashboard home with learning overview
├── subjects/page.tsx    # All subjects listing
└── subject/[id]/
    ├── page.tsx         # Subject detail with tab navigation
    ├── materials-tab.tsx    # File upload & management
    ├── notes-tab.tsx        # Study notes editor
    ├── chat-tab.tsx         # RAG-powered AI chat
    └── exercises-tab.tsx    # Quiz & practice

components/
├── dashboard-layout.tsx # Main app wrapper (Sidebar + Topbar + Main)
├── sidebar.tsx          # Navigation sidebar
└── topbar.tsx           # Header with search & user menu

lib/
├── supabase/
│   └── client.ts        # Supabase client singleton
└── utils.ts             # Shared utilities (cn helper, etc.)
```

### Core Architecture Patterns

**Tab System**: Each subject page uses client-side tab state with 4 main views:
- `materials`: Upload and manage PDFs, slides, images
- `notes`: Personal study notes with AI assistance
- `chat`: RAG-powered conversations with context from uploaded materials
- `exercises`: Generated quizzes with adaptive difficulty

**RAG Pipeline Flow**:
1. User uploads file → Supabase Storage
2. File parsing (PDF via pdf-parse, images via OCR)
3. Chunking into 300-800 token segments
4. Embedding generation (OpenAI/Mistral)
5. Store in pgvector with metadata (user_id, subject_id, content_type)
6. Query → embedding → similarity search → context → LLM response

**Memory Levels**:
1. **Knowledge Base**: Static content from uploaded materials (pgvector)
2. **Session Memory**: Recent conversations and study context
3. **Progress Memory**: Quiz errors, spaced repetition data, learning gaps

### Supabase Setup

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The Supabase client is initialized in `lib/supabase/client.ts` and imported throughout the app.

### Styling System

- Uses Tailwind CSS v4 with custom design tokens
- Primary color: Black (#000000) with neutral scale
- Roundness: 12px for cards, 8px for buttons
- Font: Inter (variable `--font-sans`) for body, JetBrains Mono (variable `--font-mono`) for code
- Utility helper: `cn()` in `lib/utils.ts` for className merging (clsx + tailwind-merge)
- Borders: `border-black/[0.08]` pattern for subtle separation
- Shadows: Minimal `shadow-[0_1px_2px_rgba(0,0,0,0.02)]` for depth

### Component Patterns

- All page components in `app/` directory use file-based routing
- Client components use `"use client"` directive
- Shared UI components use lucide-react icons
- DashboardLayout wraps all main pages with Sidebar, Topbar, and Main content area
- TypeScript paths: `@/*` maps to project root (configured in tsconfig.json)

## Key Design Decisions

1. **Supabase over Pinecone**: pgvector built into Postgres eliminates need for external vector DB initially
2. **Client-side tabs**: Tab navigation uses React state (`useState`) within subject pages for fast switching
3. **Standalone output**: Next.js configured for standalone deployment (`output: 'standalone'`)
4. **No heavy frameworks**: Avoiding LangChain initially for simpler, custom AI orchestration
5. **No native alerts**: Use inline UI for feedback and errors

## Planned Features (Not Yet Implemented)

- File upload parsing pipeline (PDF extraction, OCR)
- Vector embeddings and pgvector similarity search
- AI chat integration with context retrieval
- Quiz generation from materials
- Progress tracking and spaced repetition system
- User authentication with Supabase Auth
