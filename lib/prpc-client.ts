
import { PrpcResponse, PNodeStats, PrpcPeer } from "./types";
import http from "http";

const TIMEOUT_MS = 5000;

export class PrpcClient {
  private endpoint: string;
  private host: string;
  private port: number;
  private path: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.PRPC_ENDPOINT || "http://127.0.0.1:6000/rpc";
    console.log("[PrpcClient] Using endpoint:", this.endpoint);

    // Parse the URL
    const url = new URL(this.endpoint);
    this.host = url.hostname;
    this.port = parseInt(url.port) || 6000;
    this.path = url.pathname;
  }

  /**
   * Generic JSON-RPC 2.0 caller using Node.js http module
   */
  private call<T>(method: string, params?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: Date.now(),
      });

      console.log(`[PrpcClient] Calling ${method} at ${this.host}:${this.port}${this.path}`);

      const options = {
        hostname: this.host,
        port: this.port,
        path: this.path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: TIMEOUT_MS,
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data) as PrpcResponse<T>;
            if (json.error) {
              reject(new Error(`pRPC Protocol Error: ${json.error.message} (Code: ${json.error.code})`));
            } else {
              resolve(json.result);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e}`));
          }
        });
      });

      req.on("error", (err) => {
        console.error(`[PrpcClient] HTTP ERROR for ${method}:`, err.message);
        reject(err);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out"));
      });

      req.write(payload);
      req.end();
    });
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

