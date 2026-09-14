export const ACCESS_CODE = "the coding space rules";
const STORAGE_KEY = "scritch-directory-auth";

export function isDirectoryAuthenticated() {
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function authenticateDirectory(code) {
  const ok = code.trim().toLowerCase() === ACCESS_CODE.toLowerCase();
  if (ok) sessionStorage.setItem(STORAGE_KEY, "1");
  return ok;
}

export function signOutDirectory() {
  sessionStorage.removeItem(STORAGE_KEY);
}
