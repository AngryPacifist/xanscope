# Deployment Guide

This guide covers deploying XanScope to various hosting platforms.

## Deployment Options

| Platform | Best For | Cost |
|----------|----------|------|
| **Vercel** (Recommended) | Quick deployment, automatic SSL | Free tier available |
| **Docker** | Self-hosted, full control | Depends on hosting |
| **VPS** | Co-located with pNode | $5-20/month |

## Option 1: Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account ([sign up free](https://vercel.com/signup))

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy XanScope"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `xanscope` repository

3. **Configure Environment Variables**
   In the Vercel dashboard, add:
   
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | Your Mapbox token |
   | `NEXT_PUBLIC_USE_MOCK_DATA` | `true` (for demo) |
   
   > **Note**: For production with real data, you'll need a publicly accessible pRPC endpoint.

4. **Deploy**
   Click "Deploy" and Vercel will build and deploy automatically.

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Option 2: Docker

### Build Image

```bash
# Build the Docker image
docker build -t xanscope .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_MAPBOX_TOKEN=your_token \
  -e PRPC_ENDPOINT=http://host.docker.internal:6000/rpc \
  xanscope
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  xanscope:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_MAPBOX_TOKEN=${MAPBOX_TOKEN}
      - PRPC_ENDPOINT=http://pnode:6000/rpc
      - NEXT_PUBLIC_USE_MOCK_DATA=false
    depends_on:
      - pnode
    
  # If running pNode in the same compose
  pnode:
    image: xandeum/pnode:latest
    ports:
      - "6000:6000"
      - "9001:9001"
```

Run:
```bash
docker-compose up -d
```

## Option 3: VPS (Self-Hosted)

Best when you want XanScope running alongside your pNode.

### Prerequisites
- VPS with Node.js 18+
- PM2 for process management
- Nginx for reverse proxy (optional but recommended)

### Steps

1. **Clone and Build**
   ```bash
   ssh user@your-vps
   git clone https://github.com/AngryPacifist/xanscope.git
   cd xanscope
   npm install
   npm run build
   ```

2. **Create Environment File**
   ```bash
   cat > .env.local << EOF
   NEXT_PUBLIC_MAPBOX_TOKEN=your_token
   PRPC_ENDPOINT=http://127.0.0.1:6000/rpc
   NEXT_PUBLIC_USE_MOCK_DATA=false
   EOF
   ```

3. **Run with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "xanscope" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name analytics.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable HTTPS with Certbot**
   ```bash
   sudo certbot --nginx -d analytics.yourdomain.com
   ```

## Production Considerations

### Mock Data vs Real Data

| Scenario | Configuration |
|----------|---------------|
| **Demo/Hackathon** | Use mock data on Vercel |
| **Internal Dashboard** | SSH tunnel or VPS co-location |
| **Public Production** | Secure pRPC proxy with auth |

### Security Checklist

- [ ] Never expose pRPC publicly without authentication
- [ ] Use HTTPS in production
- [ ] Set appropriate CORS headers
- [ ] Consider rate limiting
- [ ] Keep environment variables secret

### Performance Tips

1. **Enable ISR** — Next.js Incremental Static Regeneration for cached pages
2. **CDN** — Vercel includes CDN automatically
3. **Caching** — XanScope caches pRPC responses for 30 seconds

## Next Steps

- [API Reference](./API-REFERENCE.md) — Understand the pRPC calls
- [Architecture](./ARCHITECTURE.md) — Learn the system design
