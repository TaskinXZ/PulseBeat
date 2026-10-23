# 💓 PulseBeat

[![Live on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://pulsebeat-roan.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://pulsebeat-roan.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://pulsebeat-roan.vercel.app)
[![Supabase Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

> **Live Demo:** [https://pulsebeat-roan.vercel.app](https://pulsebeat-roan.vercel.app)  
> **Production Synthetic Uptime Monitoring, Latency Metrics & Public Incident Status Platform**

PulseBeat is a full-stack, production-ready alternative to BetterStack and Statuspage.io. It runs non-blocking synthetic health probes across HTTP, HTTPS, TCP, and DNS services, tracks response latency percentiles, monitors SSL certificate expiration, dispatches instant Discord outage alerts, and renders clean public status pages (`status.yourdomain.com`).

---

## 🚀 Key Features

* **Real Authentication & Accounts:** User registration, login, and secure workspace isolation powered by Supabase Auth and unified session management.
* **Production PostgreSQL Persistence:** Multi-tenant database schema (`supabase/schema.sql`) for monitors, incident timelines, subscriber notifications, and SSL metrics.
* **24/7 Autonomous Background Ping Engine:**
  * **Option A (Vercel Cron):** Automatically pings targets every minute via `/api/cron` (`vercel.json`) with zero server maintenance.
  * **Option B (Standalone Daemon):** Run `npm run worker` (`server/worker.mjs`) on any VPS, Docker, Render, or Railway container.
* **Instant Discord Webhook Alerts:** Dispatches rich formatted outage and recovery embeds to engineering Discord channels within seconds.
* **Viral Footer & White-Label Pro Toggle:** Built-in "Monitored by PulseBeat" viral growth badge on the public status page, with a 1-click white-label toggle for Pro users.
* **90-Day Interactive Timeline:** Visual daily uptime blocks with interactive latency tooltips and overall uptime percentages.
* **Incident Lifecycle Management:** Track incidents from `Investigating` $\rightarrow$ `Identified` $\rightarrow$ `Monitoring` $\rightarrow$ `Resolved` with subscriber notifications.
* **Embeddable Status Badges & Widgets:** Copy-paste SVG badges and interactive widgets for app footers or GitHub READMEs.

---

## 💎 Monetization & SaaS Tiers

| Tier | Price | Highlights |
| :--- | :--- | :--- |
| **Hobby Free** | $0/mo | 5 monitors, 60s checks, Discord alerts, "Monitored by PulseBeat" footer badge |
| **Pro Founder** | **$9/mo** | 25 monitors, 30s checks, **Custom Domain**, **White-label (remove branding)**, SSL expiry alerts |
| **Team / Scale** | **$29/mo** | 100+ monitors, multi-region validation, private password status pages, team seats |

---

## ⚙️ 3-Minute Production Setup

### 1. Set Up Database (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and paste the contents of [`supabase/schema.sql`](supabase/schema.sql). Click **Run**.
3. In PulseBeat, go to the **Database & Cloud Sync** tab and paste your Supabase Project URL and Anon Key (or add them as environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

### 2. Deploy to Vercel
Push your code to GitHub and connect it to Vercel. Vercel automatically detects [`vercel.json`](vercel.json) and provisions the **1-minute Vercel Cron Job** (`/api/cron`).

---

## 🛠️ Quickstart

```bash
# Clone the repository
git clone https://github.com/TaskinXZ/PulseBeat.git
cd PulseBeat

# Install dependencies
npm install

# Start development server
npm run dev

# (Optional) Run the standalone 24/7 background worker locally
npm run worker
```

---

## 📦 Build & Deploy

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```
