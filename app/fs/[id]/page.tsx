import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Card } from "@/components/ui/card";
import {
  fetchFsOperations,
  fetchFsSummaries,
  fetchFsTree,
} from "@/lib/data-service";
import { FileSystemEntry } from "@/lib/types";

type FsDetailPageProps = {
  params: {
    id: string;
  };
};

function renderEntry(entry: FileSystemEntry, depth = 0) {
  return (
    <div key={entry.path} className="space-y-2">
      <div
        className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-2"
        style={{ marginLeft: depth * 12 }}
      >
        <div>
          <p className="text-sm font-semibold">{entry.name}</p>
          <p className="text-xs text-slate-400">{entry.path}</p>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {entry.type}
        </span>
      </div>
      {entry.children?.map((child) => renderEntry(child, depth + 1))}
    </div>
  );
}

export default async function FsDetailPage({ params }: FsDetailPageProps) {
  const [fileSystems, tree, operations] = await Promise.all([
    fetchFsSummaries(),
    fetchFsTree(params.id),
    fetchFsOperations(params.id),
  ]);

  const fs = fileSystems.find((item) => item.fsid === params.id);
  if (!fs) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeading
        title={fs.label}
        description={`Filesystem ${fs.fsid} owned by ${fs.owner}. Anchored to ${fs.pinnedNodeId}.`}
        actions={
          <Link
            href={`/nodes/${fs.pinnedNodeId}`}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/60"
          >
            View node
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-emerald-500/5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            Storage usage
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {(fs.storageUsedGb / 1024).toFixed(2)} TB
          </p>
          <p className="text-sm text-slate-300">
            of {(fs.storageLimitGb / 1024).toFixed(1)} TB
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Objects
          </p>
          <p className="mt-2 text-3xl font-semibold">{fs.totalFiles}</p>
          <p className="text-sm text-slate-300">{fs.totalDirectories} folders</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Last activity
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {new Date(fs.lastActivity).toLocaleTimeString()}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Directory tree
          </p>
          <div className="mt-4 space-y-3">
            {tree.length ? (
              tree.map((entry) => renderEntry(entry))
            ) : (
              <p className="text-sm text-slate-400">No entries recorded.</p>
            )}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Operations
              </p>
              <p className="text-sm text-slate-300">
                Subscribe via @xandeum/web3.js
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {operations.map((op) => (
              <div
                key={op.id}
                className="rounded-2xl border border-white/10 px-4 py-3"
              >
                <p className="text-sm font-semibold">
                  {op.opType} · {op.path}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(op.timestamp).toLocaleTimeString()} · {op.bytes} bytes
                </p>
                <p className="text-xs text-slate-400">
                  Actor {op.actor} · Node {op.nodeId}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
