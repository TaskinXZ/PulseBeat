# 💓 PulseBeat

[![Live on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://pulsebeat-roan.vercel.app)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://pulsebeat-roan.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://pulsebeat-roan.vercel.app)

> **Live Demo:** [https://pulsebeat-roan.vercel.app](https://pulsebeat-roan.vercel.app)  
> **Synthetic Uptime Monitoring, Latency Metrics & Public Incident Status Platform on Vercel**

PulseBeat is an open-source, deployable alternative to BetterStack and Statuspage.io. It runs non-blocking synthetic health probes across HTTP, HTTPS, TCP, and DNS services, tracks response latency percentiles ($p50, p95, p99$), monitors SSL certificate validity, and renders beautiful public status pages (`status.yourdomain.com`).

---

## 🚀 Key Features

* **Synthetic Probe Checks:** Automated non-blocking checks across microservices, databases, and APIs.
* **90-Day Interactive Timeline:** Visual daily uptime blocks with interactive latency tooltips and overall uptime percentages.
* **Incident Lifecycle Management:** Track incidents from `Investigating` $\rightarrow$ `Identified` $\rightarrow$ `Monitoring` $\rightarrow$ `Resolved` with automated subscriber notification webhooks.
* **SSL Certificate Expiration Monitor:** Automatic warnings before SSL certificates expire.
* **Embeddable Status Badges & Widgets:** Copy-paste SVG badges and interactive widgets for app footers or GitHub READMEs.
* **Public vs Admin Views:** Instant toggle between internal administrative dashboard and public-facing customer status page.

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

Deployable to Vercel or Netlify with zero configuration (`npm run build` outputs to `dist/`).
