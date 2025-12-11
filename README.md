## XanScope — Xandeum pNode Intelligence

This repository contains a multi-page Next.js platform that unifies pRPC analytics, filesystem telemetry, and operator tooling for the Xandeum network.

### Feature Overview

- **Overview / Home** – glass dashboard with hero KPIs, live activity feed, filesystem callouts, and uptime leaderboard.
- **Network** – region utilization, release adoption widgets, and geo roster cards.
- **Nodes** – searchable explorer with filters plus detailed node timeline pages powered by mock pnRPC data.
- **File Systems** – workload gallery, per-fs tree view, live operations log, and detail page callouts.
- **Insights** – analytics canvases for leaderboards, workloads, and stability outlooks.
- **Operators** – “My cockpit” client-side experience that stores tracked node IDs in localStorage.
- **Releases / Docs** – release adoption cards and inline documentation for environment variables + API routes.

All API routes currently consume `lib/mock-data.ts` so the UI is interactive without live pnRPC. Swap the mock resolvers with real pnRPC + @xandeum/web3.js code whenever you have access to a running pNode.

### Tech Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 (new `@import "tailwindcss";` pipeline)
- Custom UI primitives (`Card`, `MetricCard`, `StatusPill`, `Sparkline`)
- API route scaffolding mirroring the proposed backend contract

### Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse the experience.

### Environment Variables

Create a `.env.local` file and provide the following values. They default to mock data so you can skip this step until you’re ready to connect pnRPC and filesystem calls.

```
NEXT_PUBLIC_PRPC_ENDPOINT=http://<pnode-ip>:6000/rpc
PRPC_ENDPOINT=http://<pnode-ip>:6000/rpc
XANDEUM_RPC_ENDPOINT=https://apis.devnet.xandeum.com
XANDEUM_WALLET_SECRET=[12,55,23,...] # JSON array
NEXT_PUBLIC_USE_MOCK_DATA=true # optional toggle
```

### Linting

```
npm run lint
```

### Next Steps

- Replace `lib/data-service.ts` calls with real pnRPC invocations.
- Persist filesystem ops & node snapshots in Postgres / Supabase.
- Layer in charts (Recharts / nivo) for richer visualizations.
