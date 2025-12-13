import { NextResponse } from "next/server";
import { prpcClient } from "@/lib/prpc-client";

// Check if we should use mock data
const shouldUseMock =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" ||
    !process.env.PRPC_ENDPOINT;

// In-memory cache
let cachedLocations: NodeLocation[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

export interface NodeLocation {
    ip: string;
    lat: number;
    lng: number;
    city: string;
    country: string;
    version: string;
    uptime: number;
}

// Extract IP from address (format: "192.168.1.100:9001")
function extractIP(address: string): string {
    return address.split(":")[0];
}

// Batch lookup IPs using ip-api.com (free, 100 IPs per request)
async function lookupIPBatch(ips: string[]): Promise<Map<string, { lat: number; lng: number; city: string; country: string }>> {
    const results = new Map();

    // Split into batches of 100
    const batches: string[][] = [];
    for (let i = 0; i < ips.length; i += 100) {
        batches.push(ips.slice(i, i + 100));
    }

    for (const batch of batches) {
        try {
            const response = await fetch("http://ip-api.com/batch?fields=query,lat,lon,city,country,status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(batch),
            });

            if (response.ok) {
                const data = await response.json();
                for (const item of data) {
                    if (item.status === "success") {
                        results.set(item.query, {
                            lat: item.lat,
                            lng: item.lon,
                            city: item.city || "Unknown",
                            country: item.country || "Unknown",
                        });
                    }
                }
            }
        } catch (error) {
            console.warn("IP batch lookup failed:", error);
        }
    }

    return results;
}

export async function GET() {
    const now = Date.now();

    // In mock mode, return empty so globe uses mock data
    if (shouldUseMock) {
        return NextResponse.json({
            nodes: [],
            mock: true,
        });
    }

    // Return cached data if still valid
    if (cachedLocations && now - cacheTimestamp < CACHE_DURATION) {
        return NextResponse.json({
            nodes: cachedLocations,
            cached: true,
            cacheAge: Math.round((now - cacheTimestamp) / 1000),
        });
    }

    try {
        // Get pods from pRPC
        const podsResult = await prpcClient.getPodsWithStats();
        const pods = podsResult.pods || [];

        if (pods.length === 0) {
            return NextResponse.json({ nodes: [], error: "No pods found" });
        }

        // Extract unique IPs
        const ips = [...new Set(pods.map(p => extractIP(p.address)))];

        // Batch lookup geo data
        const geoData = await lookupIPBatch(ips);

        // Build node locations
        const nodeLocations: NodeLocation[] = pods
            .map(pod => {
                const ip = extractIP(pod.address);
                const geo = geoData.get(ip);
                if (!geo) return null;

                return {
                    ip,
                    lat: geo.lat,
                    lng: geo.lng,
                    city: geo.city,
                    country: geo.country,
                    version: pod.version,
                    uptime: pod.uptime,
                };
            })
            .filter((n): n is NodeLocation => n !== null);

        // Cache results
        cachedLocations = nodeLocations;
        cacheTimestamp = now;

        return NextResponse.json({
            nodes: nodeLocations,
            cached: false,
            total: pods.length,
            located: nodeLocations.length,
        });
    } catch (error) {
        console.error("Failed to fetch node locations:", error);

        // Return stale cache if available
        if (cachedLocations) {
            return NextResponse.json({
                nodes: cachedLocations,
                cached: true,
                stale: true,
                error: "Using stale cache due to fetch error",
            });
        }

        return NextResponse.json({ nodes: [], error: String(error) }, { status: 500 });
    }
}
