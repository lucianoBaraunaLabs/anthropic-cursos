# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # First-time setup: install + prisma generate + migrate
npm run dev            # Dev server with Turbopack at localhost:3000
npm run build          # Production build
npm run lint           # ESLint
npm test               # Vitest (all tests)
npx vitest run src/path/to/file.test.ts   # Single test file
npx prisma migrate dev # Apply DB migrations
npm run db:reset       # Drop and recreate the SQLite database
```

> Do NOT run `npm audit fix` — dependencies are pinned to specific compatible versions.

## Architecture

UIGen is an AI-powered React component generator. The user describes a component in a chat; Claude generates code using tool calls; the result renders in a sandboxed live preview — all without writing files to disk.

### Data flow

1. **Chat** (`/src/app/api/chat/route.ts`) — POST endpoint powered by Vercel AI SDK's `streamText`. Receives messages + a serialized `VirtualFileSystem`, calls Claude (or mock) with two tools (`str_replace_editor`, `file_manager`), and persists the result to Prisma on finish.
2. **VirtualFileSystem** (`/src/lib/file-system.ts`) — In-memory tree of `FileNode` objects. All file operations (create, read, update, delete, rename, str_replace, insert) live here. Serialized to plain JSON for transport; reconstructed via `deserializeFromNodes`.
3. **FileSystemContext** (`/src/lib/contexts/file-system-context.tsx`) — React context that wraps `VirtualFileSystem`. `handleToolCall` bridges incoming AI tool calls to the context's mutation methods, triggering re-renders via `refreshTrigger`.
4. **Preview** (`/src/components/preview/PreviewFrame.tsx`) — Renders an `<iframe>` with a self-contained HTML document. JSX/TSX files are transpiled in-browser with `@babel/standalone`, mapped to blob URLs, and loaded via a native importmap. Third-party packages resolve to `esm.sh`. Logic lives in `src/lib/transform/jsx-transformer.ts`.
5. **AI Tools** (`/src/lib/tools/`) — `str_replace_editor` handles `create`, `str_replace`, `view`, and `insert` commands on the VFS. `file_manager` handles `rename` and `delete`.

### Auth

JWT sessions via `jose`, stored as an httpOnly cookie (`auth-token`). `src/lib/auth.ts` is `server-only`. Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem`. Anonymous users can work freely; their session data is tracked in `sessionStorage` via `src/lib/anon-work-tracker.ts` and can be migrated on sign-up.

### AI provider

`src/lib/provider.ts` exports `getLanguageModel()`. If `ANTHROPIC_API_KEY` is missing or equals `"your-api-key-here"`, it returns `MockLanguageModel` (canned responses, no API calls). Otherwise it returns `anthropic("claude-haiku-4-5")`.

The system prompt with `cacheControl: { type: "ephemeral" }` is prepended server-side in the chat route.

### Database

Prisma + SQLite (`prisma/dev.db`). Two models: `User` (email/password, bcrypt) and `Project` (stores messages and VFS data as JSON strings). Generated client output is at `src/generated/prisma`.

### Key conventions

- The preview always tries to load `/App.jsx` as the entry point first.
- `@/` path alias resolves to `src/` (tsconfig paths).
- The VFS `serialize()` strips `Map` children to plain objects for JSON transport; `deserializeFromNodes` rebuilds the tree.
- CSS imports in generated files are stripped before Babel transform, then injected as `<style>` tags in the preview iframe.
- The preview's `createImportMap` creates placeholder modules for imports that don't resolve to known files, so partial code doesn't crash the preview.
