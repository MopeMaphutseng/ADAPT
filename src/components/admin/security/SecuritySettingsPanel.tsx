"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { api, apiGet, ClientError } from "@/lib/client";
import { Field, Toggle } from "@/components/admin/fields";

interface SecuritySettings {
  sessionHours: number;
  maxFailedLogins: number;
  failedLoginWindowMinutes: number;
  alertThreshold: number;
  autoAlerts: boolean;
  investorRepliesEnabled: boolean;
  investorPortalEnabled: boolean;
  requireAlertAckNote: boolean;
  allowedHosts: string[];
}

export function SecuritySettingsPanel() {
  const [form, setForm] = useState<SecuritySettings | null>(null);
  const [hostsText, setHostsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await apiGet<SecuritySettings>("/api/admin/security/settings");
        setForm(s);
        setHostsText(s.allowedHosts.join(", "));
      } catch (err) {
        setError(err instanceof ClientError ? err.message : "Failed to load security settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set<K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const allowedHosts = hostsText
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
      const saved = await api<SecuritySettings>("/api/admin/security/settings", {
        method: "PUT",
        body: { ...form, allowedHosts },
      });
      setForm(saved);
      setNotice("Security settings saved.");
    } catch (err) {
      setError(err instanceof ClientError ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <p className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading settings…</p>;
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      {notice ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{notice}</p> : null}

      <section className="card space-y-4 !p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Sign-in protection</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="ss-session" label="Session length (hours)" hint="Displayed to admins; tokens are signed for 12h.">
            <input id="ss-session" type="number" min={1} max={72} className="input" value={form.sessionHours} onChange={(e) => set("sessionHours", Number(e.target.value))} />
          </Field>
          <Field id="ss-max" label="Max failed logins (per window)">
            <input id="ss-max" type="number" min={3} max={100} className="input" value={form.maxFailedLogins} onChange={(e) => set("maxFailedLogins", Number(e.target.value))} />
          </Field>
          <Field id="ss-window" label="Failed-login window (minutes)">
            <input id="ss-window" type="number" min={1} max={1440} className="input" value={form.failedLoginWindowMinutes} onChange={(e) => set("failedLoginWindowMinutes", Number(e.target.value))} />
          </Field>
          <Field id="ss-threshold" label="Alert after this many failures" hint="Raises a HIGH alert per IP.">
            <input id="ss-threshold" type="number" min={1} max={100} className="input" value={form.alertThreshold} onChange={(e) => set("alertThreshold", Number(e.target.value))} />
          </Field>
        </div>
      </section>

      <section className="card space-y-3 !p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Alerting & access</h2>
        <Toggle id="ss-auto" label="Automatic security alerts" hint="Create alerts for throttled logins and repeated failures." checked={form.autoAlerts} onChange={(v) => set("autoAlerts", v)} />
        <Toggle id="ss-note" label="Require a note to resolve or dismiss alerts" checked={form.requireAlertAckNote} onChange={(v) => set("requireAlertAckNote", v)} />
        <Field id="ss-hosts" label="Allowed hosts" hint="Comma-separated hostnames permitted to originate admin requests.">
          <input id="ss-hosts" className="input" value={hostsText} onChange={(e) => setHostsText(e.target.value)} placeholder="localhost, 127.0.0.1" />
        </Field>
      </section>

      <section className="card space-y-3 !p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Investor communication</h2>
        <Toggle id="ss-replies" label="Allow replying to investors from the console" hint="When off, replies are saved but no email is dispatched." checked={form.investorRepliesEnabled} onChange={(v) => set("investorRepliesEnabled", v)} />
        <Toggle id="ss-portal" label="Enable investor self-service portal" hint="Lets investors continue threads via a private link. Off by default." checked={form.investorPortalEnabled} onChange={(v) => set("investorPortalEnabled", v)} />
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary !px-5 !py-2.5 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />} Save settings
        </button>
      </div>
    </form>
  );
}
