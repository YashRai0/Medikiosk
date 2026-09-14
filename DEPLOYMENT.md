# MediKiosk — Production & Cloud Deployment Guide (SIH26047)

This guide walks you through deploying **MediKiosk** to the cloud for the Smart India Hackathon jury demonstration.

---

## Recommended Architecture: Render (Backend) + Vercel (Frontend)

- **Backend Web Service**: Render.com (free tier, persistent URL, supports Node.js/Express)
- **Frontend Single Page App**: Vercel or Netlify (free tier, instant global CDN, automatic SSL)

---

## Step 1: Push Code to GitHub

Open a terminal or PowerShell in `C:\Medikiosk`:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files
git add .

# 3. Commit
git commit -m "feat: SIH26047 MediKiosk prototype ready for deployment"

# 4. Create a new repository on GitHub (e.g. medikiosk-sih2026), then push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render.com

1. Go to **[Render.com](https://dashboard.render.com/)** and log in (with GitHub).
2. Click **New +** > **Web Service**.
3. Select your repository `medikiosk-sih2026`.
4. Configure the settings:
   - **Name**: `medikiosk-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DEMO_MODE`: `true`
   - `CLIENT_URL`: `*`
   - *(Optional: add `AI_API_KEY` for live Gemini)*
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render URL:  
   ?? `https://medikiosk-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. Go to **[Vercel.com](https://vercel.com/)** and log in with GitHub.
2. Click **Add New...** > **Project**.
3. Import your repository `medikiosk-sih2026`.
4. In the configuration window:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL`: Your backend Render URL (e.g. `https://medikiosk-api.onrender.com`)
   - `VITE_DEMO_MODE`: `true`
6. Click **Deploy**.
7. Once complete, you will receive your live URL:  
   ?? `https://medikiosk.vercel.app`

---

## Alternative: Deploy to Railway.app

If using **Railway.app**:
1. Click **New Project** > **Deploy from GitHub repo**.
2. Add a service pointing to `backend/` with start command `npm start`.
3. Add a second service pointing to `frontend/` with build command `npm run build` and start command `npm run preview`.
4. In frontend variables, set `VITE_API_URL` to the backend public domain.

---

## Verification Checklist

- [ ] Open frontend live URL in browser or tablet.
- [ ] Eyebrow badge reads `SMART INDIA HACKATHON • PROTOTYPE`.
- [ ] Click **Start Patient Session** &rarr; give consent.
- [ ] Complete Hindi voice / touch intake.
- [ ] Load sample prescription & verify 78% OCR confidence.
- [ ] Navigate to `/doctor/dashboard` & verify session appears in live OPD queue.
- [ ] Edit severity to "Mild", approve, and inspect generated FHIR R4 Bundle.
