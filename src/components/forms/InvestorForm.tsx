"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { api, ClientError } from "@/lib/client";
import { INVESTOR_TYPES } from "@/lib/constants";

const initial = {
  name: "",
  organization: "",
  email: "",
  phone: "",
  country: "",
  investorType: "ANGEL_INVESTOR" as string,
  interest: "",
  message: "",
};

export function InvestorForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof typeof initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api("/api/investors", { body: form });
      setStatus("success");
      setForm(initial);
    } catch (err) {
      const message =
        err instanceof ClientError
          ? err.message
          : "Something went wrong. Please try again or email us directly.";
      setError(message);
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="card text-center !py-16" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden="true" />
        <h3 className="mt-5 text-xl font-semibold text-white">Inquiry received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Thank you for your interest in ADAPT Technologies. Your inquiry has been received and
          will be reviewed by the founder.
        </p>
      </div>
    );
  }

  const inputCls =
    "input disabled:opacity-60 disabled:pointer-events-none";

  return (
    <form onSubmit={onSubmit} className="card space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="inv-name" className="label">Full name *</label>
          <input
            id="inv-name"
            className={inputCls}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="inv-org" className="label">Organization</label>
          <input
            id="inv-org"
            className={inputCls}
            value={form.organization}
            onChange={(e) => set("organization", e.target.value)}
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor="inv-email" className="label">Email *</label>
          <input
            id="inv-email"
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="inv-phone" className="label">Phone</label>
          <input
            id="inv-phone"
            type="tel"
            className={inputCls}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="inv-country" className="label">Country</label>
          <input
            id="inv-country"
            className={inputCls}
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            autoComplete="country-name"
          />
        </div>
        <div>
          <label htmlFor="inv-type" className="label">Investor type *</label>
          <select
            id="inv-type"
            className={inputCls}
            value={form.investorType}
            onChange={(e) => set("investorType", e.target.value)}
            required
          >
            {INVESTOR_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="inv-interest" className="label">Investment interest</label>
        <input
          id="inv-interest"
          className={inputCls}
          value={form.interest}
          onChange={(e) => set("interest", e.target.value)}
          placeholder="e.g. AI platforms, hardware, scaling to market"
        />
      </div>
      <div>
        <label htmlFor="inv-message" className="label">Message</label>
        <textarea
          id="inv-message"
          rows={5}
          className={inputCls}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us about yourself, your fund or how you would like to partner."
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:opacity-60">
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          "Start an Investment Conversation"
        )}
      </button>
      <p className="text-center text-sm text-slate-400">
        We respect your time and your data. Only the founder&apos;s team reviews investor inquiries.
      </p>
    </form>
  );
}