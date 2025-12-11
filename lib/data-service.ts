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

export async function fetchPnodes(): Promise<PNode[]> {
  if (shouldUseMock) {
    return mockPnodes;
  }

  // Placeholder for real pRPC integration.
  return mockPnodes;
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

  return mockNetworkOverview;
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

  return [];
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
