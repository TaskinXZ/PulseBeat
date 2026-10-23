// ============================================================================
// PulseBeat Standalone 24/7 Background Ping Worker
// Run locally or on any server/VPS: node server/worker.mjs
// ============================================================================

import http from 'http';

const CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds

const TARGETS = [
  {
    name: 'Core REST API Gateway',
    url: 'https://httpbin.org/status/200',
    type: 'https',
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  },
  {
    name: 'Customer Web Application',
    url: 'https://pulsebeat-roan.vercel.app',
    type: 'https',
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  },
];

const checkEndpoint = async (target) => {
  const start = Date.now();
  let statusCode = 0;
  let healthy = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(target.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'PulseBeat-Autonomous-Worker/1.0',
      },
    });

    clearTimeout(timeout);
    statusCode = res.status;
    healthy = res.status >= 200 && res.status < 400;
  } catch (err) {
    statusCode = 504;
    healthy = false;
  }

  const latency = Date.now() - start;
  const timestamp = new Date().toLocaleTimeString();

  if (healthy) {
    console.log(`[${timestamp}] 🟢 \x1b[32mPASS\x1b[0m ${target.name} (${statusCode}) - ${latency}ms`);
  } else {
    console.log(`[${timestamp}] 🔴 \x1b[31mFAIL\x1b[0m ${target.name} (${statusCode}) - ${latency}ms`);
    if (target.discordWebhookUrl) {
      notifyDiscord(target, statusCode, latency);
    }
  }
};

const notifyDiscord = async (target, code, latency) => {
  try {
    await fetch(target.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'PulseBeat Standalone Daemon',
        content: `🚨 **Outage Detected**: \`${target.name}\` returned HTTP ${code} (${latency}ms) at ${new Date().toISOString()}`,
      }),
    });
  } catch (e) {
    console.error('Failed to notify Discord:', e.message);
  }
};

console.log('⚡ PulseBeat Autonomous Background Worker Initialized');
console.log(`🎯 Monitoring ${TARGETS.length} endpoints every ${CHECK_INTERVAL_MS / 1000}s...`);

// Run cycle
const runCycle = async () => {
  for (const t of TARGETS) {
    await checkEndpoint(t);
  }
};

runCycle();
setInterval(runCycle, CHECK_INTERVAL_MS);

// Simple healthcheck port for hosting on Render / Railway
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', worker: 'PulseBeat Sentinel', uptime: process.uptime() }));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`📡 Background worker healthcheck server listening on port ${PORT}`);
});
