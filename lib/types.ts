export type NodeStatus = "online" | "offline" | "syncing";

// JSON-RPC 2.0 Response Wrapper
export interface PrpcResponse<T> {
  jsonrpc: "2.0";
  result: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

// Maps to "pods" item in get-pods (Raw JSON-RPC)
export interface PrpcPeer {
  address: string; // "192.168.1.100:9001"
  version: string;
  last_seen: string;
  last_seen_timestamp: number;
}

// UI-friendly PeerNode (used by components)
export interface PeerNode {
  id: string; // Derived or placeholder
  address: string;
  version: string;
  lastSeen: string;
}

// Maps to "stats" object in get-stats
export interface PNodeStats {
  cpu_percent: number;
  ram_used: number;
  ram_total: number;
  uptime: number;
  packets_received: number;
  packets_sent: number;
  active_streams: number;
}

// UI-friendly normalized Node
export interface PNode {
  id: string;
  label: string;
  address: string;
  region: string;
  country: string;
  provider: string;
  version: string;
  release: string;
  storageTb: number;
  performanceScore: number;
  uptimePercentage: number;
  lastHeartbeat: string;
  status: NodeStatus;
  latitude?: number;
  longitude?: number;
}

export interface PNodeStatSnapshot {
  timestamp: string;
  cpuPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  uptimeSeconds: number;
  packetsReceived: number;
  packetsSent: number;
  activeStreams: number;
  totalBytes: number;
  totalPages: number;
}

export interface PNodeHistoryPoint {
  timestamp: string;
  performanceScore: number;
  uptimePercentage: number;
  throughputGbps: number;
}

export interface NetworkOverview {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  syncingNodes: number;
  capacityTb: number;
  releases: Record<string, number>;
  averagePerformance: number;
  lastUpdated: string;
  uptimePercent: number;
  totalFilesystems: number;
  regions: Array<{
    name: string;
    nodes: number;
    online: number;
    capacityTb: number;
  }>;
}

export interface LeaderboardEntry {
  id: string;
  label: string;
  score: number;
  metric: string;
  delta: number;
}

export interface FileSystemSummary {
  fsid: string;
  label: string;
  owner: string;
  pinnedNodeId: string;
  totalFiles: number;
  totalDirectories: number;
  storageUsedGb: number;
  storageLimitGb: number;
  lastActivity: string;
  status: "active" | "idle" | "error" | "archived";
}

export type FsEntryType = "directory" | "file";

export interface FileSystemEntry {
  type: FsEntryType;
  name: string;
  path: string;
  sizeBytes?: number;
  updatedAt: string;
  children?: FileSystemEntry[];
}

export interface FileSystemOperation {
  id: string;
  fsid: string;
  opType:
  | "peek"
  | "poke"
  | "createFile"
  | "createDirectory"
  | "renamePath"
  | "move"
  | "copyPath"
  | "removeFile"
  | "removeDirectory";
  path: string;
  actor: string;
  nodeId: string;
  bytes: number;
  status: "success" | "failed";
  timestamp: string;
}

export interface ActivityFeedItem {
  id: string;
  type: "node" | "fs" | "network";
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}
