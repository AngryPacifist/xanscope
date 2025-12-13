import { NextResponse } from "next/server";
import { prpcClient, PrpcPeerWithStats } from "@/lib/prpc-client";
import type { ActivityFeedItem } from "@/lib/types";

// In-memory state for comparison (resets on server restart)
let previousPods: Map<string, PrpcPeerWithStats> = new Map();
let previousStats: { requests?: number; storage?: number } = {};
let isFirstRun = true;

const shouldUseMock =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" ||
    !process.env.PRPC_ENDPOINT;

export async function GET() {
    if (shouldUseMock) {
        // Return empty for mock mode - client will generate its own mock events
        return NextResponse.json({ events: [], mock: true });
    }

    try {
        const events: ActivityFeedItem[] = [];
        const now = new Date().toISOString();

        // Fetch current state
        const [podsResult, statsResult] = await Promise.all([
            prpcClient.getPodsWithStats().catch(() => ({ pods: [] as PrpcPeerWithStats[], total_count: 0 })),
            prpcClient.getStats().catch(() => null),
        ]);

        const currentPods = podsResult.pods;
        const currentPodsMap = new Map(currentPods.map(p => [p.address, p]));

        // Skip comparison on first run (just populate state)
        if (!isFirstRun) {
            // Detect new nodes
            for (const [address, pod] of currentPodsMap) {
                if (!previousPods.has(address)) {
                    events.push({
                        id: `new-${address}-${Date.now()}`,
                        type: "node",
                        title: `New node joined`,
                        description: `${address.split(':')[0]} (v${pod.version})`,
                        timestamp: now,
                        severity: "info",
                    });
                }
            }

            // Detect offline nodes
            for (const [address, pod] of previousPods) {
                if (!currentPodsMap.has(address)) {
                    events.push({
                        id: `offline-${address}-${Date.now()}`,
                        type: "node",
                        title: `Node went offline`,
                        description: address.split(':')[0],
                        timestamp: now,
                        severity: "warning",
                    });
                }
            }

            // Detect version upgrades
            for (const [address, pod] of currentPodsMap) {
                const prev = previousPods.get(address);
                if (prev && prev.version !== pod.version) {
                    events.push({
                        id: `upgrade-${address}-${Date.now()}`,
                        type: "node",
                        title: `Version upgrade`,
                        description: `${address.split(':')[0]}: v${prev.version} → v${pod.version}`,
                        timestamp: now,
                        severity: "info",
                    });
                }
            }

            // Detect storage changes (from get-stats)
            if (statsResult && previousStats.storage !== undefined) {
                const currentStorage = statsResult.file_size || 0;
                const diff = currentStorage - previousStats.storage;
                if (Math.abs(diff) > 1024 * 1024) { // Only show if > 1MB change
                    const formatted = formatBytes(Math.abs(diff));
                    events.push({
                        id: `storage-${Date.now()}`,
                        type: "network",
                        title: diff > 0 ? `Storage increased` : `Storage decreased`,
                        description: `${diff > 0 ? '+' : '-'}${formatted}`,
                        timestamp: now,
                        severity: "info",
                    });
                }
            }
        }

        // Update state for next comparison
        previousPods = currentPodsMap;
        if (statsResult) {
            previousStats = {
                storage: statsResult.file_size || 0,
            };
        }
        isFirstRun = false;

        // Add a heartbeat event if no other events (shows the feed is working)
        if (events.length === 0 && Math.random() < 0.3) {
            const randomPod = currentPods[Math.floor(Math.random() * currentPods.length)];
            if (randomPod) {
                events.push({
                    id: `heartbeat-${Date.now()}`,
                    type: "node",
                    title: `Gossip heartbeat`,
                    description: `${randomPod.address.split(':')[0]} responded`,
                    timestamp: now,
                    severity: "info",
                });
            }
        }

        return NextResponse.json({
            events,
            mock: false,
            nodeCount: currentPods.length,
            timestamp: now
        });

    } catch (err) {
        console.error("Feed API error:", err);
        return NextResponse.json({ events: [], error: true }, { status: 500 });
    }
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
