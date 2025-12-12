# Connecting to a Real pNode

This guide explains how to connect XanScope to a live Xandeum pNode to display real network data.

## Overview

XanScope can connect to any pNode running the Heidelberg release (v0.7+). The pNode exposes a JSON-RPC 2.0 API on port 6000 that XanScope uses to fetch network data.

## Prerequisites

- A running Xandeum pNode (see [pNode Operator Guide](https://docs.xandeum.network/operator-guides))
- Network access to the pNode's pRPC port (6000)

## Connection Methods

### Method 1: Local pNode

If you're running a pNode on your local machine:

```env
# .env.local
PRPC_ENDPOINT=http://127.0.0.1:6000/rpc
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Restart the dev server and XanScope will connect automatically.

### Method 2: SSH Tunnel (Recommended for Development)

If your pNode is on a remote server (VPS), use an SSH tunnel:

```bash
# Open SSH tunnel in a separate terminal
ssh -i ~/.ssh/your_key user@your-server-ip \
    -L 6000:localhost:6000 \
    -N
```

> **Note**: `-L 6000:localhost:6000` forwards your local port 6000 to the pNode's port 6000.
> The `-N` flag keeps the tunnel open without executing commands.

Then configure XanScope:

```env
# .env.local
PRPC_ENDPOINT=http://127.0.0.1:6000/rpc
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Method 3: Direct Connection (Production)

> ⚠️ **Security Warning**: This exposes your pRPC API to the internet.

On your pNode, configure it to bind to all interfaces:

```bash
# When starting your pNode
pod --rpc-ip 0.0.0.0
```

Then XanScope can connect directly:

```env
PRPC_ENDPOINT=http://your-server-ip:6000/rpc
NEXT_PUBLIC_USE_MOCK_DATA=false
```

**Recommended**: Use a reverse proxy (nginx) with authentication and rate limiting.

## Verifying Connection

After configuring, verify the connection:

### 1. Test with curl/PowerShell

**Linux/Mac:**
```bash
curl -X POST http://127.0.0.1:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"get-version","id":1}'
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:6000/rpc" `
  -ContentType "application/json" `
  -Body '{"jsonrpc":"2.0","method":"get-version","id":1}'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "result": { "version": "0.7.3" },
  "id": 1
}
```

### 2. Check XanScope Logs

Start the dev server and watch the console:

```bash
npm run dev
```

You should see:
```
[PrpcClient] Using endpoint: http://127.0.0.1:6000/rpc
[PrpcClient] Calling get-pods-with-stats at 127.0.0.1:6000/rpc
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PRPC_ENDPOINT` | No | `http://127.0.0.1:6000/rpc` | Full URL to pNode's pRPC API |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | `true` | Set to `false` to use real data |
| `NEXT_PUBLIC_SOLANA_RPC` | No | Devnet | Xandeum/Solana RPC for filesystem ops |

## Troubleshooting

### "fetch failed" or "ECONNREFUSED"

**Cause**: XanScope can't reach the pRPC endpoint.

**Solutions**:
1. Verify the pNode is running: `ps aux | grep pod`
2. Check the port is listening: `netstat -tlnp | grep 6000`
3. Verify SSH tunnel is active (if using)
4. Check firewall rules

### "bad port" error

**Cause**: URL parsing issue with Node.js fetch.

**Solution**: Use `127.0.0.1` instead of `localhost` in `PRPC_ENDPOINT`.

### Empty node list

**Cause**: pNode may not have discovered peers yet.

**Solutions**:
1. Wait for gossip protocol to discover peers (can take a few minutes)
2. Check pNode logs for gossip activity
3. Verify pNode is connected to the network

### Connection works locally but not in production

**Cause**: Vercel/hosting provider can't reach your pRPC endpoint.

**Solutions**:
1. Use mock data for public demo
2. Expose pRPC publicly (with security measures)
3. Run XanScope on the same server as your pNode

## Next Steps

- [Deployment Guide](./DEPLOYMENT.md) — Deploy XanScope to production
- [API Reference](./API-REFERENCE.md) — Learn about pRPC methods
