# NIX LIFE OS — PRODUCTION DEPLOYMENT PLAN

**Release Version:** `v1.0.0-RC1`  
**Deployment Target:** Cloud Run Production Container  
**Execution Date:** 2026-07-30  
**Deployment Lead:** Lead DevOps & Release Engineer  

---

## 1. Pre-Deployment Verification Phase

Before executing the deployment:
1. Verify `npm run lint` (`tsc --noEmit`) passes with 0 errors.
2. Verify `npm run build` generates `dist/index.html`, `dist/assets/*`, and `dist/server.cjs`.
3. Confirm environment variables are populated in Cloud Run secrets manager:
   - `GEMINI_API_KEY`: Secret injected server-side.
   - `APP_URL`: Set to production Cloud Run HTTPS endpoint.
   - `PORT`: Set to `3000`.

---

## 2. Step-by-Step Deployment Execution

### Step 1: Environment & Secret Audit
Ensure `GEMINI_API_KEY` is present in process environment and not hardcoded in source.

### Step 2: Build Artifact Compilation
```bash
npm run build
```
Confirms Vite SPA static bundle generation in `dist/` and esbuild server bundling into `dist/server.cjs`.

### Step 3: Container Image Build & Cloud Run Launch
The Cloud Run deployment pipeline packages the workspace and starts the application via:
```bash
npm run start
```
`npm run start` executes `node dist/server.cjs`, launching Express on `0.0.0.0:3000`.

### Step 4: Endpoint Health Check
Perform GET request to `/api/health`:
- Expected response: `{"status":"ok"}` with HTTP status `200`.

---

## 3. Post-Deployment Verification
Run the 10-point smoke test suite in `docs/POST_DEPLOYMENT_SMOKE_TEST.md`.
