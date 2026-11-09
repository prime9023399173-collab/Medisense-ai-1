# Medisense AI — Production Deployment Guide

## 1. System Requirements

- **Operating System**: Linux (Ubuntu 22.04+), macOS, or Windows 10/11
- **Node.js**: v20.0+ or v22.0+ (LTS recommended)
- **Memory**: Minimum 2 GB RAM (4 GB recommended for concurrent builds)
- **Disk Space**: ~500 MB for node dependencies and local PGlite database
- **Docker**: (Optional) Docker Engine 24.0+ and Docker Compose 2.0+

---

## 2. Local Native Deployment (Zero-Dependency)

Medisense AI comes pre-configured with embedded PostgreSQL (`@electric-sql/pglite`), so you don't even need an external database server to run the full application locally!

### Step 1: Environment Setup
```bash
cp .env.example .env
```

### Step 2: Launch Backend
```bash
cd backend
npm run start
```
The backend initializes the database schema in `.data/medisense_db` and seeds all demo personas automatically.

### Step 3: Launch Frontend
In a second terminal:
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Production Docker Deployment

Deploy the entire full-stack ecosystem (PostgreSQL 16, Redis 7, Backend API, and Nginx Frontend) with a single command:

```bash
docker-compose up -d --build
```

### Verify Container Health
```bash
docker-compose ps
```

All 4 services will report healthy:
- `medisense-postgres` on `localhost:5432`
- `medisense-redis` on `localhost:6379`
- `medisense-backend` on `localhost:4000`
- `medisense-frontend` on `localhost:3000`

To inspect application logs:
```bash
docker-compose logs -f backend
```

To stop the containers:
```bash
docker-compose down
```

---

## 4. Cloud Deployment (AWS / GCP / Render / Fly.io)

### Backend Container Configuration
- **Container Registry**: Push `backend/Dockerfile` to AWS ECR, GCP Artifact Registry, or Docker Hub.
- **Environment Variables**:
  - `DATABASE_URL`: Managed PostgreSQL connection string (AWS RDS / Supabase / Neon).
  - `REDIS_URL`: Managed Redis instance (AWS ElastiCache / Upstash).
  - `JWT_SECRET`: 256-bit secure secret key.
  - `OPENROUTER_API_KEY`: OpenRouter production API key for Llama 3.3 70B inference.
- **Health Check Path**: `/health` (HTTP 200).

### Frontend Static CDN Deployment
- Build static production assets:
  ```bash
  cd frontend
  npm run build
  ```
- Deploy the resulting `frontend/dist` directory to Vercel, Cloudflare Pages, AWS S3 + CloudFront, or Firebase Hosting.
- Set reverse proxy or API rewrites for `/api/*` pointing to your deployed backend API URL.

---

## 5. React Native Mobile App Compilation

To run the mobile app on a physical iOS or Android smartphone:

```bash
cd mobile
npm install
npx expo start
```
1. Install **Expo Go** from the iOS App Store or Google Play Store.
2. Scan the generated QR code on your phone.
3. In `mobile/src/services/api.ts`, replace `localhost` with your computer's local Wi-Fi IP address (e.g. `192.168.1.15`).
