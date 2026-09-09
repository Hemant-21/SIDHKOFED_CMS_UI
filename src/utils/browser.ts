/**
 * Browser interaction helpers: clipboard + file download. SSR-safe (guard on
 * `window`). Used by reusable toolbars/actions, never by module logic.
 */

/** Trigger a browser download of a Blob with a given filename. */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
