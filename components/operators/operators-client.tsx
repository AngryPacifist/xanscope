"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PNode } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { getTrackedNodes, saveTrackedNodes } from "./tracker-storage";

type OperatorsClientProps = {
  nodes: PNode[];
};

export function OperatorsClient({ nodes }: OperatorsClientProps) {
  const [trackedIds, setTrackedIds] = useState<string[]>(() =>
    getTrackedNodes()
  );
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    saveTrackedNodes(trackedIds);
  }, [trackedIds]);

  const trackedNodes = nodes.filter((node) => trackedIds.includes(node.id));

  const addNode = () => {
    const id = inputValue.trim();
    if (!id) return;
    if (trackedIds.includes(id)) return;
    setTrackedIds([...trackedIds, id]);
    setInputValue("");
  };

  const removeNode = (id: string) => {
    setTrackedIds(trackedIds.filter((nodeId) => nodeId !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
          My cockpit
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Paste your pNode id..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm outline-none ring-cyan-400/40 focus:ring"
          />
          <button
            onClick={addNode}
            className="rounded-2xl bg-cyan-500/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500/30"
          >
            Track node
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          IDs are stored locally — no wallet connection required.
        </p>
      </Card>

      {trackedNodes.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {trackedNodes.map((node) => (
            <Card key={node.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{node.label}</p>
                  <p className="text-xs text-slate-400">{node.id}</p>
                </div>
                <StatusPill label={node.status} variant={node.status} />
              </div>
              <p className="text-sm text-slate-300">
                {(node.performanceScore * 100).toFixed(1)}% performance ·{" "}
                {node.storageTb} TB
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Uptime {node.uptimePercentage.toFixed(2)}%</span>
                <button
                  onClick={() => removeNode(node.id)}
                  className="text-rose-300 underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </div>
              <Link
                href={`/nodes/${node.id}`}
                className="inline-flex text-sm font-semibold text-cyan-300 underline-offset-4 hover:underline"
              >
                Open detail →
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No nodes tracked yet. Paste an id to start your cockpit.
          </p>
        </Card>
      )}
    </div>
  );
}
