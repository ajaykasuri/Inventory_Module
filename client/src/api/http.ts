// One place that talks to the server. Every other file calls api(...).
const BASE = "/api";
const REFRESH_KEY = "stockline.refresh";

// The access token lives in memory only. The refresh token is kept in
// localStorage so a page reload does not log you out.
let accessToken: string | null = null;
let onAuthLost: (() => void) | null = null;
let refreshing: Promise<boolean> | null = null;

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const tokens = {
  setAccess(token: string | null) { accessToken = token; },
  getRefresh() { return localStorage.getItem(REFRESH_KEY); },
  setRefresh(token: string | null) {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  },
};

export function setAuthLostHandler(fn: () => void) {
  onAuthLost = fn;
}

// Trades the refresh token for a new pair. If several requests fail at the same
// moment they share one refresh call, because each refresh token works only once.
export function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = tokens.getRefresh();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      accessToken = data.accessToken;
      tokens.setRefresh(data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => { refreshing = null; });
  return refreshing;
}

interface Options {
  method?: string;
  body?: unknown;
  auth?: boolean; // false for login, signup and other public calls
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;

  const send = () =>
    fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await send();

  // Expired access token: refresh once and retry the same request.
  if (res.status === 401 && auth) {
    if (await refreshSession()) {
      res = await send();
    } else {
      accessToken = null;
      tokens.setRefresh(null);
      onAuthLost?.();
    }
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? "Something went wrong. Please try again.", data?.details);
  }
  return data as T;
}
