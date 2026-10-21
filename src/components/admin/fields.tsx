"use client";

export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required ? <span className="text-accent-400"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-400" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  id,
  label,
  checked,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-ink-900 px-4 py-3">
      <div>
        <span className="text-sm font-medium text-white">{label}</span>
        {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-accent-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function TextList({
  id,
  label,
  values,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  function update(i: number, v: string) {
    const next = [...values];
    next[i] = v;
    onChange(next);
  }
  return (
    <div>
      <span className="label">{label}</span>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              id={`${id}-${i}`}
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="input"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              aria-label={`Remove ${label.toLowerCase()} item`}
              className="shrink-0 rounded-lg border border-slate-700 px-3 text-slate-400 hover:border-red-500/50 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="rounded-lg border border-dashed border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 hover:border-accent-500 hover:text-accent-300"
        >
          + Add {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}