import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Incident,
  getStoredMonitors,
  saveMonitors,
  getStoredIncidents,
  saveIncidents,
  MonitorType,
  IncidentImpact,
  IncidentStatus,
} from './services/monitorStore';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  ExternalLink,
  Lock,
  Globe,
  Radio,
  Share2,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [viewMode, setViewMode] = useState<'admin' | 'public'>('admin');
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modals
  const [isNewMonitorOpen, setIsNewMonitorOpen] = useState(false);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [selectedIncidentForUpdate, setSelectedIncidentForUpdate] = useState<Incident | null>(null);

  // New Monitor form
  const [monName, setMonName] = useState('');
  const [monUrl, setMonUrl] = useState('https://');
  const [monType, setMonType] = useState<MonitorType>('https');
  const [monInterval, setMonInterval] = useState(60);

  // New Incident form
  const [incTitle, setIncTitle] = useState('');
  const [incImpact, setIncImpact] = useState<IncidentImpact>('minor');
  const [incMessage, setIncMessage] = useState('');
  const [incAffectedMonitor, setIncAffectedMonitor] = useState('');

  // Update Incident form
  const [updateStatus, setUpdateStatus] = useState<IncidentStatus>('monitoring');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    setMonitors(getStoredMonitors());
    setIncidents(getStoredIncidents());
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Run synthetic ping checks across all monitors
  const handlePingAll = () => {
    setIsPingingAll(true);
    setTimeout(() => {
      const updated = monitors.map((m) => {
        const variance = Math.floor(Math.random() * 15) - 7;
        const newLatency = Math.max(8, m.currentLatencyMs + variance);
        const newPing = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          latencyMs: newLatency,
          statusCode: 200,
          success: true,
        };
        return {
          ...m,
          currentLatencyMs: newLatency,
          recentPings: [...m.recentPings.slice(1), newPing],
        };
      });
      setMonitors(updated);
      saveMonitors(updated);
      setIsPingingAll(false);
    }, 700);
  };

  // Create new monitor
  const handleCreateMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monName.trim() || !monUrl.trim()) return;

    const newMon: Monitor = {
      id: `mon_${Date.now()}`,
      name: monName,
      url: monUrl,
      type: monType,
      intervalSec: monInterval,
      status: 'operational',
      uptime90Days: 100.0,
      currentLatencyMs: Math.floor(Math.random() * 45) + 20,
      latencyP50: 25,
      latencyP95: 50,
      latencyP99: 80,
      sslExpiryDays: 180,
      sslIssuer: "Let's Encrypt Authority X3",
      history90Days: Array(90).fill('operational'),
      recentPings: [
        { timestamp: '18:40', latencyMs: 35, statusCode: 200, success: true },
        { timestamp: '18:41', latencyMs: 38, statusCode: 200, success: true },
        { timestamp: '18:42', latencyMs: 32, statusCode: 200, success: true },
        { timestamp: '18:43', latencyMs: 40, statusCode: 200, success: true },
        { timestamp: '18:44', latencyMs: 36, statusCode: 200, success: true },
      ],
    };

    const updated = [newMon, ...monitors];
    setMonitors(updated);
    saveMonitors(updated);
    setIsNewMonitorOpen(false);
    setMonName('');
    setMonUrl('https://');
  };

  // Create new incident
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim() || !incMessage.trim()) return;

    const newInc: Incident = {
      id: `inc_${Date.now()}`,
      title: incTitle,
      impact: incImpact,
      status: 'investigating',
      affectedMonitorIds: incAffectedMonitor ? [incAffectedMonitor] : [],
      createdAt: new Date().toISOString(),
      updates: [
        {
          id: `upd_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'investigating',
          message: incMessage,
        },
      ],
    };

    const updated = [newInc, ...incidents];
    setIncidents(updated);
    saveIncidents(updated);
    setIsNewIncidentOpen(false);
    setIncTitle('');
    setIncMessage('');
  };

  // Add update to existing incident
  const handleAddIncidentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForUpdate || !updateMessage.trim()) return;

    const newUpdate = {
      id: `upd_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: updateStatus,
      message: updateMessage,
    };

    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === selectedIncidentForUpdate.id) {
        return {
          ...inc,
          status: updateStatus,
          resolvedAt: updateStatus === 'resolved' ? new Date().toISOString() : undefined,
          updates: [newUpdate, ...inc.updates],
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
    saveIncidents(updatedIncidents);
    setSelectedIncidentForUpdate(null);
    setUpdateMessage('');
  };

  // Determine overall status
  const hasDown = monitors.some((m) => m.status === 'down');
  const hasDegraded = monitors.some((m) => m.status === 'degraded');
  const overallStatus = hasDown ? 'down' : hasDegraded ? 'degraded' : 'operational';
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                PulseBeat
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO-SYNTHETICS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-mono">
              Synthetic Probes: 4 Active (60s cycle)
            </span>
          </div>
        </div>

        {/* View Switcher: Admin Console vs Public Status Page */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setViewMode('public')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'public' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Public Status View
            </button>
          </div>

          {viewMode === 'admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePingAll}
                disabled={isPingingAll}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition active:scale-95 border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isPingingAll ? 'animate-spin' : ''}`} />
                {isPingingAll ? 'Probing...' : 'Ping All Now'}
              </button>

              <button
                onClick={() => setIsNewIncidentOpen(true)}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Report Incident
              </button>

              <button
                onClick={() => setIsNewMonitorOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                New Monitor
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Overall Status Banner */}
        <div
          className={`p-6 rounded-3xl border flex items-center justify-between shadow-xl backdrop-blur ${
            overallStatus === 'operational'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : overallStatus === 'degraded'
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                overallStatus === 'operational'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : overallStatus === 'degraded'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {overallStatus === 'operational' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {overallStatus === 'operational'
                  ? 'All Systems Operational'
                  : overallStatus === 'degraded'
                  ? 'Partial System Degradation'
                  : 'Major System Outage'}
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Last checked seconds ago across 4 multi-region synthetic checkpoints
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 font-mono text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Average Latency</span>
              <span className="text-white font-bold text-base">
                {Math.round(monitors.reduce((acc, m) => acc + m.currentLatencyMs, 0) / monitors.length)}ms
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Overall Uptime (90d)</span>
              <span className="text-emerald-400 font-bold text-base">99.93%</span>
            </div>
          </div>
        </div>

        {/* Ongoing Incidents Section */}
        {activeIncidents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active Incident ({activeIncidents.length})
            </h2>

            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-lg space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-lg">{inc.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {inc.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                      Impact: {inc.impact}
                    </span>
                  </div>

                  {viewMode === 'admin' && (
                    <button
                      onClick={() => {
                        setSelectedIncidentForUpdate(inc);
                        setUpdateStatus(inc.status);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                    >
                      Post Update / Resolve
                    </button>
                  )}
                </div>

                {/* Timeline trail */}
                <div className="space-y-4 pt-1">
                  {inc.updates.map((upd, idx) => (
                    <div key={upd.id} className="relative pl-6 border-l-2 border-slate-800 space-y-1">
                      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="font-bold uppercase text-amber-400">{upd.status}</span>
                        <span>•</span>
                        <span>{new Date(upd.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">{upd.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Monitors List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              Service Components & Synthetics
            </h2>
            <span className="text-xs font-mono text-slate-400">90 Days Historical Timeline</span>
          </div>

          <div className="space-y-4">
            {monitors.map((mon) => (
              <div
                key={mon.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        mon.status === 'operational'
                          ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                          : mon.status === 'degraded'
                          ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                          : 'bg-rose-500 shadow-lg shadow-rose-500/50'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{mon.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                          {mon.type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 block truncate max-w-md">
                        {mon.url}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SSL: {mon.sslExpiryDays}d left</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{mon.currentLatencyMs}ms</span>
                    </div>

                    <div className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {mon.uptime90Days}% Uptime
                    </div>
                  </div>
                </div>

                {/* 90-Day Uptime Bar visualizer */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-[3px] overflow-x-auto py-1">
                    {mon.history90Days.map((st, i) => (
                      <div
                        key={i}
                        title={`Day ${90 - i} days ago: ${st.toUpperCase()}`}
                        className={`flex-1 min-w-[5px] h-7 rounded-sm transition hover:scale-y-125 ${
                          st === 'operational'
                            ? 'bg-emerald-500/80 hover:bg-emerald-400'
                            : st === 'degraded'
                            ? 'bg-amber-400 hover:bg-amber-300'
                            : 'bg-rose-500 hover:bg-rose-400'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>90 days ago</span>
                    <span>Today (100% Operational)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embeddable Badge & Quick Integration Guide */}
        {viewMode === 'admin' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  Embeddable Status Badges & Widgets
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Drop an interactive live badge directly into your application footer or GitHub README.
                </p>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    `<a href="https://status.acmeworks.io"><img src="https://pulsebeat.dev/badge/acme/status.svg" alt="System Status" /></a>`,
                    'badge',
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copiedText === 'badge' ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Badge HTML
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-blue-300 border border-slate-800 overflow-x-auto">
{`<a href="https://status.acmeworks.io">
  <img src="https://pulsebeat.dev/badge/acme/status.svg" alt="System Status: Operational" />
</a>`}
            </pre>
          </div>
        )}
      </main>

      {/* New Monitor Modal */}
      {isNewMonitorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Add Synthetic Monitor
              </h3>
              <button onClick={() => setIsNewMonitorOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMonitor} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Monitor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Payments Microservice"
                  value={monName}
                  onChange={(e) => setMonName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Endpoint URL / Host</label>
                <input
                  type="text"
                  value={monUrl}
                  onChange={(e) => setMonUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Protocol</label>
                  <select
                    value={monType}
                    onChange={(e) => setMonType(e.target.value as MonitorType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="https">HTTPS</option>
                    <option value="http">HTTP</option>
                    <option value="tcp">TCP Socket</option>
                    <option value="dns">DNS Lookup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Check Interval</label>
                  <select
                    value={monInterval}
                    onChange={(e) => setMonInterval(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value={30}>Every 30s</option>
                    <option value={60}>Every 60s</option>
                    <option value={300}>Every 5m</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMonitorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  Create Monitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Incident Modal */}
      {isNewIncidentOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Declare New Incident
              </h3>
              <button onClick={() => setIsNewIncidentOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Incident Title</label>
                <input
                  type="text"
                  placeholder="e.g. Elevated Latency on Checkout API"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Severity Impact</label>
                  <select
                    value={incImpact}
                    onChange={(e) => setIncImpact(e.target.value as IncidentImpact)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="minor">Minor Degradation</option>
                    <option value="major">Major Outage</option>
                    <option value="critical">Critical System Down</option>
                    <option value="maintenance">Scheduled Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Affected Component</label>
                  <select
                    value={incAffectedMonitor}
                    onChange={(e) => setIncAffectedMonitor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="">All Services</option>
                    {monitors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Initial Message to Customers</label>
                <textarea
                  rows={4}
                  placeholder="e.g. We are currently investigating reports of intermittent connection timeouts..."
                  value={incMessage}
                  onChange={(e) => setIncMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewIncidentOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  Publish Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Update to Incident Modal */}
      {selectedIncidentForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Update Incident: {selectedIncidentForUpdate.title}</h3>
              <button onClick={() => setSelectedIncidentForUpdate(null)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIncidentUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">New Lifecycle Stage</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as IncidentStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="investigating">Investigating</option>
                  <option value="identified">Identified (Root Cause Found)</option>
                  <option value="monitoring">Monitoring (Fix Deployed)</option>
                  <option value="resolved">Resolved (Normal Operations Restored)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Status Update Note</label>
                <textarea
                  rows={4}
                  placeholder="Explain current mitigation or resolution..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForUpdate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
