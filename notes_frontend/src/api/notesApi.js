const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Determine the API base URL from the environment.
 * Preference order:
 * - REACT_APP_API_BASE
 * - REACT_APP_BACKEND_URL
 *
 * Important: values are controlled by the container .env; do not hardcode.
 */
function getApiBase() {
  const base =
    (process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "").trim();

  // If not set, default to same-origin. This supports proxying setups.
  return base;
}

function joinUrl(base, path) {
  if (!base) return path;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(path, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

    if (!res.ok) {
      const message =
        (payload && typeof payload === "object" && (payload.detail || payload.message)) ||
        (typeof payload === "string" && payload) ||
        `Request failed with status ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Try common REST shapes to maximize compatibility with the backend without hardcoding one spec.
 * Supported patterns:
 * - /notes
 * - /api/notes
 */
const CANDIDATE_PREFIXES = ["/notes", "/api/notes"];

async function tryPrefixes(makeRequest) {
  let lastErr = null;
  for (const prefix of CANDIDATE_PREFIXES) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await makeRequest(prefix);
    } catch (e) {
      // If 404, try next prefix. Otherwise, bubble up immediately.
      if (e && e.status === 404) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error("Unable to reach notes endpoint (all candidate paths failed).");
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Fetch all notes. Returns an array of notes. */
  const base = getApiBase();
  return tryPrefixes((prefix) => fetchJson(joinUrl(base, prefix), { method: "GET" }));
}

// PUBLIC_INTERFACE
export async function createNote(note) {
  /** Create a note. Expects {title, content}. Returns created note. */
  const base = getApiBase();
  return tryPrefixes((prefix) =>
    fetchJson(joinUrl(base, prefix), {
      method: "POST",
      body: JSON.stringify(note),
    })
  );
}

// PUBLIC_INTERFACE
export async function updateNote(id, note) {
  /** Update an existing note by id. Returns updated note. */
  const base = getApiBase();
  return tryPrefixes((prefix) =>
    fetchJson(joinUrl(base, `${prefix}/${encodeURIComponent(String(id))}`), {
      method: "PUT",
      body: JSON.stringify(note),
    })
  );
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. Returns void or a backend-provided payload. */
  const base = getApiBase();
  return tryPrefixes((prefix) =>
    fetchJson(joinUrl(base, `${prefix}/${encodeURIComponent(String(id))}`), {
      method: "DELETE",
    })
  );
}
