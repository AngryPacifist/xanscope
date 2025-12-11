import Link from "next/link";
import { PageHeading } from "@/components/layout/page-heading";
import { Card } from "@/components/ui/card";
import { SimpleTable } from "@/components/ui/simple-table";
import { StatusPill } from "@/components/ui/status-pill";
import { fetchFsOperations, fetchFsSummaries } from "@/lib/data-service";

export default async function FileSystemsPage() {
  const [fileSystems, ops] = await Promise.all([
    fetchFsSummaries(),
    fetchFsOperations(),
  ]);

  return (
    <div className="space-y-10">
      <PageHeading
        title="Filesystem explorer"
        description="Inspect directories, track live reads and writes, and orchestrate file primitives via @xandeum/web3.js."
        actions={
          <Link
            href="/docs"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/60"
          >
            Integration docs
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {fileSystems.map((fs) => (
          <Card key={fs.fsid} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {fs.fsid}
                </p>
                <p className="text-lg font-semibold">{fs.label}</p>
              </div>
              <StatusPill
                label={fs.status}
                variant={
                  fs.status === "active"
                    ? "online"
                    : fs.status === "idle"
                    ? "syncing"
                    : "offline"
                }
              />
            </div>
            <p className="text-sm text-slate-300">
              Owner {fs.owner} · Node {fs.pinnedNodeId}
            </p>
            <p className="text-sm text-slate-400">
              {fs.totalFiles} files · {fs.totalDirectories} directories
            </p>
            <p className="text-sm text-slate-400">
              {(fs.storageUsedGb / 1024).toFixed(1)} /{" "}
              {(fs.storageLimitGb / 1024).toFixed(1)} TB used
            </p>
            <Link
              href={`/fs/${fs.fsid}`}
              className="inline-flex text-sm font-semibold text-cyan-300 underline-offset-4 hover:underline"
            >
              Open filesystem →
            </Link>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Live operations
            </p>
            <h2 className="text-xl font-semibold">Latest RPC events</h2>
          </div>
        </div>
        <SimpleTable
          data={ops}
          keyExtractor={(item) => item.id}
          columns={[
            { header: "Time", accessor: "timestamp" },
            { header: "FS", accessor: "fsid" },
            { header: "Operation", accessor: "opType" },
            {
              header: "Path",
              accessor: "path",
              render: (value) => <span className="font-mono">{value}</span>,
            },
            {
              header: "Bytes",
              accessor: "bytes",
              render: (value) => `${value} B`,
            },
            {
              header: "Status",
              accessor: "status",
              render: (value) => (
                <StatusPill
                  label={value as string}
                  variant={value === "success" ? "online" : "offline"}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
