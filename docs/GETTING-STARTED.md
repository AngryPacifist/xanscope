# Getting Started

This guide will help you set up XanScope for local development in under 5 minutes.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** or **pnpm** — Package manager
- **Mapbox Account** — [Sign up free](https://account.mapbox.com/signup/) (for globe visualization)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/AngryPacifist/xanscope.git
cd xanscope
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env.local` file in the project root:

```env
# Required: Mapbox token for 3D globe
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Optional: pNode connection (leave blank for mock data)
# PRPC_ENDPOINT=http://127.0.0.1:6000/rpc
# NEXT_PUBLIC_USE_MOCK_DATA=false
```

> 💡 **Tip**: Get your Mapbox token from [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens)

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Mock Data Mode (Default)

By default, XanScope runs with **mock data** enabled. This is perfect for:

- UI development without network dependencies
- Screenshots and demos
- Testing new features

Mock data includes:
- ~40 randomized pNodes with varying statuses
- Simulated filesystems and operations
- Randomized performance metrics

Each page refresh generates fresh random data to simulate network activity.

## What's Next?

| Goal | Guide |
|------|-------|
| Connect to real pNode | [Connecting to pNode](./CONNECTING-PNODE.md) |
| Deploy to production | [Deployment Guide](./DEPLOYMENT.md) |
| Understand the architecture | [Architecture Overview](./ARCHITECTURE.md) |

## Common Issues

### Globe not rendering?
Make sure `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly. The globe requires a valid Mapbox access token.

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

### TypeScript errors on build?
```bash
npm run lint
# Fix any issues, then:
npm run build
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
