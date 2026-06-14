// Simple logger that works in browser (no file I/O in browser)
export function info(msg) {
  console.log(`[INFO] ${msg}`);
}

export function warn(msg) {
  console.warn(`[WARN] ${msg}`);
}

export function error(msg) {
  console.error(`[ERROR] ${msg}`);
}

export default { info, warn, error };
