// localStorage can throw (private mode, blocked site data). Never let that break the page.
export function readLocal(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
export function writeLocal(key: string, value: string | null): boolean {
  try {
    if (value === null) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
