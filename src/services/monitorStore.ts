// PulseBeat Monitoring & Incident State Service

export type MonitorType = 'http' | 'https' | 'tcp' | 'dns';
export type MonitorStatus = 'operational' | 'degraded' | 'down' | 'maintenance';
export type IncidentImpact = 'minor' | 'major' | 'critical' | 'maintenance';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type UserPlan = 'free' | 'pro' | 'team';

export interface PingCheck {
  timestamp: string;
  latencyMs: number;
  statusCode: number;
  success: boolean;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  type: MonitorType;
  intervalSec: number;
  status: MonitorStatus;
  uptime90Days: number;
  currentLatencyMs: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  sslExpiryDays: number;
  sslIssuer: string;
  history90Days: MonitorStatus[];
  recentPings: PingCheck[];
}

export interface IncidentUpdate {
  id: string;
  timestamp: string;
  status: IncidentStatus;
  message: string;
}

export interface Incident {
  id: string;
  title: string;
  impact: IncidentImpact;
  status: IncidentStatus;
  affectedMonitorIds: string[];
  createdAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

export interface PulseBeatSettings {
  companyName: string;
  customDomain: string;
  logoUrl: string;
  userPlan: UserPlan;
  hidePulseBeatBadge: boolean;
  discordWebhookUrl: string;
  discordNotifyOnDown: boolean;
  discordNotifyOnDegraded: boolean;
  discordNotifyOnResolved: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  emailAlerts: string;
  subscribers: string[];
}

// Generate realistic 90-day history array
const generateHistory = (hasIssues: boolean): MonitorStatus[] => {
  const days: MonitorStatus[] = [];
  for (let i = 0; i < 90; i++) {
    if (hasIssues && i === 87) {
      days.push('degraded');
    } else if (hasIssues && i === 88) {
      days.push('down');
    } else {
      days.push('operational');
    }
  }
  return days;
};

const INITIAL_MONITORS: Monitor[] = [
  {
    id: 'mon_api',
    name: 'Core REST API Gateway',
    url: 'https://api.acmeworks.io/v1/health',
    type: 'https',
    intervalSec: 60,
    status: 'operational',
    uptime90Days: 99.99,
    currentLatencyMs: 38,
    latencyP50: 32,
    latencyP95: 54,
    latencyP99: 89,
    sslExpiryDays: 142,
    sslIssuer: "Let's Encrypt Authority X3",
    history90Days: generateHistory(false),
    recentPings: [
      { timestamp: '18:40', latencyMs: 38, statusCode: 200, success: true },
      { timestamp: '18:41', latencyMs: 35, statusCode: 200, success: true },
      { timestamp: '18:42', latencyMs: 42, statusCode: 200, success: true },
      { timestamp: '18:43', latencyMs: 36, statusCode: 200, success: true },
      { timestamp: '18:44', latencyMs: 38, statusCode: 200, success: true },
    ],
  },
  {
    id: 'mon_web',
    name: 'Customer Web Application',
    url: 'https://app.acmeworks.io',
    type: 'https',
    intervalSec: 60,
    status: 'operational',
    uptime90Days: 99.95,
    currentLatencyMs: 72,
    latencyP50: 68,
    latencyP95: 110,
    latencyP99: 145,
    sslExpiryDays: 88,
    sslIssuer: 'Cloudflare Inc ECC CA-3',
    history90Days: generateHistory(false),
    recentPings: [
      { timestamp: '18:40', latencyMs: 70, statusCode: 200, success: true },
      { timestamp: '18:41', latencyMs: 75, statusCode: 200, success: true },
      { timestamp: '18:42', latencyMs: 68, statusCode: 200, success: true },
      { timestamp: '18:43', latencyMs: 74, statusCode: 200, success: true },
      { timestamp: '18:44', latencyMs: 72, statusCode: 200, success: true },
    ],
  },
  {
    id: 'mon_auth',
    name: 'OAuth & Authentication Service',
    url: 'https://auth.acmeworks.io/oauth/healthz',
    type: 'https',
    intervalSec: 30,
    status: 'operational',
    uptime90Days: 99.91,
    currentLatencyMs: 82,
    latencyP50: 75,
    latencyP95: 130,
    latencyP99: 190,
    sslExpiryDays: 310,
    sslIssuer: 'DigiCert TLS RSA SHA256 2020 CA1',
    history90Days: generateHistory(false),
    recentPings: [
      { timestamp: '18:40', latencyMs: 80, statusCode: 200, success: true },
      { timestamp: '18:41', latencyMs: 85, statusCode: 200, success: true },
      { timestamp: '18:42', latencyMs: 79, statusCode: 200, success: true },
      { timestamp: '18:43', latencyMs: 83, statusCode: 200, success: true },
      { timestamp: '18:44', latencyMs: 82, statusCode: 200, success: true },
    ],
  },
  {
    id: 'mon_db',
    name: 'PostgreSQL Primary Replica',
    url: 'tcp://db.internal.acmeworks.io:5432',
    type: 'tcp',
    intervalSec: 30,
    status: 'operational',
    uptime90Days: 100.0,
    currentLatencyMs: 4,
    latencyP50: 3,
    latencyP95: 7,
    latencyP99: 12,
    sslExpiryDays: 365,
    sslIssuer: 'Internal CA',
    history90Days: generateHistory(false),
    recentPings: [
      { timestamp: '18:40', latencyMs: 4, statusCode: 200, success: true },
      { timestamp: '18:41', latencyMs: 3, statusCode: 200, success: true },
      { timestamp: '18:42', latencyMs: 4, statusCode: 200, success: true },
      { timestamp: '18:43', latencyMs: 5, statusCode: 200, success: true },
      { timestamp: '18:44', latencyMs: 4, statusCode: 200, success: true },
    ],
  },
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc_8912',
    title: 'Intermittent Latency on Auth Token Exchange',
    impact: 'minor',
    status: 'resolved',
    affectedMonitorIds: ['mon_auth'],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updates: [
      {
        id: 'upd_3',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'resolved',
        message: 'All worker connections have normalized. Latency stabilized below 85ms across all regions.',
      },
      {
        id: 'upd_2',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        status: 'monitoring',
        message: 'Hotfix deployed to scale redis session replica pool. Monitoring error rates.',
      },
      {
        id: 'upd_1',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'investigating',
        message: 'Investigating elevated response times and intermittent connection timeouts.',
      },
    ],
  },
];

export const DEFAULT_SETTINGS: PulseBeatSettings = {
  companyName: 'Acme Cloud Platform',
  customDomain: 'status.acmeworks.io',
  logoUrl: '',
  userPlan: 'free',
  hidePulseBeatBadge: false,
  discordWebhookUrl: '',
  discordNotifyOnDown: true,
  discordNotifyOnDegraded: true,
  discordNotifyOnResolved: true,
  telegramBotToken: '',
  telegramChatId: '',
  emailAlerts: 'devops@acmeworks.io',
  subscribers: ['team@acmeworks.io', 'lead-architect@partner.com'],
};

const STORAGE_KEYS = {
  MONITORS: 'pulsebeat_monitors_v2',
  INCIDENTS: 'pulsebeat_incidents_v2',
  SETTINGS: 'pulsebeat_settings_v2',
};

export const getStoredMonitors = (): Monitor[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MONITORS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MONITORS, JSON.stringify(INITIAL_MONITORS));
    return INITIAL_MONITORS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MONITORS;
  }
};

export const saveMonitors = (monitors: Monitor[]) => {
  localStorage.setItem(STORAGE_KEYS.MONITORS, JSON.stringify(monitors));
};

export const getStoredIncidents = (): Incident[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
    return INITIAL_INCIDENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_INCIDENTS;
  }
};

export const saveIncidents = (incidents: Incident[]) => {
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
};

export const getStoredSettings = (): PulseBeatSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: PulseBeatSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};
