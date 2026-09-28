const DATABASE_URL = process.env.REACT_APP_SCRITCH_KEY;
const DATABASE_AUTH = process.env.REACT_APP_SCRITCH_DATABASE_AUTH;

export function getDatabaseUrl() {
  if (!DATABASE_URL || DATABASE_URL === "undefined") {
    throw new Error(
      "Scritch database URL is not configured. Set REACT_APP_SCRITCH_KEY and restart the app."
    );
  }
  return DATABASE_URL.replace(/\/$/, "");
}

export function dbUrl(path, query) {
  const base = getDatabaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const params = new URLSearchParams(query);
  const token = DATABASE_AUTH && DATABASE_AUTH.trim();
  if (token) params.set("auth", token);
  const qs = params.toString();
  return qs ? `${base}${normalizedPath}?${qs}` : `${base}${normalizedPath}`;
}

export function unquote(str) {
  return str.replace(/^"(.*)"$/, "$1");
}

export function scritchStudentUrl(username, classCode) {
  const user = encodeURIComponent(unquote(username));
  return `https://scritch.dev/?${user}#${classCode.toUpperCase()}`;
}

export function isAbortError(err) {
  return Boolean(err && (err.name === "AbortError" || err.code === 20));
}

function throwIfAborted(signal) {
  if (signal && signal.aborted) {
    const error = new Error("Aborted");
    error.name = "AbortError";
    throw error;
  }
}

async function fetchAllClassCodes(signal) {
  const response = await fetch(dbUrl("/classes.json", { shallow: "true" }), {
    signal,
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        DATABASE_AUTH && DATABASE_AUTH.trim()
          ? "Scritch database rejected the auth token. Check REACT_APP_SCRITCH_DATABASE_AUTH."
          : "Cannot list all classes without REACT_APP_SCRITCH_DATABASE_AUTH. Add the Firebase database secret (same token as the team bash scripts) and restart the app."
      );
    }
    throw new Error("Failed to load classes from Scritch database.");
  }
  const data = await response.json();
  if (!data) return [];
  return Object.keys(data);
}

const INDEX_CONCURRENCY = 12;

async function mapPool(items, limit, iterator, signal) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      throwIfAborted(signal);
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await iterator(items[index], index);
    }
  }

  const workerCount = Math.min(limit, items.length) || 0;
  const workers = [];
  for (let i = 0; i < workerCount; i += 1) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

async function fetchClassTitle(code, signal) {
  const response = await fetch(dbUrl(`/classes/${code}/title.json`), { signal });
  if (!response.ok) return code;
  const title = await response.json();
  return (typeof title === "string" && title.trim()) || code;
}

async function fetchClassStudentKeys(code, signal) {
  const response = await fetch(
    dbUrl(`/classes/${code}/students.json`, { shallow: "true" }),
    { signal }
  );
  if (!response.ok) return [];
  const data = await response.json();
  if (!data) return [];
  return Object.keys(data);
}

function sortRecords(records) {
  return records.sort(
    (a, b) =>
      a.classTitle.localeCompare(b.classTitle) ||
      a.displayName.localeCompare(b.displayName)
  );
}

export async function buildStudentIndex(onProgress, signal) {
  throwIfAborted(signal);
  const codes = await fetchAllClassCodes(signal);
  const records = [];
  let loaded = 0;
  let lastNotify = 0;

  await mapPool(
    codes,
    INDEX_CONCURRENCY,
    async (code) => {
      throwIfAborted(signal);
      const [classTitle, studentKeys] = await Promise.all([
        fetchClassTitle(code, signal),
        fetchClassStudentKeys(code, signal),
      ]);

      throwIfAborted(signal);

      studentKeys.forEach((username) => {
        records.push({
          classCode: code,
          classTitle,
          username,
          displayName: unquote(username),
        });
      });

      loaded += 1;
      const now = Date.now();
      const isDone = loaded === codes.length;
      if (onProgress && (isDone || now - lastNotify > 200)) {
        lastNotify = now;
        onProgress(loaded, codes.length, records.slice());
      }
    },
    signal
  );

  throwIfAborted(signal);
  return sortRecords(records.slice());
}
