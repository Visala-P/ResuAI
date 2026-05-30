# Digital Portfolios: Vercel Production Deployment Guide

This guide details steps to take your **DraftCraft AI Resume Builder** live in seconds on Vercel with absolute production readiness.

---

## 🚀 Option 1: Zero-Config Static Web App (Vite Built)

Vercel natively optimizes client-side single-page applications. If you prefer to deploy the frontend to Vercel statically and use lightweight serverless infrastructure or external environments, follow these steps:

### 1. Install Vercel CLI
Deploy directly from your terminal using the Vercel Command-Line Interface:
```bash
npm install -g vercel
```

### 2. Run the Deployment
Authenticate and select target variables:
```bash
# Log in to your Vercel account
vercel login

# Initialize and link your project
vercel
```

**Recommended deployment settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Development Command:** `npm run dev`

### 3. Add Production API Secret Keys
Go to your **Vercel Project Dashboard** > **Settings** > **Environment Variables** and add:
- **Key:** `GEMINI_API_KEY`
- **Value:** `<Your_Google_AI_Studio_Secret_API_Key>`

Now, deploy it to live production:
```bash
vercel --prod
```

---

## 🛠️ Option 2: Full-Stack Node + Express Hosting on Vercel

If you want to host both the Express API and the Vite frontend on Vercel concurrently, we have configured a `vercel.json` descriptor configuration.

### 1. Create a `vercel.json` in project root
Initialize routing definitions for Vercel's serverless functions by creating:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "dist/$1",
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "dist/index.html"
    }
  ]
}
```

### 2. Trigger deployed pipeline
```bash
vercel --prod
```
Configure your environment secrets via the Vercel UI and trigger new pipelines seamlessly!
