import { PageHeading } from "@/components/layout/page-heading";
import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "Environment variables",
    items: [
      "NEXT_PUBLIC_PRPC_ENDPOINT — pRPC base URL exposed to client for status widgets.",
      "PRPC_ENDPOINT — server-only pRPC URL used by route handlers.",
      "XANDEUM_RPC_ENDPOINT — Solana-compatible RPC for filesystem transactions (Helius, xandeum devnet, etc).",
      "XANDEUM_WALLET_SECRET — JSON array of secret key bytes for @xandeum/web3.js actions.",
    ],
  },
  {
    title: "API routes",
    items: [
      "GET /api/pnodes — list gossip nodes (get-pods).",
      "GET /api/pnodes/[id]/stats — lifecycle metrics (get-stats).",
      "GET /api/fs — file system summaries, active workloads.",
      "GET /api/fs/[id]/tree — listDirectoryEntry output.",
      "GET /api/activity/recent — combined feed used on overview.",
    ],
  },
  {
    title: "Integration hints",
    items: [
      "Use `callPrpc` under lib/prpc-client.ts to map pnRPC calls such as get-version, get-stats, get-pods.",
      "Drop @xandeum/web3.js inside app/api routes (server-only) to proxy peek/poke/create operations.",
      "Store filesystem telemetry in `fs_operations` table or reuse the mock service until a database is connected.",
      "Subscribe to `subscribeResult` websockets to push live events into the activity feed.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-10">
      <PageHeading
        title="Documentation"
        description="Reference for configuring XanScope, wiring pnRPC, and extending filesystem analytics."
      />

      <Card>
        <pre className="overflow-x-auto rounded-2xl bg-slate-950/70 p-4 text-xs text-slate-200">
{`NEXT_PUBLIC_PRPC_ENDPOINT=http://<pnode-ip>:6000/rpc
PRPC_ENDPOINT=http://<pnode-ip>:6000/rpc
XANDEUM_RPC_ENDPOINT=https://apis.devnet.xandeum.com
XANDEUM_WALLET_SECRET=[12,55,23,...]`}
        </pre>
      </Card>

      {sections.map((section) => (
        <Card key={section.title}>
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
