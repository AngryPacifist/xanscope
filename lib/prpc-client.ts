
import { PrpcResponse, PNodeStats, PrpcPeer } from "./types";

const TIMEOUT_MS = 5000;

export class PrpcClient {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.PRPC_ENDPOINT || "http://127.0.0.1:6000/rpc";
  }

  /**
   * Generic JSON-RPC 2.0 caller
   */
  private async call<T>(method: string, params?: unknown): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const payload = {
        jsonrpc: "2.0",
        method,
        params,
        id: Date.now(),
      };

      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`pRPC Error: ${res.statusText}`);
      }

      const json = (await res.json()) as PrpcResponse<T>;

      if (json.error) {
        throw new Error(`pRPC Protocol Error: ${json.error.message} (Code: ${json.error.code})`);
      }

      return json.result;
    } finally {
      clearTimeout(id);
    }
  }

  // --- Official pNode API Methods ---

  /**
   * Returns the current version of the pnode software.
   */
  async getVersion(): Promise<{ version: string }> {
    return this.call("get-version");
  }

  /**
   * Returns comprehensive statistics about the pnode.
   */
  async getStats(): Promise<{ metadata: any; stats: PNodeStats; file_size: number }> {
    return this.call("get-stats");
  }

  /**
   * Returns a list of all known peer pnodes.
   */
  async getPods(): Promise<{ pods: PrpcPeer[]; total_count: number }> {
    return this.call("get-pods");
  }

  /**
   * Returns detailed pod list with stats (Heidelberg v0.7+).
   * Includes storage_committed, storage_used, uptime, rpc_port, pubkey.
   */
  async getPodsWithStats(): Promise<{ pods: PrpcPeerWithStats[]; total_count: number }> {
    return this.call("get-pods-with-stats");
  }
}

// Extended peer info from get-pods-with-stats
export interface PrpcPeerWithStats {
  address: string;
  is_public: boolean;
  last_seen_timestamp: number;
  pubkey: string;
  rpc_port: number;
  storage_committed: number;
  storage_usage_percent: number;
  storage_used: number;
  uptime: number;
  version: string;
}

export const prpcClient = new PrpcClient();
