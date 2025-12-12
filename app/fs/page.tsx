import { fetchFsOperations, fetchFsSummaries } from "@/lib/data-service";
import { FilesystemsClient } from "@/components/fs/filesystems-client";

export default async function FileSystemsPage() {
  const [fileSystems, ops] = await Promise.all([
    fetchFsSummaries(),
    fetchFsOperations(),
  ]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Filesystem Explorer
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-2xl font-mono">
          Inspect directories, track live reads and writes, and orchestrate file primitives
          via @xandeum/web3.js. Click any filesystem to browse contents.
        </p>
      </div>

      {/* Filesystems Grid */}
      <FilesystemsClient filesystems={fileSystems} operations={ops} />
    </div>
  );
}
