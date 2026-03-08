# Sketchboard

A real-time collaborative whiteboard with a hand-drawn aesthetic, end-to-end encryption, and live cursors.

Sketchboard lets multiple users draw, sketch, and brainstorm together on a shared canvas. It uses RoughJS for a hand-drawn look, supports freehand drawing with perfect-freehand, and encrypts all drawing data client-side so the server never sees what you draw. Works standalone for local sketching or in collaborative rooms with real-time sync.

## Features

- Freehand drawing, shapes (rectangles, diamonds, arrows), and editable text on an HTML Canvas
- Hand-drawn sketch style powered by RoughJS and natural pen strokes via perfect-freehand
- Real-time collaboration with WebSocket-powered live sync and cursor tracking
- End-to-end encryption — the encryption key lives in the URL fragment and never reaches the server
- Room system with admin controls, auto-cleanup on empty rooms, and shareable invite links
- Authentication via email/password, Google, and GitHub OAuth using better-auth
- Eraser tool, selection/multi-select, fill styles, stroke styles, and font families
- Message queue with auto-retry for reliable delivery on reconnect
- Multi-tab awareness to prevent duplicate join/leave events
- Standalone offline mode and collaborative room mode
- Dark/light theme support

## Architecture

```
+---------------+         WebSocket (JWT auth)         +----------------+
|   Next.js     | <----------------------------------> |   WS Server    |
|   Frontend    |    encrypted shape data + cursors     |   (Node.js)    |
|   (React)     |                                       |                |
+-------+-------+                                       +--------+-------+
        |                                                        |
        |  better-auth (sessions, OAuth)                         |  Prisma ORM
        |                                                        |
        +-------------------+           +------------------------+
                            v           v
                         +-----------------+
                         |   PostgreSQL    |
                         |  (Users, Rooms, |
                         |   Shapes, Auth) |
                         +-----------------+
```

1. Users authenticate on the Next.js frontend via better-auth (email/password or OAuth)
2. A JWT token is generated for WebSocket authentication
3. Users create or join rooms — the WS server validates room existence against PostgreSQL
4. Drawing data is encrypted on the client using a key from the URL fragment (never sent to the server), then broadcast to room participants over WebSocket
5. The WS server keeps shapes in memory for fast sync and persists them to PostgreSQL
6. The canvas engine renders everything with RoughJS for the hand-drawn look
7. Live cursors are broadcast via CURSOR_MOVE messages with per-user colors

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS |
| UI | Radix UI, shadcn/ui, Lucide icons, Framer Motion |
| Canvas | HTML Canvas API, RoughJS, perfect-freehand |
| WebSocket | Node.js + ws library |
| Auth | better-auth (email/password + Google + GitHub OAuth) |
| Database | PostgreSQL + Prisma ORM |
| Validation | Zod (shared schemas) |
| Containerization | Docker + Docker Compose |

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9+
- PostgreSQL

### Setup

```bash
git clone https://github.com/your-username/sketchboard.git
cd sketchboard

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit .env with your database URL, auth secrets, and OAuth credentials

# Generate Prisma client and run migrations
pnpm db:generate
cd packages/db && npx prisma migrate dev && cd ../..

# Start development servers
pnpm dev
```

The frontend runs on `http://localhost:3000` and the WebSocket server on `ws://localhost:8080`.

### Docker

```bash
docker-compose up
```

## Project Structure

```
apps/
  web/                        # Next.js frontend
    app/                      # App router pages and API routes
    canvas-engine/            # Custom canvas rendering engine
    components/               # React components (UI, canvas, auth)
    actions/                  # Server actions (auth, room)
    lib/                      # Auth client, utilities
    hooks/                    # Custom React hooks
  ws/                         # WebSocket server
    src/                      # Server entry point
packages/
  common/                     # Shared Zod schemas and TypeScript types
  db/                         # Prisma schema and database client
  ui/                         # Shared UI component library
  eslint-config/              # Shared ESLint configs
  typescript-config/          # Shared TypeScript configs
docker/                       # Dockerfiles for frontend and WS server
docker-compose.yml
turbo.json
```
