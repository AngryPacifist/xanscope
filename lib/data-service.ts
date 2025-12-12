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
  generateMockPnodes,
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

import { prpcClient, PrpcPeerWithStats } from "./prpc-client";
import { xandeumClient } from "./xandeum-client";

// Cache for detailed pods (avoids repeated API calls)
let cachedPodsWithStats: PrpcPeerWithStats[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

async function getPodsWithStatsFromCache(): Promise<PrpcPeerWithStats[]> {
  const now = Date.now();
  if (cachedPodsWithStats && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedPodsWithStats;
  }

  try {
    const { pods } = await prpcClient.getPodsWithStats();
    cachedPodsWithStats = pods;
    cacheTimestamp = now;
    return pods;
  } catch (err) {
    console.warn("get-pods-with-stats failed, falling back to get-pods:", err);
    // Fallback to basic get-pods
    const { pods } = await prpcClient.getPods();
    return pods.map(p => ({
      address: p.address,
      is_public: true,
      last_seen_timestamp: p.last_seen_timestamp,
      pubkey: "",
      rpc_port: 6000,
      storage_committed: 0,
      storage_usage_percent: 0,
      storage_used: 0,
      uptime: 0,
      version: p.version
    }));
  }
}

export async function fetchPnodes(): Promise<PNode[]> {
  if (shouldUseMock) {
    return generateMockPnodes(); // Fresh random data each call
  }

  try {
    const pods = await getPodsWithStatsFromCache();

    // Map raw RPC pods to our UI PNode model
    return pods.map((pod, index) => ({
      id: pod.pubkey || `real_${index}`,
      label: `Node ${pod.address.split(":")[0]}`,
      address: pod.address,
      region: "Unknown", // GeoIP would go here in prod
      country: "Unknown",
      provider: "Community",
      version: pod.version,
      release: pod.version,
      storageTb: Math.round(pod.storage_committed / (1024 ** 4) * 100) / 100, // Bytes -> TB
      performanceScore: 1 - (pod.storage_usage_percent / 100 * 0.1), // Higher usage = slightly lower score
      uptimePercentage: Math.min(99.99, 95 + (pod.uptime / 86400) * 5), // More uptime = better
      lastHeartbeat: new Date(pod.last_seen_timestamp * 1000).toISOString(),
      status: "online" as const, // All in gossip are online
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

  try {
    // In real mode, all pods see each other via gossip
    // Return all pods except the requesting node
    const pods = await getPodsWithStatsFromCache();

    return pods
      .filter(pod => pod.pubkey !== nodeId && pod.address !== nodeId)
      .slice(0, 10) // Limit to 10 peers for display
      .map((pod, index) => ({
        id: pod.pubkey || `peer_${index}`,
        address: pod.address,
        version: pod.version,
        lastSeen: new Date(pod.last_seen_timestamp * 1000).toISOString()
      }));
  } catch (err) {
    console.error("Failed to fetch peer pods:", err);
    return [];
  }
}

export async function fetchPnodeStats(
  nodeId: string
): Promise<PNodeStatSnapshot[]> {
  if (shouldUseMock) {
    return mockNodeStats[nodeId] ?? [];
  }

  try {
    // Get current stats from pRPC
    const stats = await prpcClient.getStats();

    // Return a single snapshot (historical data would require persistent storage)
    return [{
      timestamp: new Date().toISOString(),
      cpuPercent: stats.stats.cpu_percent,
      ramUsedGb: stats.stats.ram_used / (1024 ** 3),
      ramTotalGb: stats.stats.ram_total / (1024 ** 3),
      uptimeSeconds: stats.stats.uptime,
      packetsReceived: stats.stats.packets_received,
      packetsSent: stats.stats.packets_sent,
      activeStreams: stats.stats.active_streams,
      totalBytes: stats.metadata.total_bytes,
      totalPages: stats.metadata.total_pages
    }];
  } catch (err) {
    console.error("Failed to fetch pNode stats:", err);
    return [];
  }
}

export async function fetchPnodeHistory(
  nodeId: string
): Promise<PNodeHistoryPoint[]> {
  if (shouldUseMock) {
    return mockHistory[nodeId] ?? [];
  }

  // Historical data requires persistent storage - return empty for now
  // In production, this would query a time-series database
  return [];
}

export async function fetchNetworkOverview(): Promise<NetworkOverview> {
  if (shouldUseMock) {
    // Compute dynamically from fresh mock data
    const nodes = generateMockPnodes();
    const now = new Date();
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter((n) => n.status === "online").length,
      offlineNodes: nodes.filter((n) => n.status === "offline").length,
      syncingNodes: nodes.filter((n) => n.status === "syncing").length,
      capacityTb: nodes.reduce((acc, node) => acc + node.storageTb, 0),
      releases: nodes.reduce<Record<string, number>>((acc, node) => {
        acc[node.release] = (acc[node.release] ?? 0) + 1;
        return acc;
      }, {}),
      averagePerformance:
        nodes.reduce((acc, node) => acc + node.performanceScore, 0) /
        nodes.length,
      lastUpdated: now.toISOString(),
      uptimePercent: 99.9,
      totalFilesystems: 24,
      regions: [],
    };
  }

  try {
    const [stats, pods] = await Promise.all([
      prpcClient.getStats(),
      getPodsWithStatsFromCache()
    ]);

    // Aggregate version distribution
    const versionCounts: Record<string, number> = {};
    pods.forEach(pod => {
      versionCounts[pod.version] = (versionCounts[pod.version] || 0) + 1;
    });

    // Calculate total storage
    const totalStorageBytes = pods.reduce((sum, p) => sum + p.storage_committed, 0);

    return {
      totalNodes: pods.length,
      onlineNodes: pods.length, // Assuming all in gossip are "online"
      offlineNodes: 0,
      syncingNodes: 0,
      capacityTb: Math.round(totalStorageBytes / (1024 ** 4) * 100) / 100,
      releases: versionCounts,
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

  // Filesystem summaries would come from indexing Xandeum chain data
  // For now, return mock as there's no direct RPC for this
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

  // FS operations would require WebSocket subscription or transaction indexing
  // Return empty for now - in production, use subscribeResult or query indexed data
  return [];
}

export async function fetchLeaderboards(): Promise<LeaderboardEntry[]> {
  if (shouldUseMock) {
    return mockLeaderboards;
  }

  try {
    const pods = await getPodsWithStatsFromCache();

    // Generate leaderboard from pods sorted by uptime
    return pods
      .filter(p => p.uptime > 0)
      .sort((a, b) => b.uptime - a.uptime)
      .slice(0, 10)
      .map((pod, index) => ({
        id: pod.pubkey || `leader_${index}`,
        label: `Node ${pod.address.split(":")[0]}`,
        score: Math.min(99.99, 95 + (pod.uptime / 86400) * 5), // Uptime-based score
        metric: "uptime",
        delta: pod.uptime > 86400 ? 0.5 : -0.1 // Positive delta if > 1 day uptime
      }));
  } catch (err) {
    console.error("Failed to fetch leaderboards:", err);
    return mockLeaderboards;
  }
}

export async function fetchActivityFeed(): Promise<ActivityFeedItem[]> {
  if (shouldUseMock) {
    return mockActivityFeed;
  }

  try {
    const pods = await getPodsWithStatsFromCache();

    // Generate activity feed from recent pod activity
    const now = Date.now();
    return pods
      .slice(0, 10)
      .map((pod, index) => {
        const lastSeenMs = pod.last_seen_timestamp * 1000;
        const minutesAgo = Math.floor((now - lastSeenMs) / 60000);
        const uptimeHours = Math.floor(pod.uptime / 3600);

        return {
          id: `activity_${index}`,
          type: "node" as const,
          title: `Node ${pod.address.split(":")[0]} heartbeat`,
          description: `Version ${pod.version}, uptime ${uptimeHours}h, ${minutesAgo}m ago`,
          timestamp: new Date(lastSeenMs).toISOString(),
          severity: minutesAgo < 5 ? "info" as const : minutesAgo < 30 ? "warning" as const : "critical" as const
        };
      });
  } catch (err) {
    console.error("Failed to fetch activity feed:", err);
    return mockActivityFeed;
  }
}
