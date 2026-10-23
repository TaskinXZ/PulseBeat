# 💓 PulseBeat

[![Live on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://pulsebeat-roan.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://pulsebeat-roan.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://pulsebeat-roan.vercel.app)

> **Live Demo:** [https://pulsebeat-roan.vercel.app](https://pulsebeat-roan.vercel.app)  
> **Synthetic Uptime Monitoring, Latency Metrics & Public Incident Status Platform on Vercel**

PulseBeat is a lightweight, modern, and high-margin alternative to BetterStack and Statuspage.io. It runs non-blocking synthetic health probes across HTTP, HTTPS, TCP, and DNS services, tracks response latency percentiles, monitors SSL certificate expiration, dispatches instant Discord outage alerts, and renders clean public status pages (`status.yourdomain.com`).

---

## 🚀 Key Features

* **Synthetic Probe Checks:** Automated non-blocking checks across microservices, databases, and APIs.
* **Instant Discord Webhook Alerts:** Dispatches rich formatted outage and recovery embeds to engineering Discord channels within seconds.
* **Viral Footer & White-Label Pro Toggle:** Built-in "Monitored by PulseBeat" viral growth badge on the public status page, with a 1-click white-label toggle for Pro users.
* **90-Day Interactive Timeline:** Visual daily uptime blocks with interactive latency tooltips and overall uptime percentages.
* **Incident Lifecycle Management:** Track incidents from `Investigating` $\rightarrow$ `Identified` $\rightarrow$ `Monitoring` $\rightarrow$ `Resolved` with subscriber notifications.
* **SSL Certificate Expiration Monitor:** Automatic warnings before SSL certificates expire.
* **Embeddable Status Badges & Widgets:** Copy-paste SVG badges and interactive widgets for app footers or GitHub READMEs.
* **Minimalist UI & Navigation:** Clean tabbed admin workspace (Monitors, Incidents, Discord & Alerts, Status Page Customization, Plans & Monetization).

---

## 💎 Monetization & SaaS Tiers

| Tier | Price | Highlights |
| :--- | :--- | :--- |
| **Hobby Free** | $0/mo | 5 monitors, 60s checks, Discord alerts, "Monitored by PulseBeat" footer badge |
| **Pro Founder** | **$9/mo** | 25 monitors, 30s checks, **Custom Domain**, **White-label (remove branding)**, SSL expiry alerts |
| **Team / Scale** | **$29/mo** | 100+ monitors, multi-region validation, private password status pages, team seats |

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
```

---

## 📦 Build & Deploy

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

Deployable to Vercel with zero configuration (`npm run build` outputs to `dist/`).
