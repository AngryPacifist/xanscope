export type NodeStatus = "online" | "offline" | "syncing";

export interface PeerNode {
  id: string;
  address: string;
  version: string;
  lastSeen: string;
}

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
  status: "active" | "idle" | "error";
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
