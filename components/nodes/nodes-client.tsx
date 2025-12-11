"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PNode } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

type Props = {
  nodes: PNode[];
};

const STATUS_FILTERS: Array<{ label: string; value: "all" | PNode["status"] }> =
  [
    { label: "All", value: "all" },
    { label: "Online", value: "online" },
    { label: "Syncing", value: "syncing" },
    { label: "Offline", value: "offline" },
  ];

export function NodesClient({ nodes }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState<(typeof STATUS_FILTERS)[number]["value"]>("all");

  const filtered = useMemo(() => {
    return nodes.filter((node) => {
      const matchesQuery =
        node.label.toLowerCase().includes(query.toLowerCase()) ||
        node.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || node.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [nodes, query, status]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by label or node id..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setStatus(item.value)}
                className={`rounded-full px-4 py-1 transition ${
                  status === item.value
                    ? "bg-cyan-500/20 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Node</th>
                <th className="px-5 py-3 font-semibold">Region</th>
                <th className="px-5 py-3 font-semibold">Release</th>
                <th className="px-5 py-3 font-semibold">Storage</th>
                <th className="px-5 py-3 font-semibold">Performance</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((node) => (
                <tr key={node.id} className="hover:bg-white/5">
                  <td className="px-5 py-4">
                    <Link
                      href={`/nodes/${node.id}`}
                      className="font-semibold text-white underline-offset-4 hover:underline"
                    >
                      {node.label}
                    </Link>
                    <p className="text-xs text-slate-400">{node.address}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {node.country} · {node.region}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold">{node.release}</p>
                    <p className="text-xs text-slate-400">{node.version}</p>
                  </td>
                  <td className="px-5 py-4 font-mono">
                    {node.storageTb} TB
                  </td>
                  <td className="px-5 py-4 font-mono">
                    {(node.performanceScore * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill label={node.status} variant={node.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
