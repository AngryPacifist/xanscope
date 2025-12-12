# pRPC API Reference

XanScope communicates with Xandeum pNodes using the pRPC (pNode RPC) protocol, a JSON-RPC 2.0 compatible API.

## Overview

| Property | Value |
|----------|-------|
| **Protocol** | JSON-RPC 2.0 |
| **Transport** | HTTP POST |
| **Default Port** | 6000 |
| **Content-Type** | `application/json` |

## Request Format

All pRPC requests follow this structure:

```json
{
  "jsonrpc": "2.0",
  "method": "<method-name>",
  "params": <optional-parameters>,
  "id": <unique-request-id>
}
```

## Response Format

Successful responses:
```json
{
  "jsonrpc": "2.0",
  "result": <response-data>,
  "id": <matching-request-id>
}
```

Error responses:
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": <error-code>,
    "message": "<error-message>"
  },
  "id": <matching-request-id>
}
```

---

## Methods Used by XanScope

### `get-version`

Returns the pNode software version.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "get-version",
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "version": "0.7.3"
  },
  "id": 1
}
```

**Used in XanScope:**
- Header version badge
- Version distribution chart

---

### `get-stats`

Returns comprehensive statistics about the pNode.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "get-stats",
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "metadata": {
      "total_pages": 1234,
      "total_files": 567,
      "total_dirs": 89
    },
    "stats": {
      "uptime": 864000,
      "requests_served": 50000,
      "bytes_transferred": 1073741824
    },
    "file_size": 1048576
  },
  "id": 1
}
```

**Used in XanScope:**
- Dashboard overview stats
- Filesystem metrics
- Network health indicators

---

### `get-pods`

Returns a list of all known peer pNodes discovered via gossip protocol.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "get-pods",
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "pods": [
      {
        "address": "192.168.1.100:9001",
        "is_public": true,
        "last_seen_timestamp": 1702400000
      }
    ],
    "total_count": 42
  },
  "id": 1
}
```

**Used in XanScope:**
- Nodes explorer grid
- Network overview count
- Fallback when `get-pods-with-stats` unavailable

---

### `get-pods-with-stats` (Heidelberg v0.7+)

Extended version of `get-pods` with additional metrics per node.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "get-pods-with-stats",
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "pods": [
      {
        "address": "173.212.207.32:9001",
        "is_public": true,
        "last_seen_timestamp": 1702400000,
        "pubkey": "DuLGyAtfki7PfVAqXhGeLv2UZiPeSAzVUukW4PSWiqEm",
        "rpc_port": 6000,
        "storage_committed": 104857600,
        "storage_usage_percent": 45.5,
        "storage_used": 47683584,
        "uptime": 864000,
        "version": "0.7.3"
      }
    ],
    "total_count": 158
  },
  "id": 1
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | Node's gossip address (IP:port) |
| `is_public` | boolean | Whether node accepts public connections |
| `last_seen_timestamp` | number | Unix timestamp of last gossip contact |
| `pubkey` | string | Node's ed25519 public key (base58) |
| `rpc_port` | number | Port for pRPC API (usually 6000) |
| `storage_committed` | number | Total storage capacity in bytes |
| `storage_usage_percent` | number | Percentage of storage used |
| `storage_used` | number | Actual bytes used |
| `uptime` | number | Seconds since node started |
| `version` | string | pNode software version |

**Used in XanScope:**
- Primary data source for Nodes Explorer
- Storage calculations
- Uptime metrics
- Version distribution

---

## Error Codes

| Code | Meaning |
|------|---------|
| `-32700` | Parse error (invalid JSON) |
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |

---

## XanScope Client Implementation

XanScope uses a custom pRPC client located at `lib/prpc-client.ts`:

```typescript
export class PrpcClient {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.PRPC_ENDPOINT || "http://127.0.0.1:6000/rpc";
  }

  async getVersion(): Promise<{ version: string }> {
    return this.call("get-version");
  }

  async getStats(): Promise<StatsResponse> {
    return this.call("get-stats");
  }

  async getPods(): Promise<PodsResponse> {
    return this.call("get-pods");
  }

  async getPodsWithStats(): Promise<PodsWithStatsResponse> {
    return this.call("get-pods-with-stats");
  }
}
```

---

## Caching Strategy

XanScope implements a caching layer to reduce pRPC calls:

| Data | Cache Duration | Reason |
|------|----------------|--------|
| `get-pods-with-stats` | 30 seconds | Balance freshness vs load |
| `get-version` | 5 minutes | Rarely changes |
| `get-stats` | 30 seconds | Live metrics |

---

## Additional pRPC Methods (Not Yet Implemented)

These methods are available in the pNode API but not currently used by XanScope:

| Method | Description |
|--------|-------------|
| `bigbang` | Create new filesystem |
| `create-file` | Create file in filesystem |
| `peek` | Read file contents |
| `poke` | Write to file |
| `stat` | Get file metadata |

See [Xandeum API Documentation](https://docs.xandeum.network) for complete reference.

---

## Testing pRPC Calls

### curl
```bash
curl -X POST http://127.0.0.1:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"get-pods-with-stats","id":1}' | jq
```

### PowerShell
```powershell
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:6000/rpc" `
  -ContentType "application/json" `
  -Body '{"jsonrpc":"2.0","method":"get-pods-with-stats","id":1}'
```

### JavaScript
```javascript
const response = await fetch('http://127.0.0.1:6000/rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'get-pods-with-stats',
    id: Date.now()
  })
});
const data = await response.json();
console.log(data.result);
```
