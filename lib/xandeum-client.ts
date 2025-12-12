
import { PrpcResponse } from "./types";

/**
 * Client for interacting with Xandeum-enabled Solana RPC nodes.
 * Handles filesystem operations via custom JSON-RPC methods.
 */
export class XandeumClient {
    private endpoint: string;

    constructor(endpoint?: string) {
        this.endpoint = endpoint || process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
    }

    private async call<T>(method: string, params: unknown[]): Promise<T> {
        const payload = {
            jsonrpc: "2.0",
            method,
            params,
            id: Date.now(),
        };

        try {
            const res = await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                cache: "no-store",
            });

            const json = (await res.json()) as PrpcResponse<T>;
            if (json.error) {
                throw new Error(`Xandeum RPC Error: ${json.error.message}`);
            }
            return json.result;
        } catch (err) {
            console.warn(`Xandeum call ${method} failed:`, err);
            throw err;
        }
    }

    /**
     * Lists entries in a directory.
     * Maps to `listDirectoryEntry` in Xandeum API.
     */
    async listDirectories(path: string): Promise<any[]> {
        // Note: The doc says listDirectoryEntry takes (connection, path), 
        // which implies it sends a custom RPC method. 
        // We assume the method name is 'listDirs' based on the doc description:
        // "This function calls the custom RPC method listDirs"
        return this.call<any[]>("listDirs", [path]);
    }

    /**
     * Gets metadata for a file/dir.
     * Maps to `getMetadata`.
     */
    async getMetadata(path: string): Promise<any> {
        return this.call("getMetadata", [path]);
    }

    /**
     * Checks if a path exists.
     */
    async exists(path: string): Promise<boolean> {
        return this.call("isExist", [path]);
    }
}

export const xandeumClient = new XandeumClient();
