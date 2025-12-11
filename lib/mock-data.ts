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

const now = new Date();
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60 * 1000).toISOString();

export const mockPnodes: PNode[] = [
  {
    id: "node-berlin-01",
    label: "Berlin Atlas One",
    address: "89.22.14.120:9001",
    region: "eu-central",
    country: "Germany",
    provider: "Hetzner",
    version: "1.0.5",
    release: "Herrenberg",
    storageTb: 16,
    performanceScore: 0.94,
    uptimePercentage: 99.2,
    lastHeartbeat: minutesAgo(1),
    status: "online",
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    id: "node-nyc-04",
    label: "NYC Skyline",
    address: "104.103.17.21:9001",
    region: "us-east",
    country: "United States",
    provider: "AWS",
    version: "1.0.3",
    release: "Munich",
    storageTb: 12,
    performanceScore: 0.88,
    uptimePercentage: 96.4,
    lastHeartbeat: minutesAgo(4),
    status: "syncing",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "node-tokyo-02",
    label: "Tokyo Horizon",
    address: "13.231.44.11:9001",
    region: "ap-northeast",
    country: "Japan",
    provider: "Sakura",
    version: "1.0.5",
    release: "Herrenberg",
    storageTb: 20,
    performanceScore: 0.98,
    uptimePercentage: 99.8,
    lastHeartbeat: minutesAgo(2),
    status: "online",
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    id: "node-sao-07",
    label: "São Paulo Nebula",
    address: "177.23.88.45:9001",
    region: "sa-east",
    country: "Brazil",
    provider: "Azure",
    version: "1.0.1",
    release: "Munich",
    storageTb: 8,
    performanceScore: 0.72,
    uptimePercentage: 91.1,
    lastHeartbeat: minutesAgo(25),
    status: "offline",
    latitude: -23.5558,
    longitude: -46.6396,
  },
];

export const mockPeerPods: Record<string, PeerNode[]> = {
  "node-berlin-01": [
    {
      id: "peer-frankfurt-09",
      address: "18.101.22.11:9001",
      version: "1.0.5",
      lastSeen: minutesAgo(3),
    },
    {
      id: "peer-zurich-03",
      address: "57.186.13.71:9001",
      version: "1.0.4",
      lastSeen: minutesAgo(8),
    },
  ],
};

export const mockNodeStats: Record<string, PNodeStatSnapshot[]> = Object.fromEntries(
  mockPnodes.map((node, idx) => [
    node.id,
    Array.from({ length: 12 }).map((_, i) => ({
      timestamp: minutesAgo((idx + 1) * i * 5),
      cpuPercent: 20 + idx * 7 + i,
      ramUsedGb: 8 + idx * 2 + i * 0.3,
      ramTotalGb: 32,
      uptimeSeconds: 86400 + i * 600,
      packetsReceived: 1200 + i * 25,
      packetsSent: 1180 + i * 20,
      activeStreams: 3 + ((i + idx) % 3),
      totalBytes: 1_000_000_000 + i * 150_000_000,
      totalPages: 1000 + i * 20,
    })),
  ])
);

export const mockHistory: Record<string, PNodeHistoryPoint[]> = Object.fromEntries(
  mockPnodes.map((node, idx) => [
    node.id,
    Array.from({ length: 24 }).map((_, i) => ({
      timestamp: minutesAgo(i * 60),
      performanceScore: node.performanceScore - i * 0.004 + idx * 0.001,
      uptimePercentage: Math.max(
        90,
        node.uptimePercentage - i * 0.02 + idx * 0.05
      ),
      throughputGbps: 2.5 + idx * 0.4 - i * 0.03,
    })),
  ])
);

export const mockNetworkOverview: NetworkOverview = {
  totalNodes: mockPnodes.length,
  onlineNodes: mockPnodes.filter((n) => n.status === "online").length,
  offlineNodes: mockPnodes.filter((n) => n.status === "offline").length,
  syncingNodes: mockPnodes.filter((n) => n.status === "syncing").length,
  capacityTb: mockPnodes.reduce((acc, node) => acc + node.storageTb, 0),
  releases: mockPnodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.release] = (acc[node.release] ?? 0) + 1;
    return acc;
  }, {}),
  averagePerformance:
    mockPnodes.reduce((acc, node) => acc + node.performanceScore, 0) /
    mockPnodes.length,
  lastUpdated: now.toISOString(),
  regions: [
    { name: "EU Central", nodes: 8, online: 7, capacityTb: 120 },
    { name: "US East", nodes: 6, online: 5, capacityTb: 96 },
    { name: "AP Northeast", nodes: 5, online: 5, capacityTb: 90 },
    { name: "SA East", nodes: 3, online: 2, capacityTb: 48 },
  ],
};

export const mockFsSummaries: FileSystemSummary[] = [
  {
    fsid: "fs-1",
    label: "Atlas experimentation",
    owner: "XNDu3...91s",
    pinnedNodeId: "node-berlin-01",
    totalFiles: 184,
    totalDirectories: 26,
    storageUsedGb: 512,
    storageLimitGb: 1024,
    lastActivity: minutesAgo(5),
    status: "active",
  },
  {
    fsid: "fs-2",
    label: "Validator documentation",
    owner: "XND9L...aa1",
    pinnedNodeId: "node-nyc-04",
    totalFiles: 93,
    totalDirectories: 14,
    storageUsedGb: 210,
    storageLimitGb: 512,
    lastActivity: minutesAgo(17),
    status: "idle",
  },
  {
    fsid: "fs-3",
    label: "AI training set",
    owner: "XND1n...ww0",
    pinnedNodeId: "node-tokyo-02",
    totalFiles: 973,
    totalDirectories: 120,
    storageUsedGb: 1324,
    storageLimitGb: 2048,
    lastActivity: minutesAgo(2),
    status: "active",
  },
];

export const mockFsTrees: Record<string, FileSystemEntry[]> = {
  "fs-1": [
    {
      type: "directory",
      name: "documents",
      path: "/documents",
      updatedAt: minutesAgo(20),
      children: [
        {
          type: "file",
          name: "roadmap.md",
          path: "/documents/roadmap.md",
          sizeBytes: 10240,
          updatedAt: minutesAgo(5),
        },
        {
          type: "file",
          name: "status.json",
          path: "/documents/status.json",
          sizeBytes: 2048,
          updatedAt: minutesAgo(2),
        },
      ],
    },
    {
      type: "directory",
      name: "snapshots",
      path: "/snapshots",
      updatedAt: minutesAgo(40),
      children: [
        {
          type: "file",
          name: "weekly-2025-02-01.tgz",
          path: "/snapshots/weekly-2025-02-01.tgz",
          sizeBytes: 104_857_600,
          updatedAt: minutesAgo(39),
        },
      ],
    },
  ],
};

export const mockFsOperations: FileSystemOperation[] = [
  {
    id: "op-1",
    fsid: "fs-1",
    opType: "poke",
    path: "/documents/roadmap.md",
    actor: "XNDu3...91s",
    nodeId: "node-berlin-01",
    bytes: 512,
    status: "success",
    timestamp: minutesAgo(3),
  },
  {
    id: "op-2",
    fsid: "fs-1",
    opType: "peek",
    path: "/documents/status.json",
    actor: "XNDu3...91s",
    nodeId: "node-berlin-01",
    bytes: 256,
    status: "success",
    timestamp: minutesAgo(6),
  },
  {
    id: "op-3",
    fsid: "fs-3",
    opType: "createFile",
    path: "/experiments/run-17.log",
    actor: "XND1n...ww0",
    nodeId: "node-tokyo-02",
    bytes: 4096,
    status: "success",
    timestamp: minutesAgo(9),
  },
];

export const mockLeaderboards: LeaderboardEntry[] = [
  {
    id: "node-tokyo-02",
    label: "Tokyo Horizon",
    score: 0.98,
    metric: "performance",
    delta: 0.02,
  },
  {
    id: "node-berlin-01",
    label: "Berlin Atlas One",
    score: 0.94,
    metric: "performance",
    delta: 0.01,
  },
  {
    id: "node-nyc-04",
    label: "NYC Skyline",
    score: 0.88,
    metric: "performance",
    delta: -0.03,
  },
];

export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: "activity-1",
    type: "node",
    title: "Tokyo Horizon promoted to top tier",
    description: "Performance score crossed 0.98 with 99.8% uptime",
    timestamp: minutesAgo(4),
    severity: "info",
  },
  {
    id: "activity-2",
    type: "fs",
    title: "Large write operation detected",
    description: "AI training set appended 3.2 GB via node-tokyo-02",
    timestamp: minutesAgo(7),
    severity: "warning",
  },
  {
    id: "activity-3",
    type: "network",
    title: "São Paulo Nebula offline",
    description: "Node unreachable for 25 minutes — flagged for review",
    timestamp: minutesAgo(25),
    severity: "critical",
  },
];
