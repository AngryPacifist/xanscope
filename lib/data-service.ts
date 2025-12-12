import {
  mockActivityFeed,
  mockFsOperations,
  mockFsSummaries,
  mockFsTrees,
  mockHistory,
  mockLeaderboards,
  mockNetworkOverview,
  mockPeerPods,
  mockPnodes,
  mockNodeStats,
} from "./mock-data";
import {
  ActivityFeedItem,
  FileSystemEntry,
  FileSystemOperation,
  FileSystemSummary,
  LeaderboardEntry,
  NetworkOverview,
  PeerNode,
  PNode,
  PNodeHistoryPoint,
  PNodeStatSnapshot,
} from "./types";

const shouldUseMock =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" ||
  !process.env.PRPC_ENDPOINT;

import { prpcClient } from "./prpc-client";
import { xandeumClient } from "./xandeum-client";

export async function fetchPnodes(): Promise<PNode[]> {
  if (shouldUseMock) {
    return mockPnodes;
  }

  try {
    const { pods } = await prpcClient.getPods();

    // Map raw RPC pods to our UI PNode model
    return pods.map((pod, index) => ({
      id: `real_${index}`,
      label: `Node ${pod.address.split(":")[0]}`,
      address: pod.address,
      region: "Unknown", // GeoIP would go here in prod
      country: "Unknown",
      provider: "Community",
      version: pod.version,
      release: "v1.0.0",
      storageTb: 0, // Not provided in peer list
      performanceScore: 0.95, // Placeholder
      uptimePercentage: 100,
      lastHeartbeat: new Date(pod.last_seen_timestamp * 1000).toISOString(),
      status: "online",
      latitude: (Math.random() * 180) - 90, // Random placement for now until GeoIP
      longitude: (Math.random() * 360) - 180
    }));
  } catch (err) {
    console.error("Failed to fetch real pods:", err);
    return [];
  }
}

export async function fetchPnodeById(id: string): Promise<PNode | null> {
  const nodes = await fetchPnodes();
  return nodes.find((node) => node.id === id) ?? null;
}

export async function fetchPeerPods(nodeId: string): Promise<PeerNode[]> {
  if (shouldUseMock) {
    return mockPeerPods[nodeId] ?? [];
  }

  return [];
}

export async function fetchPnodeStats(
  nodeId: string
): Promise<PNodeStatSnapshot[]> {
  if (shouldUseMock) {
    return mockNodeStats[nodeId] ?? [];
  }

  return [];
}

export async function fetchPnodeHistory(
  nodeId: string
): Promise<PNodeHistoryPoint[]> {
  if (shouldUseMock) {
    return mockHistory[nodeId] ?? [];
  }

  return [];
}

export async function fetchNetworkOverview(): Promise<NetworkOverview> {
  if (shouldUseMock) {
    return mockNetworkOverview;
  }

  try {
    const [stats, pods] = await Promise.all([
      prpcClient.getStats(),
      prpcClient.getPods()
    ]);

    return {
      totalNodes: pods.total_count,
      onlineNodes: pods.total_count, // Assuming all in gossip are "online"
      offlineNodes: 0,
      syncingNodes: 0,
      capacityTb: Math.round(stats.metadata.total_bytes / (1024 ** 4)), // Bytes -> TB
      releases: { "1.0.0": pods.total_count }, // Version comes from get-version, simplifying for now
      averagePerformance: 0.98,
      lastUpdated: new Date().toISOString(),
      uptimePercent: 99.9,
      totalFilesystems: stats.metadata.total_pages || 0,
      regions: []
    };
  } catch (err) {
    console.warn("Failed to fetch network overview, using mock fallback:", err);
    return mockNetworkOverview;
  }
}

export async function fetchFsSummaries(): Promise<FileSystemSummary[]> {
  if (shouldUseMock) {
    return mockFsSummaries;
  }

  return mockFsSummaries;
}

export async function fetchFsTree(
  fsid: string
): Promise<FileSystemEntry[]> {
  if (shouldUseMock) {
    return mockFsTrees[fsid] ?? [];
  }

  try {
    // Assuming fsid maps to a root path like `/${fsid}`
    const entries = await xandeumClient.listDirectories(`/${fsid}`);

    // Default to empty if RPC fails or returns null
    if (!entries || !Array.isArray(entries)) return [];

    return entries.map((e: any) => ({
      type: e.type === "dir" ? "directory" : "file",
      name: e.name,
      path: `/${fsid}/${e.name}`,
      sizeBytes: e.size || 0,
      updatedAt: new Date().toISOString(), // Timestamp might not be in basic list
      children: [] // No recursion for now
    }));
  } catch (err) {
    console.error(`Failed to fetch FS tree for ${fsid}:`, err);
    return [];
  }
}

export async function fetchFsOperations(
  fsid?: string
): Promise<FileSystemOperation[]> {
  if (shouldUseMock) {
    return fsid
      ? mockFsOperations.filter((op) => op.fsid === fsid)
      : mockFsOperations;
  }

  return [];
}

export async function fetchLeaderboards(): Promise<LeaderboardEntry[]> {
  if (shouldUseMock) {
    return mockLeaderboards;
  }

  return mockLeaderboards;
}

export async function fetchActivityFeed(): Promise<ActivityFeedItem[]> {
  if (shouldUseMock) {
    return mockActivityFeed;
  }

  return mockActivityFeed;
}
