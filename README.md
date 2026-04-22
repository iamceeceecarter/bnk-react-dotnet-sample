# Bnk Sample: React + .NET API (GitHub Actions CI/CD)

This repo is a **portfolio-ready sample** that mirrors a common enterprise pattern at credit unions/banks:

- **React (Vite + TypeScript)** web app
- **.NET 8 Minimal API** backend
- **GitHub Actions** pipelines to build/test and deploy

> **Important**: This is a demo project (in-memory data). Replace the fake store with real persistence later.

---

## 1) Local Development

### Prereqs
- Node 18+ (or 20+)
- .NET SDK 8

### Run the API

```bash
cd backend/BnkBanking.Api
dotnet restore
dotnet run
```

API runs on HTTPS (Kestrel) and exposes:
- `GET /health`
- `GET /api/accounts`
- `POST /api/transfers`

Swagger (dev only): `https://localhost:7001/swagger`

### Run the React app

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` and `/health` to the .NET API.

---

## 2) CI/CD Pipelines (GitHub Actions)

### CI pipeline (`.github/workflows/ci.yml`)
Runs on PRs and on pushes to `main`:
- Backend: restore/build/test
- Frontend: npm install / lint / test / build

### Deploy pipeline (`.github/workflows/deploy.yml`)
On pushes to `main`:
- Deploys the **frontend** to **GitHub Pages**
- Deploys the **backend** to **Azure Web App** (using publish profile secret)

---

## 3) Configure Deploy Targets

### A) Frontend → GitHub Pages
1. In your repo: **Settings → Pages**
2. Set Source to **GitHub Actions**
3. Update the workflow env vars:
   - `VITE_BASE_PATH=/<REPO_NAME>/`
   - `VITE_API_BASE_URL=https://<your-azure-app>.azurewebsites.net`

### B) Backend → Azure Web App
1. Create an Azure Web App (Linux) with runtime **.NET 8**
2. Download the Publish Profile
3. Add it to GitHub repo secrets:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Add repo variable:
   - `AZURE_WEBAPP_NAME` (your web app name)

Also update API CORS allowed origin:
- `backend/BnkBanking.Api/appsettings.Production.json` to your GitHub Pages origin.

---

## 4) Push to GitHub

```bash
git init
git add .
git commit -m "Initial React + .NET sample"
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

---

## Notes
- This sample keeps **business rules server-side** (validation happens in the API).
- The UI is intentionally thin: it handles loading/error states and displays results.

