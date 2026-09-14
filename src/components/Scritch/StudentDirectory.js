import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildStudentIndex,
  isAbortError,
  scritchStudentUrl,
} from "./api";
import { signOutDirectory } from "./auth";
import { fuzzyScore } from "./fuzzy";

const INDEX_CACHE_KEY = "scritch-student-index";
const INDEX_CACHE_TS = "scritch-student-index-ts";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function loadCachedIndex() {
  try {
    const ts = Number(localStorage.getItem(INDEX_CACHE_TS) || 0);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    const raw = localStorage.getItem(INDEX_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveCachedIndex(records) {
  localStorage.setItem(INDEX_CACHE_KEY, JSON.stringify(records));
  localStorage.setItem(INDEX_CACHE_TS, String(Date.now()));
}

const StudentDirectory = ({ onLogout }) => {
  const [records, setRecords] = useState(() => loadCachedIndex() || []);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(() => !loadCachedIndex());
  const [progress, setProgress] = useState("");
  const [loadError, setLoadError] = useState("");
  const abortRef = useRef(null);
  const recordsRef = useRef(records);
  recordsRef.current = records;

  const refreshIndex = useCallback(async (force, signal) => {
    const cached = loadCachedIndex();
    if (cached && cached.length) {
      if (signal && signal.aborted) return;
      setRecords(cached);
      setLoading(false);
      if (!force) return;
    }
    if (signal && signal.aborted) return;

    const keepExistingList =
      recordsRef.current.length > 0 || Boolean(cached && cached.length);
    if (!keepExistingList) {
      setLoading(true);
      setProgress("Loading classes…");
    } else {
      setProgress("Updating…");
    }
    setLoadError("");

    try {
      const index = await buildStudentIndex((loaded, total, partial) => {
        if (signal && signal.aborted) return;
        setProgress(
          keepExistingList
            ? `Updating… ${loaded}/${total}`
            : `Loading classes… ${loaded}/${total}`
        );
        if (!keepExistingList && partial && partial.length) {
          setRecords(partial);
        }
      }, signal);
      if (signal && signal.aborted) return;
      setRecords(index);
      saveCachedIndex(index);
      setProgress("");
    } catch (err) {
      if (isAbortError(err) || (signal && signal.aborted)) return;
      setLoadError(err.message || "Failed to load directory.");
    } finally {
      if (!signal || !signal.aborted) {
        setLoading(false);
        if (keepExistingList) setProgress("");
      }
    }
  }, []);

  const startIndexLoad = useCallback(
    (force) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      return refreshIndex(force, controller.signal);
    },
    [refreshIndex]
  );

  useEffect(() => {
    startIndexLoad(false);
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [startIndexLoad]);

  const results = useMemo(() => {
    if (!query.trim()) return records.slice(0, 50);
    return records
      .map((r) => ({
        record: r,
        score: fuzzyScore(
          query,
          r.displayName,
          r.classTitle,
          r.classCode,
          r.username
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map((x) => x.record);
  }, [records, query]);

  const handleLogout = () => {
    signOutDirectory();
    onLogout();
  };

  return (
    <div className="directory">
      <div className="directory-toolbar">
        <div>
          <h2>Student Directory</h2>
          <p className="muted">
            {progress
              ? progress
              : `${records.length} students across all classes`}
          </p>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => startIndexLoad(true)}
            disabled={Boolean(progress)}
          >
            Refresh
          </button>
          <button type="button" className="secondary" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      {loadError && <p className="error-message">{loadError}</p>}

      <label className="search-label" htmlFor="directory-search">
        Search students or classes
        <input
          id="directory-search"
          type="search"
          placeholder='e.g. "saturday girlcode" or student name'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {!loading && !query.trim() && (
        <p className="muted hint">
          Type to search — fuzzy matching handles typos and partial class names.
        </p>
      )}

      <ul className="result-list">
        {results.map((r) => (
          <li key={`${r.classCode}-${r.username}`} className="result-item">
            <div className="result-main">
              <strong>{r.displayName}</strong>
              <span className="muted">
                {r.classTitle} · <code>{r.classCode.toUpperCase()}</code>
              </span>
            </div>
            <div className="result-actions">
              <a
                href={scritchStudentUrl(r.username, r.classCode)}
                target="_blank"
                rel="noreferrer"
              >
                Scritch account
              </a>
            </div>
          </li>
        ))}
      </ul>

      {!loading && query.trim() && results.length === 0 && (
        <p>No matches for “{query}”. Try a class name or student name.</p>
      )}
    </div>
  );
};

export default StudentDirectory;
