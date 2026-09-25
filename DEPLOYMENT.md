# Deployment Guide: Railway (Backend) + Vercel (Frontend)

## Prerequisites

- GitHub account with the note-app repository
- Supabase project (for authentication)
- PostgreSQL database (Railway provides one)
- Railway account
- Vercel account

---

## 1. Prepare Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. **Authentication Settings**:
   - Go to Authentication → Settings
   - **Site URL**: `https://your-frontend.vercel.app`
   - **Redirect URLs**: Add `https://your-frontend.vercel.app/**`
   - **Email Templates** → Confirm signup:
     - Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}?token_hash={{ .TokenHash }}&type=email`
4. **API Keys** (Project Settings → API):
   - Copy **Project URL** (e.g., `https://abcdef.supabase.co`)
   - Copy **Publishable (anon) key**

---

## 2. Deploy Backend to Railway

### Option A: Railway Dashboard (Recommended)

1. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub repo
2. Select your `note-app` repository
3. Set **Root Directory** to `backend`
4. Railway auto-detects Node.js — confirm
5. **Add PostgreSQL Database**:
   - In project → New → Database → Add PostgreSQL
   - Railway provides `DATABASE_URL` automatically
6. **Environment Variables** (Settings → Variables):
   ```
   PORT=5000
   DATABASE_URL=<auto-provided-by-railway>
   SUPABASE_URL=https://your-project.supabase.co
   NODE_ENV=production
   ```
7. **Deploy** — Railway builds and starts on `npm run start`

### Option B: Railway CLI

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Initialize in backend folder
cd backend
railway init

# Link to existing project or create new
railway link

# Add PostgreSQL
railway add postgresql

# Set variables
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Verify Backend

- Health check: `https://your-backend.railway.app/api/health` → `{"status":"ok"}`
- Notes endpoint should return 401 without auth

---

## 3. Deploy Frontend to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) → Add New → Project
2. Import your `note-app` GitHub repository
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`
5. **Build Command**: `npm run build` (auto-detected)
6. **Output Directory**: `dist` (auto-detected)
7. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=https://your-backend.railway.app
   ```
8. **Deploy**

### Option B: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend folder
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time)
# - Project name: note-app-frontend
# - Directory: ./frontend
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_URL

# Production deploy
vercel --prod
```

### Update `api.js` for Production

The current `api.js` uses relative `/api/notes` which works via Vite proxy in dev. For production, update to use `VITE_API_URL`:

```javascript
// frontend/src/api.js
const API_BASE = import.meta.env.VITE_API_URL || "";
const NOTES_ENDPOINT = `${API_BASE}/api/notes`;
```

### Verify Frontend

- Visit `https://your-frontend.vercel.app`
- Sign up → confirm email → sign in
- Create, edit, delete notes

---

## 4. Connect Frontend to Backend

1. **CORS**: Backend already uses `cors()` — accepts all origins in dev. For production, restrict:
   ```javascript
   // backend/src/app.js
   app.use(cors({
     origin: process.env.FRONTEND_URL || "http://localhost:5173",
     credentials: true
   }));
   ```
   Add `FRONTEND_URL=https://your-frontend.vercel.app` to Railway variables.

2. **Supabase Redirect URLs**: Ensure Vercel URL is in Supabase Auth redirect URLs.

---

## 5. Post-Deployment Checklist

- [ ] Backend health endpoint returns 200
- [ ] Frontend loads without console errors
- [ ] Sign up → email confirmation → sign in works
- [ ] Notes CRUD works (create, read, update, delete)
- [ ] Search filters notes in real-time
- [ ] Toast notifications appear on actions
- [ ] Sign out works
- [ ] Refresh persists session

---

## 6. Custom Domains (Optional)

### Railway
- Settings → Domains → Add Custom Domain
- Configure DNS CNAME to `your-app.railway.app`

### Vercel
- Project → Settings → Domains → Add
- Configure DNS per Vercel instructions

---

## 7. Monitoring & Logs

- **Railway**: View logs in dashboard; set up alerts for 5xx errors
- **Vercel**: Function logs in dashboard; enable Analytics
- **Supabase**: Auth logs in Dashboard → Authentication → Logs

---

## 8. Environment Variable Reference

### Backend (Railway)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection (auto) | `postgresql://...` |
| `SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | CORS origin | `https://app.vercel.app` |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_API_URL` | Backend API base URL | `https://api.railway.app` |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Set `FRONTEND_URL` in Railway, redeploy backend |
| Auth redirect fails | Check Supabase redirect URLs match Vercel domain |
| Notes not loading | Verify `VITE_API_URL` in Vercel, check backend logs |
| Database connection failed | Ensure Railway PostgreSQL is running, check `DATABASE_URL` |
| Build fails on Vercel | Ensure `frontend` is root directory, check Node version (18+) |

---

## Cost Estimate (Monthly)

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Railway | $5 credit/mo | ~$5-20/mo |
| Vercel | Unlimited personal | $20/mo (Pro) |
| Supabase | 500 MB DB, 50k MAU | $25/mo (Pro) |
| **Total** | **$0** | **~$30-50/mo** |

---

## Quick Commands Reference

```bash
# Backend local dev
cd backend && npm run dev

# Frontend local dev
cd frontend && npm run dev

# Full stack local
npm run dev

# Build frontend
npm run build --workspace frontend

# Railway logs
railway logs

# Vercel logs
vercel logs
```