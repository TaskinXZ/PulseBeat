import type { VercelRequest, VercelResponse } from '@vercel/node';

interface MonitorCheckTarget {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  discordWebhookUrl?: string;
}

interface CheckResult {
  id: string;
  name: string;
  url: string;
  latencyMs: number;
  statusCode: number;
  status: 'operational' | 'down';
  alertDispatched: boolean;
}

const sendDiscordAlert = async (
  webhookUrl: string,
  monitorName: string,
  url: string,
  statusCode: number,
  latencyMs: number,
  isOutage: boolean
) => {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) return false;

  const payload = {
    username: 'PulseBeat Cloud Sentinel',
    avatar_url: 'https://pulsebeat-roan.vercel.app/favicon.svg',
    embeds: [
      {
        title: isOutage
          ? `🚨 Cloud Outage Alert: ${monitorName}`
          : `✅ Resolved: ${monitorName} is Back Online`,
        description: isOutage
          ? `**Automated Probe Failed:** Server returned non-200 or timed out.\n**Target:** \`${url}\`\n**Status:** \`HTTP ${statusCode || 'Timeout'}\`\n**Latency:** \`${latencyMs}ms\``
          : `**Recovery Confirmed:** Endpoint responded successfully.\n**Target:** \`${url}\`\n**Status:** \`HTTP ${statusCode}\`\n**Latency:** \`${latencyMs}ms\``,
        color: isOutage ? 15158332 : 3066993,
        fields: [
          { name: 'Probe Region', value: 'Vercel Edge Cloud (Automated Cron)', inline: true },
          { name: 'Frequency', value: '60s synthetic probe', inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to post to Discord webhook:', err);
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow manual execution or Vercel cron invocation
  const customTargets = (req.body?.monitors as MonitorCheckTarget[]) || [
    {
      id: 'mon_api',
      name: 'Core REST API Gateway',
      url: 'https://httpbin.org/status/200',
      type: 'https',
      status: 'operational',
    },
    {
      id: 'mon_web',
      name: 'Customer Web Application',
      url: 'https://httpbin.org/status/200',
      type: 'https',
      status: 'operational',
    },
  ];

  const results: CheckResult[] = [];

  for (const mon of customTargets) {
    const startTime = Date.now();
    let statusCode = 0;
    let isHealthy = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Perform real HTTP request
      const response = await fetch(mon.url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'PulseBeat-Synthetic-Probe/1.0 (+https://pulsebeat-roan.vercel.app)',
        },
      });

      clearTimeout(timeoutId);
      statusCode = response.status;
      isHealthy = response.status >= 200 && response.status < 400;
    } catch {
      statusCode = 504; // Gateway timeout / connection error
      isHealthy = false;
    }

    const latencyMs = Math.max(1, Date.now() - startTime);
    const newStatus = isHealthy ? 'operational' : 'down';
    let alertDispatched = false;

    // If monitor went down, trigger Discord alert
    if (newStatus === 'down' && mon.discordWebhookUrl) {
      alertDispatched = await sendDiscordAlert(
        mon.discordWebhookUrl,
        mon.name,
        mon.url,
        statusCode,
        latencyMs,
        true
      );
    }

    results.push({
      id: mon.id,
      name: mon.name,
      url: mon.url,
      latencyMs,
      statusCode,
      status: newStatus,
      alertDispatched,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'PulseBeat synthetic probing cycle executed successfully.',
    checkedCount: results.length,
    timestamp: new Date().toISOString(),
    results,
  });
}
