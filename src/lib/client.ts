export class ClientError extends Error {
  issues?: unknown[];
  constructor(message: string, issues?: unknown[]) {
    super(message);
    this.issues = issues;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? "POST";
  const url =
    (options.query
      ? `${path}?${new URLSearchParams(
          Object.entries(options.query)
            .filter(([, v]) => v !== undefined && v !== "")
            .map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : path) ?? path;

  const headers: Record<string, string> = {
    "x-adapt-requested-with": "adapt-client",
  };
  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "same-origin",
  });

  const data = (await res.json().catch(() => null)) as
    | { ok: boolean; error?: string; issues?: unknown[]; data?: T }
    | null;

  if (!res.ok || !data?.ok) {
    throw new ClientError(data?.error ?? "Request failed.", data?.issues);
  }
  return (data?.data as T) ?? ({} as T);
}

export async function apiGet<T = unknown>(path: string, query?: RequestOptions["query"]): Promise<T> {
  const qs = query
    ? `?${new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()}`
    : "";
  const res = await fetch(`${path}${qs}`, {
    headers: { "x-adapt-requested-with": "adapt-client" },
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => null)) as
    | { ok: boolean; error?: string; issues?: unknown[]; data?: T }
    | null;
  if (!res.ok || !data?.ok) {
    throw new ClientError(data?.error ?? "Request failed.", data?.issues);
  }
  return (data?.data as T) ?? ({} as T);
}