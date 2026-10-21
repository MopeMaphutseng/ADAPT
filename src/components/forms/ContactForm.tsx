"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { api, ClientError } from "@/lib/client";
import { INQUIRY_TYPES } from "@/lib/constants";

const initial = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  subject: "",
  message: "",
  inquiryType: "GENERAL" as string,
};

export function ContactForm() {
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
      await api("/api/contact", { body: form });
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
        <h3 className="mt-5 text-xl font-semibold text-white">Message sent</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Thank you for contacting ADAPT Technologies. Your message has been received and our team
          will review it.
        </p>
      </div>
    );
  }

  const inputCls = "input disabled:opacity-60 disabled:pointer-events-none";

  return (
    <form onSubmit={onSubmit} className="card space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className="label">Name *</label>
          <input
            id="ct-name"
            className={inputCls}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="ct-email" className="label">Email *</label>
          <input
            id="ct-email"
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="ct-phone" className="label">Phone</label>
          <input
            id="ct-phone"
            type="tel"
            className={inputCls}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="ct-org" className="label">Organization</label>
          <input
            id="ct-org"
            className={inputCls}
            value={form.organization}
            onChange={(e) => set("organization", e.target.value)}
            autoComplete="organization"
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-subject" className="label">Subject *</label>
          <input
            id="ct-subject"
            className={inputCls}
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="ct-type" className="label">Inquiry type</label>
          <select
            id="ct-type"
            className={inputCls}
            value={form.inquiryType}
            onChange={(e) => set("inquiryType", e.target.value)}
          >
            {INQUIRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="ct-message" className="label">Message *</label>
        <textarea
          id="ct-message"
          rows={6}
          className={inputCls}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
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
          "Send Message"
        )}
      </button>
    </form>
  );
}