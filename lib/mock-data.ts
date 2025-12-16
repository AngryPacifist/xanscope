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

// Randomization helpers
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomBetween(min, max));
const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const RELEASES = ["Heidelberg", "Stuttgart", "Ingolstadt", "Munich", "Freiburg"];
const VERSIONS = ["0.7.0", "0.6.1", "0.6.0", "0.5.2", "0.5.0"];
const PROVIDERS = ["AWS", "GCP", "Azure", "Hetzner", "DigitalOcean", "OVH", "Vultr", "Linode", "Scaleway"];
const STATUSES: Array<"online" | "syncing" | "offline"> = ["online", "online", "online", "online", "syncing", "offline"];

// Global node locations - all continents, multiple cities
const NODE_LOCATIONS = [
  // North America
  { city: "New York", country: "United States", region: "us-east", lat: 40.7128, lng: -74.006 },
  { city: "Los Angeles", country: "United States", region: "us-west", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", country: "United States", region: "us-central", lat: 41.8781, lng: -87.6298 },
  { city: "Dallas", country: "United States", region: "us-south", lat: 32.7767, lng: -96.797 },
  { city: "Seattle", country: "United States", region: "us-west", lat: 47.6062, lng: -122.3321 },
  { city: "Miami", country: "United States", region: "us-east", lat: 25.7617, lng: -80.1918 },
  { city: "Toronto", country: "Canada", region: "ca-east", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", country: "Canada", region: "ca-west", lat: 49.2827, lng: -123.1207 },
  { city: "Mexico City", country: "Mexico", region: "mx-central", lat: 19.4326, lng: -99.1332 },

  // Europe
  { city: "London", country: "United Kingdom", region: "eu-west", lat: 51.5074, lng: -0.1278 },
  { city: "Paris", country: "France", region: "eu-west", lat: 48.8566, lng: 2.3522 },
  { city: "Berlin", country: "Germany", region: "eu-central", lat: 52.52, lng: 13.405 },
  { city: "Frankfurt", country: "Germany", region: "eu-central", lat: 50.1109, lng: 8.6821 },
  { city: "Amsterdam", country: "Netherlands", region: "eu-west", lat: 52.3676, lng: 4.9041 },
  { city: "Stockholm", country: "Sweden", region: "eu-north", lat: 59.3293, lng: 18.0686 },
  { city: "Madrid", country: "Spain", region: "eu-south", lat: 40.4168, lng: -3.7038 },
  { city: "Milan", country: "Italy", region: "eu-south", lat: 45.4642, lng: 9.19 },
  { city: "Warsaw", country: "Poland", region: "eu-central", lat: 52.2297, lng: 21.0122 },
  { city: "Zurich", country: "Switzerland", region: "eu-central", lat: 47.3769, lng: 8.5417 },

  // Asia
  { city: "Tokyo", country: "Japan", region: "ap-northeast", lat: 35.6762, lng: 139.6503 },
  { city: "Osaka", country: "Japan", region: "ap-northeast", lat: 34.6937, lng: 135.5023 },
  { city: "Seoul", country: "South Korea", region: "ap-northeast", lat: 37.5665, lng: 126.978 },
  { city: "Singapore", country: "Singapore", region: "ap-southeast", lat: 1.3521, lng: 103.8198 },
  { city: "Hong Kong", country: "Hong Kong", region: "ap-east", lat: 22.3193, lng: 114.1694 },
  { city: "Mumbai", country: "India", region: "ap-south", lat: 19.076, lng: 72.8777 },
  { city: "Bangalore", country: "India", region: "ap-south", lat: 12.9716, lng: 77.5946 },
  { city: "Bangkok", country: "Thailand", region: "ap-southeast", lat: 13.7563, lng: 100.5018 },
  { city: "Jakarta", country: "Indonesia", region: "ap-southeast", lat: -6.2088, lng: 106.8456 },
  { city: "Dubai", country: "UAE", region: "me-south", lat: 25.2048, lng: 55.2708 },
  { city: "Tel Aviv", country: "Israel", region: "me-west", lat: 32.0853, lng: 34.7818 },

  // South America
  { city: "São Paulo", country: "Brazil", region: "sa-east", lat: -23.5505, lng: -46.6333 },
  { city: "Rio de Janeiro", country: "Brazil", region: "sa-east", lat: -22.9068, lng: -43.1729 },
  { city: "Buenos Aires", country: "Argentina", region: "sa-south", lat: -34.6037, lng: -58.3816 },
  { city: "Santiago", country: "Chile", region: "sa-west", lat: -33.4489, lng: -70.6693 },
  { city: "Bogotá", country: "Colombia", region: "sa-north", lat: 4.711, lng: -74.0721 },
  { city: "Lima", country: "Peru", region: "sa-west", lat: -12.0464, lng: -77.0428 },

  // Africa
  { city: "Cape Town", country: "South Africa", region: "af-south", lat: -33.9249, lng: 18.4241 },
  { city: "Johannesburg", country: "South Africa", region: "af-south", lat: -26.2041, lng: 28.0473 },
  { city: "Lagos", country: "Nigeria", region: "af-west", lat: 6.5244, lng: 3.3792 },
  { city: "Nairobi", country: "Kenya", region: "af-east", lat: -1.2921, lng: 36.8219 },
  { city: "Cairo", country: "Egypt", region: "af-north", lat: 30.0444, lng: 31.2357 },

  // Oceania
  { city: "Sydney", country: "Australia", region: "ap-southeast", lat: -33.8688, lng: 151.2093 },
  { city: "Melbourne", country: "Australia", region: "ap-southeast", lat: -37.8136, lng: 144.9631 },
  { city: "Auckland", country: "New Zealand", region: "ap-southeast", lat: -36.8509, lng: 174.7645 },
];

// Normalize string for ID - remove diacritics and special characters
const normalizeForId = (str: string): string => {
  return str
    .normalize('NFD')                          // Decompose accents into separate characters
    .replace(/[\u0300-\u036f]/g, '')            // Remove accent marks
    .toLowerCase()
    .replace(/\s+/g, '-');                      // Replace spaces with hyphens
};

// Generate node names
const generateNodeName = (city: string, index: number): string => {
  const adjectives = ["Prime", "Nexus", "Horizon", "Atlas", "Quantum", "Nova", "Pulse", "Vertex", "Apex", "Core"];
  const adj = adjectives[index % adjectives.length];
  return `${city} ${adj}`;
};

// Generate IP address
const generateIP = (): string => {
  return `${randomInt(10, 220)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}:9001`;
};

// Generate mock nodes - fresh on each call for "live" simulation
export function generateMockPnodes(): PNode[] {
  return NODE_LOCATIONS.map((loc, index) => {
    const releaseIdx = randomInt(0, RELEASES.length);
    const status = randomPick(STATUSES);

    // Performance varies by status
    let performanceBase = 0.9;
    let uptimeBase = 99;
    if (status === "syncing") {
      performanceBase = 0.8;
      uptimeBase = 96;
    } else if (status === "offline") {
      performanceBase = 0.6;
      uptimeBase = 80;
    }

    const storageTb = randomInt(8, 32);
    const storageUsagePercent = randomBetween(5, 85);

    return {
      id: `node-${normalizeForId(loc.city)}-${String(index + 1).padStart(2, '0')}`,
      label: generateNodeName(loc.city, index),
      address: generateIP(),
      region: loc.region,
      country: loc.country,
      provider: randomPick(PROVIDERS),
      version: VERSIONS[releaseIdx] || VERSIONS[0],
      release: RELEASES[releaseIdx] || RELEASES[0],
      storageTb,
      storageUsedTb: Math.round(storageTb * storageUsagePercent / 100 * 100) / 100,
      storageUsagePercent,
      performanceScore: Math.min(0.99, performanceBase + randomBetween(-0.1, 0.08)),
      uptimePercentage: Math.min(99.99, uptimeBase + randomBetween(-3, 1)),
      uptimeDays: status === "offline" ? randomBetween(0, 1) : status === "syncing" ? randomBetween(1, 7) : randomBetween(5, 45),
      lastHeartbeat: minutesAgo(status === "offline" ? randomInt(20, 120) : randomInt(1, 10)),
      status,
      latitude: loc.lat,
      longitude: loc.lng,
    };
  });
}

// Static export for backward compatibility (globe, etc.)
export const mockPnodes = generateMockPnodes();

// Export for globe component - uses the generated nodes
export const GLOBE_NODES = mockPnodes.map(node => ({
  id: node.id,
  lat: node.latitude!,
  lng: node.longitude!,
  status: node.status,
}));

// Generate arc connections between nearby nodes
export const GLOBE_ARCS: Array<[string, string]> = [];
const createArcs = () => {
  const connections: Array<[string, string]> = [];

  // Connect nodes within regions
  const regionGroups: Record<string, string[]> = {};
  mockPnodes.forEach(node => {
    if (!regionGroups[node.region]) regionGroups[node.region] = [];
    regionGroups[node.region].push(node.id);
  });

  // Intra-region connections
  Object.values(regionGroups).forEach(nodeIds => {
    for (let i = 0; i < nodeIds.length - 1; i++) {
      connections.push([nodeIds[i], nodeIds[i + 1]]);
    }
  });

  // Inter-region connections (major hubs)
  const hubs = ["node-new-york-01", "node-london-10", "node-tokyo-20", "node-singapore-23", "node-sydney-42"];
  for (let i = 0; i < hubs.length - 1; i++) {
    const hub1 = mockPnodes.find(n => n.id === hubs[i]);
    const hub2 = mockPnodes.find(n => n.id === hubs[i + 1]);
    if (hub1 && hub2) {
      connections.push([hub1.id, hub2.id]);
    }
  }

  // Random cross-region connections
  for (let i = 0; i < 15; i++) {
    const n1 = randomPick(mockPnodes);
    const n2 = randomPick(mockPnodes);
    if (n1.id !== n2.id) {
      connections.push([n1.id, n2.id]);
    }
  }

  return connections;
};

GLOBE_ARCS.push(...createArcs());

export const mockPeerPods: Record<string, PeerNode[]> = Object.fromEntries(
  mockPnodes.slice(0, 10).map((node, idx) => [
    node.id,
    mockPnodes
      .filter(n => n.id !== node.id && n.region === node.region)
      .slice(0, 3)
      .map(peer => ({
        id: peer.id,
        address: peer.address,
        version: peer.version,
        lastSeen: minutesAgo(randomInt(1, 15)),
      })),
  ])
);

export const mockNodeStats: Record<string, PNodeStatSnapshot[]> = Object.fromEntries(
  mockPnodes.map((node, idx) => [
    node.id,
    Array.from({ length: 12 }).map((_, i) => ({
      timestamp: minutesAgo((idx + 1) * i * 5),
      cpuPercent: 20 + idx * 2 + i + randomBetween(-5, 10),
      ramUsedGb: 8 + randomBetween(-2, 8),
      ramTotalGb: 32,
      uptimeSeconds: 86400 + i * 600,
      packetsReceived: 1200 + i * 25 + randomInt(0, 100),
      packetsSent: 1180 + i * 20 + randomInt(0, 100),
      activeStreams: randomInt(1, 8),
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
      performanceScore: Math.max(0.6, node.performanceScore - i * 0.004 + randomBetween(-0.02, 0.02)),
      uptimePercentage: Math.max(80, node.uptimePercentage - i * 0.02 + randomBetween(-0.5, 0.5)),
      throughputGbps: 2.5 + randomBetween(-0.5, 1.5),
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
  uptimePercent: 99.9,
  totalFilesystems: 24,
  regions: [
    { name: "North America", nodes: 9, online: 7, capacityTb: 180 },
    { name: "Europe", nodes: 10, online: 8, capacityTb: 200 },
    { name: "Asia Pacific", nodes: 12, online: 10, capacityTb: 240 },
    { name: "South America", nodes: 6, online: 5, capacityTb: 96 },
    { name: "Africa", nodes: 5, online: 4, capacityTb: 80 },
    { name: "Oceania", nodes: 3, online: 3, capacityTb: 48 },
  ],
  // Real data fields
  storageUsedTb: 354.5,  // ~42% of mock capacity
  totalStoragePb: 0.84,
  avgStorageUsagePercent: 42.5,
  networkHealthPercent: 98,
  avgUptimeDays: 12.5,
  latestVersionPercent: 85,
  requestsServed: 125000,
  bytesTransferred: 5368709120, // ~5GB
};

export const mockFsSummaries: FileSystemSummary[] = [
  {
    fsid: "fs-1",
    label: "Atlas experimentation",
    owner: "XNDu3...91s",
    pinnedNodeId: mockPnodes[0]?.id || "node-new-york-01",
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
    pinnedNodeId: mockPnodes[5]?.id || "node-miami-06",
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
    pinnedNodeId: mockPnodes[20]?.id || "node-tokyo-20",
    totalFiles: 973,
    totalDirectories: 120,
    storageUsedGb: 1324,
    storageLimitGb: 2048,
    lastActivity: minutesAgo(2),
    status: "active",
  },
  {
    fsid: "fs-4",
    label: "Media archive CDN",
    owner: "XND8k...ff2",
    pinnedNodeId: mockPnodes[10]?.id || "node-london-10",
    totalFiles: 4521,
    totalDirectories: 342,
    storageUsedGb: 2840,
    storageLimitGb: 4096,
    lastActivity: minutesAgo(1),
    status: "active",
  },
  {
    fsid: "fs-5",
    label: "Game assets repository",
    owner: "XND4m...bb7",
    pinnedNodeId: mockPnodes[22]?.id || "node-seoul-22",
    totalFiles: 12847,
    totalDirectories: 891,
    storageUsedGb: 892,
    storageLimitGb: 1024,
    lastActivity: minutesAgo(8),
    status: "active",
  },
  {
    fsid: "fs-6",
    label: "DevOps CI artifacts",
    owner: "XND2j...cc9",
    pinnedNodeId: mockPnodes[12]?.id || "node-frankfurt-12",
    totalFiles: 2341,
    totalDirectories: 156,
    storageUsedGb: 478,
    storageLimitGb: 512,
    lastActivity: minutesAgo(3),
    status: "active",
  },
  {
    fsid: "fs-7",
    label: "Research datasets",
    owner: "XND6p...ee4",
    pinnedNodeId: mockPnodes[24]?.id || "node-singapore-24",
    totalFiles: 567,
    totalDirectories: 45,
    storageUsedGb: 1890,
    storageLimitGb: 2048,
    lastActivity: minutesAgo(45),
    status: "idle",
  },
  {
    fsid: "fs-8",
    label: "Blockchain snapshots",
    owner: "XND7r...gg6",
    pinnedNodeId: mockPnodes[31]?.id || "node-sao-paulo-31",
    totalFiles: 24,
    totalDirectories: 8,
    storageUsedGb: 3200,
    storageLimitGb: 4096,
    lastActivity: minutesAgo(120),
    status: "idle",
  },
  {
    fsid: "fs-9",
    label: "User uploads (staging)",
    owner: "XND3s...hh8",
    pinnedNodeId: mockPnodes[37]?.id || "node-cape-town-37",
    totalFiles: 8923,
    totalDirectories: 612,
    storageUsedGb: 156,
    storageLimitGb: 256,
    lastActivity: minutesAgo(12),
    status: "active",
  },
  {
    fsid: "fs-10",
    label: "Compliance audit logs",
    owner: "XND5t...jj0",
    pinnedNodeId: mockPnodes[15]?.id || "node-stockholm-15",
    totalFiles: 45892,
    totalDirectories: 2341,
    storageUsedGb: 890,
    storageLimitGb: 1024,
    lastActivity: minutesAgo(6),
    status: "active",
  },
  {
    fsid: "fs-11",
    label: "ML model weights",
    owner: "XND9v...kk3",
    pinnedNodeId: mockPnodes[25]?.id || "node-mumbai-25",
    totalFiles: 156,
    totalDirectories: 23,
    storageUsedGb: 4010,
    storageLimitGb: 4096,
    lastActivity: minutesAgo(180),
    status: "archived",
  },
  {
    fsid: "fs-12",
    label: "NFT metadata store",
    owner: "XND1w...ll5",
    pinnedNodeId: mockPnodes[42]?.id || "node-sydney-42",
    totalFiles: 125000,
    totalDirectories: 5000,
    storageUsedGb: 234,
    storageLimitGb: 512,
    lastActivity: minutesAgo(4),
    status: "active",
  },
  {
    fsid: "fs-13",
    label: "IoT sensor data",
    owner: "XND2y...mm7",
    pinnedNodeId: mockPnodes[6]?.id || "node-toronto-06",
    totalFiles: 89234,
    totalDirectories: 1200,
    storageUsedGb: 567,
    storageLimitGb: 1024,
    lastActivity: minutesAgo(1),
    status: "active",
  },
  {
    fsid: "fs-14",
    label: "Legal contracts vault",
    owner: "XND8z...nn9",
    pinnedNodeId: mockPnodes[18]?.id || "node-zurich-18",
    totalFiles: 4521,
    totalDirectories: 89,
    storageUsedGb: 128,
    storageLimitGb: 256,
    lastActivity: minutesAgo(240),
    status: "archived",
  },
  {
    fsid: "fs-15",
    label: "E-commerce product images",
    owner: "XND4a...pp1",
    pinnedNodeId: mockPnodes[23]?.id || "node-singapore-23",
    totalFiles: 342890,
    totalDirectories: 8900,
    storageUsedGb: 1890,
    storageLimitGb: 2048,
    lastActivity: minutesAgo(3),
    status: "active",
  },
  {
    fsid: "fs-16",
    label: "Video streaming cache",
    owner: "XND6b...qq3",
    pinnedNodeId: mockPnodes[1]?.id || "node-los-angeles-01",
    totalFiles: 2341,
    totalDirectories: 45,
    storageUsedGb: 3890,
    storageLimitGb: 4096,
    lastActivity: minutesAgo(0),
    status: "active",
  },
  {
    fsid: "fs-17",
    label: "Genomics research data",
    owner: "XND9c...rr5",
    pinnedNodeId: mockPnodes[11]?.id || "node-paris-11",
    totalFiles: 12456,
    totalDirectories: 234,
    storageUsedGb: 4050,
    storageLimitGb: 4096,
    lastActivity: minutesAgo(15),
    status: "active",
  },
  {
    fsid: "fs-18",
    label: "Music library archive",
    owner: "XND3d...ss7",
    pinnedNodeId: mockPnodes[33]?.id || "node-buenos-aires-33",
    totalFiles: 78942,
    totalDirectories: 4521,
    storageUsedGb: 780,
    storageLimitGb: 1024,
    lastActivity: minutesAgo(30),
    status: "idle",
  },
  {
    fsid: "fs-19",
    label: "Smart contract artifacts",
    owner: "XND7e...tt9",
    pinnedNodeId: mockPnodes[29]?.id || "node-dubai-29",
    totalFiles: 1234,
    totalDirectories: 89,
    storageUsedGb: 45,
    storageLimitGb: 128,
    lastActivity: minutesAgo(7),
    status: "active",
  },
  {
    fsid: "fs-20",
    label: "Disaster recovery backup",
    owner: "XND1f...uu0",
    pinnedNodeId: mockPnodes[40]?.id || "node-nairobi-40",
    totalFiles: 234567,
    totalDirectories: 12345,
    storageUsedGb: 3200,
    storageLimitGb: 4096,
    lastActivity: minutesAgo(60),
    status: "idle",
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

// Generate varied file operations - using valid opType values
const OP_TYPES: FileSystemOperation["opType"][] = ["peek", "poke", "createFile", "createDirectory", "renamePath", "move", "copyPath", "removeFile", "removeDirectory"];
const FILE_PATHS = [
  "/documents/report.md", "/data/metrics.json", "/logs/access.log", "/backup/snapshot.tar.gz",
  "/models/weights.bin", "/cache/temp.dat", "/config/settings.yaml", "/exports/data.csv",
  "/uploads/image.png", "/assets/logo.svg", "/src/index.ts", "/dist/bundle.js",
  "/tests/unit.spec.ts", "/docs/README.md", "/scripts/deploy.sh", "/tmp/process.lock",
  "/experiments/run-42.log", "/snapshots/weekly.tgz", "/archives/2024-q4.zip",
  "/media/video.mp4", "/thumbnails/preview.jpg", "/schemas/api.graphql",
];
const ACTORS = [
  "XNDu3...91s", "XND9L...aa1", "XND1n...ww0", "XND8k...ff2", "XND4m...bb7",
  "XND2j...cc9", "XND6p...ee4", "XND7r...gg6", "XND3s...hh8", "XND5t...jj0",
];

export const mockFsOperations: FileSystemOperation[] = Array.from({ length: 35 }, (_, i) => {
  const fsIndex = randomInt(1, 13);
  const nodeIndex = randomInt(0, 40);
  return {
    id: `op-${i + 1}`,
    fsid: `fs-${fsIndex}`,
    opType: randomPick(OP_TYPES),
    path: randomPick(FILE_PATHS),
    actor: randomPick(ACTORS),
    nodeId: mockPnodes[nodeIndex]?.id || `node-${nodeIndex}`,
    bytes: randomInt(64, 50000),
    status: Math.random() > 0.1 ? "success" : "failed", // 90% success rate
    timestamp: minutesAgo(i * 2 + randomInt(0, 5)),
  };
});

export const mockLeaderboards: LeaderboardEntry[] = mockPnodes
  .sort((a, b) => b.performanceScore - a.performanceScore)
  .slice(0, 10)
  .map((node, i) => ({
    id: node.id,
    label: node.label,
    score: node.performanceScore,
    metric: "performance",
    delta: randomBetween(-0.03, 0.05),
  }));

export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: "activity-1",
    type: "node",
    title: `${mockPnodes[19]?.label || "Tokyo Prime"} promoted to top tier`,
    description: "Performance score crossed 0.98 with 99.8% uptime",
    timestamp: minutesAgo(4),
    severity: "info",
  },
  {
    id: "activity-2",
    type: "fs",
    title: "Large write operation detected",
    description: `AI training set appended 3.2 GB via ${mockPnodes[19]?.label || "node-tokyo"}`,
    timestamp: minutesAgo(7),
    severity: "warning",
  },
  {
    id: "activity-3",
    type: "network",
    title: `${mockPnodes.find(n => n.status === "offline")?.label || "Node"} offline`,
    description: "Node unreachable for 25 minutes — flagged for review",
    timestamp: minutesAgo(25),
    severity: "critical",
  },
];

// Rich mock generator for dashboard live feed (matches deployed variety)
const MOCK_FEED_TEMPLATES = [
  // City-based events
  { title: "Tokyo Hub synced", description: "Block height: 1,247,891" },
  { title: "NYC Gateway heartbeat", description: "Latency: 12ms avg" },
  { title: "London Node verified", description: "Performance score: 0.98" },
  { title: "Frankfurt Server online", description: "Connection stable" },
  { title: "Singapore Relay synced", description: "Storage: 2.4TB synced" },
  { title: "Sydney Cluster verified", description: "Consensus reached" },
  { title: "Mumbai Core heartbeat", description: "Response time: 8ms" },
  { title: "Toronto Bridge online", description: "Peer count: 156" },
  { title: "Amsterdam Vault synced", description: "Shard replication complete" },
  { title: "Seoul Mirror verified", description: "Signature valid" },

  // Standalone action events (variety - not city-based)
  { title: "Storage allocation", description: "Storage: 2.4TB allocated" },
  { title: "Peer discovery", description: "Gossip round complete" },
  { title: "Block propagated", description: "Block height: 1,247,891" },
  { title: "Shard replicated", description: "Replication factor: 3x" },
  { title: "Validator online", description: "Uptime: 99.9%" },
  { title: "Consensus reached", description: "Network synchronized" },
  { title: "Gossip round complete", description: "All nodes responding" },
  { title: "Network sync", description: "Peers synchronized" },
  { title: "Health check passed", description: "All systems operational" },
  { title: "Large write detected", description: "3.2 GB appended" },
];

export function generateMockFeedItem(): ActivityFeedItem {
  const template = randomPick(MOCK_FEED_TEMPLATES);

  return {
    id: `mock-${Date.now()}-${Math.random()}`,
    type: "node",
    title: template.title,
    description: template.description,
    timestamp: new Date().toISOString(),
    severity: "info",
  };
}

