# 🛡️ DRM Shield

> **Plug-and-Play Digital Rights Management for Content Creators & EdTech Platforms**

A lightweight, platform-agnostic DRM system that protects PDFs, images, and documents from piracy — with AI-powered threat detection, dynamic watermarking, and session-bound access control. Any platform can integrate in under 30 minutes using the REST API.

[![CI](https://github.com/silasjohn-oss/drm-shield/actions/workflows/ci.yml/badge.svg)](https://github.com/silasjohn-oss/drm-shield/actions)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🔥 Live Demo

- **API Docs (Swagger):** `https://your-railway-url.up.railway.app/api/docs`
- **Admin Dashboard:** `http://localhost:3001`
- **Backend Health:** `https://your-railway-url.up.railway.app/`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 AES-256-GCM Encryption | Military-grade file encryption at rest |
| 💧 Dynamic Watermarking | Per-user email + timestamp stamped on every page at delivery time |
| ⏱️ Signed URLs | HMAC-SHA256 time-limited links that expire in 5 minutes |
| 🔒 Session Binding | Content access bound to authenticated user + device fingerprint |
| 🤖 AI Threat Detection | Featherless AI classifies every violation as LOW / MEDIUM / HIGH |
| 🔊 Voice Alerts | ElevenLabs TTS speaks security alerts on violations |
| 📋 Audit Logs | Immutable log of every access event with IP, device, and AI analysis |
| 🚫 Session Revocation | Kill any user's access globally in under 100ms |
| 📦 Drop-in SDK | One script tag, 30-minute integration |
| 📚 Swagger Docs | Full OpenAPI 3.0 documentation at `/api/docs` |

---

## 🏗️ Architecture

```
Client SDK
    │
    ▼
Cloudflare Edge (token validation)
    │
    ▼
API Server (Node.js + Express)
    │
    ├── Redis (session store + revocation)
    ├── PostgreSQL (users, content, audit logs)
    └── Encrypted Object Storage (AES-256-GCM files)
```

**Core layers:**
1. **Content Protection Engine** — AES-256-GCM encryption, dynamic PDF/image watermarking
2. **User & Session Binding** — JWT + Redis session validation, device fingerprinting
3. **Anti-Piracy & Traceability** — Visible watermarks with user ID + timestamp, LSB steganography for images
4. **Platform-Agnostic SDK** — REST API + drop-in JS SDK

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### 1. Clone & Install

```bash
git clone https://github.com/silasjohn-oss/drm-shield.git
cd drm-shield/backend
npm install
```

### 2. Start Database Services

```bash
docker run --name drm-postgres -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=drm -p 5432:5432 -d postgres
docker run --name drm-redis -p 6379:6379 -d redis
```

### 3. Configure Environment

Create a `.env` file in the `backend` folder:

```env
PORT=3000
JWT_SECRET=your-super-secret-key
DATABASE_URL=postgresql://postgres:password123@localhost:5432/drm
REDIS_URL=redis://localhost:6379
FEATHERLESS_API_KEY=your_featherless_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ENCRYPTION_KEY=your_32_byte_hex_key
```

Generate a secure encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Create Database Tables

```bash
docker exec -it drm-postgres psql -U postgres -d drm
```

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  ip TEXT,
  device_hash TEXT,
  violation BOOLEAN,
  threat_level TEXT,
  ai_analysis TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  title TEXT,
  filename TEXT,
  owner_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Add Sample Content

Sample PDF files are pre-generated. You can:
- Use the existing 5 sample PDFs in `uploads/` folder
- Add your own PDFs: Place any PDF in `backend/uploads/`
- Generate new samples: Run `npm run generate-samples`
- Create custom PDFs: Run `node scripts/createCustomPdf.js "filename.pdf" "Title" "Content"`

### Available NPM Scripts

```bash
npm start                   # Start the DRM Shield server
npm run generate-samples    # Generate all 5 sample PDF files
```

### 6. Start the Server

```bash
node server.js
```

Visit:
- **API:** `http://localhost:3000`
- **Swagger Docs:** `http://localhost:3000/api/docs`

### 7. Start the Admin Dashboard

```bash
cd ../admin-dashboard
npm install
npm start
```

Visit `http://localhost:3001` and log in with your registered account.

---

## 📡 API Reference

Full documentation available at `/api/docs` (Swagger UI).

### Auth

```
POST /auth/register     — Register a new user
POST /auth/login        — Login and receive JWT token
```

### DRM

```
POST /drm/generate-link     — Generate a 5-minute signed URL
GET  /drm/files             — List all available PDF files (auth required)
GET  /drm/stream            — Stream watermarked content (via signed URL)
GET  /drm/logs              — Get audit logs (auth required)
POST /drm/revoke-session    — Revoke a user session instantly
POST /drm/simulate-violation — Trigger AI analysis + voice alert (demo)
POST /drm/trace-leak        — Upload a file to identify the leak source
GET  /drm/voice-alert       — Download the latest voice alert audio
```

### Example: List Available Files

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/drm/files
```

Response:
```json
{
  "msg": "Available files",
  "files": [
    {"filename": "sample.pdf", "size": 1024},
    {"filename": "confidential-report.pdf", "size": 1049},
    {"filename": "technical-specs.pdf", "size": 1034}
  ],
  "total": 3
}
```

### Example: Generate a Secure Link

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'

# 2. Generate secure link (use token from step 1)
curl -X POST http://localhost:3000/drm/generate-link \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentId": 1}'

# 3. Download default file (sample.pdf) with watermark
curl "YOUR_SIGNED_URL" -o protected-file.pdf

# 4. Download specific file (e.g., confidential-report.pdf)
curl "YOUR_SIGNED_URL&file=confidential-report.pdf" -o protected-report.pdf

# 5. Download another file (e.g., technical-specs.pdf)
curl "YOUR_SIGNED_URL&file=technical-specs.pdf" -o protected-specs.pdf
```

**Note:** Add the `file` query parameter to request a specific PDF from the uploads folder.

---

## 🧪 Testing

### Run the Complete Test Suite (PowerShell)

A PowerShell testing script is included to validate all DRM Shield features:

```powershell
.\test.ps1
```

This will:
1. Register a test user
2. Login and get JWT token
3. List all available PDF files
4. Generate a signed access link
5. Download multiple protected PDFs with different filenames
6. Verify watermarking on each file

### Manual Testing

See `QUICK_REFERENCE.md` for step-by-step manual testing commands.

---

## 📚 Documentation

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** — Quick commands and API examples
- **[MULTI_FILE_SUPPORT.md](MULTI_FILE_SUPPORT.md)** — Complete multi-file implementation guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** — Technical implementation details
- **Swagger API Docs** — `/api/docs` when server is running

---

### File Encryption (AES-256-GCM)

Each file is encrypted before storage. The output format is:

```
[ IV (16 bytes) ][ Auth Tag (16 bytes) ][ Encrypted Data ]
```

The auth tag ensures tamper detection — if the file is modified after encryption, decryption fails.

### Signed URLs (HMAC-SHA256)

```
URL = /drm/stream?uid={userId}&cid={contentId}&exp={unixTimestamp}&sig={signature}

signature = HMAC-SHA256(secret, "uid={uid}|cid={cid}|exp={exp}")
```

Signatures are verified using `crypto.timingSafeEqual` to prevent timing attacks.

### Dynamic Watermarking

Watermarks are applied **at delivery time**, not at upload time. The same encrypted file produces a different watermarked output for every user:

```
encrypted_file → decrypt → stamp(email + userId + timestamp) → send to user
```

### Steganographic Watermarking (Images)

User IDs are embedded into image pixel LSBs (Least Significant Bit steganography). The change is invisible to the human eye but recoverable via the `/drm/trace-leak` endpoint.

---

## 🧪 Security

- **OWASP Compliant** — helmet.js security headers, rate limiting (100 req/15min), input validation, CORS control
- **Passwords** — bcrypt hashed (cost factor 10), never stored in plaintext
- **Tokens** — Short-lived JWTs (30 min), session IDs stored in Redis with 30-minute TTL
- **Secrets** — Never logged, never sent to client

---

## 📁 Project Structure

```
drm-shield/
├── backend/
│   ├── routes/
│   │   ├── authRoutes.js          # Register, login
│   │   └── drmRoutes.js           # Content protection endpoints
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── services/
│   │   ├── encryptionService.js   # AES-256-GCM encrypt/decrypt
│   │   ├── watermarkService.js    # PDF dynamic watermarking
│   │   ├── steganographyService.js # LSB image watermarking
│   │   ├── signedUrlService.js    # HMAC-SHA256 URL signing
│   │   ├── aiService.js           # Featherless AI threat analysis (mocked locally)
│   │   └── voiceService.js        # ElevenLabs voice alerts (mocked locally)
│   ├── scripts/
│   │   ├── generateSamplePdfs.js  # Generate 5 sample PDFs
│   │   └── createCustomPdf.js     # Create custom PDF files
│   ├── uploads/
│   │   ├── sample.pdf             # Default sample document
│   │   ├── confidential-report.pdf # Business report example
│   │   ├── technical-specs.pdf    # Technical documentation example
│   │   ├── financial-summary.pdf  # Financial data example
│   │   ├── product-roadmap.pdf    # Product planning example
│   │   ├── encrypted/             # Encrypted files storage
│   │   ├── raw/                   # Uploaded raw files
│   │   └── temp/                  # Temporary watermarked files (auto-cleaned)
│   ├── db.js                      # PostgreSQL connection
│   ├── redisClient.js             # Redis connection
│   ├── swagger.js                 # OpenAPI spec
│   ├── server.js                  # Express app entry point
│   ├── test.ps1                   # PowerShell testing script
│   ├── README.md                  # Main documentation
│   ├── QUICK_REFERENCE.md         # Quick command reference
│   ├── MULTI_FILE_SUPPORT.md      # Multi-file implementation guide
│   ├── IMPLEMENTATION_SUMMARY.md  # Technical details
│   └── .env                       # Environment variables (not committed)
│
├── admin-dashboard/
│   └── src/
│       ├── App.js                 # Root component
│       ├── Login.js               # Auth screen
│       └── Dashboard.js           # Main dashboard (Overview, Content, Logs, Sessions)
│
└── .github/
    └── workflows/
        └── ci.yml                 # GitHub Actions CI pipeline
```

---

## 🌐 Deployment

This project is deployed on **Railway** with managed PostgreSQL and Redis.

### Deploy Your Own

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add PostgreSQL and Redis plugins
4. Set all environment variables in the Variables tab
5. Run the SQL schema in the PostgreSQL Query tab
6. Railway auto-generates your live URL

---

## 🤝 Platform Integration (SDK)

Add DRM Shield to any existing platform in under 30 minutes:

```html
<script src="https://your-railway-url.up.railway.app/sdk/drm-shield.js"></script>
<script>
  DRMShield.init({
    apiKey: 'YOUR_API_KEY',
    contentId: 'abc123',
    container: '#viewer'
  });
</script>
```

The SDK handles token fetching, content rendering in a locked iframe, and right-click/print prevention automatically.

---

## 📊 Performance Targets

| Metric | Target |
|---|---|
| Link generation latency | < 100ms |
| Concurrent users | 10,000+ |
| Session revocation | < 100ms |
| OWASP compliance | Level A |
| Bypass Resistance Score | > 95% |

---

## 🛣️ Roadmap

- [ ] HLS video encryption with AES-128 segment keys
- [ ] Widevine / EME browser DRM for video
- [ ] Multi-region edge deployment via Cloudflare Workers
- [ ] Invisible steganographic watermarking for PDFs
- [ ] Webhook notifications on violations
- [ ] Team/organisation multi-tenancy
- [ ] Usage analytics dashboard

---

## 🙏 Built With

- [Node.js](https://nodejs.org) + [Express](https://expressjs.com)
- [PostgreSQL](https://postgresql.org) + [Redis](https://redis.io)
- [pdf-lib](https://pdf-lib.js.org) — PDF watermarking
- [sharp](https://sharp.pixelplumbing.com) — Image processing & steganography
- [Featherless AI](https://featherless.ai) — LLM threat classification
- [ElevenLabs](https://elevenlabs.io) — Voice alerts
- [React](https://react.dev) — Admin dashboard
- [Railway](https://railway.app) — Deployment

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*Built in 24 hours for a hackathon. Go forth and protect your content.* 🚀
