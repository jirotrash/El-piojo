export default function normalizeImageUrl(src: any): string | null {
  if (!src) return null;
  try {
    let s = String(src).trim();
    if (!s) return null;

    // Already data URI
    if (s.startsWith('data:')) return s;

    // Force https for known API host if backend stored http URLs
    if (/^http:\/\/api-elpiojo\.utvt\.cloud/i.test(s)) {
      s = s.replace(/^http:/i, 'https:');
    }

    // Protocol-relative -> add current protocol
    if (s.startsWith('//')) {
      s = window.location.protocol + s;
    }

    // Absolute URL -> return as-is
    if (/^https?:\/\//i.test(s)) return s;

    // Possible base64 without prefix -> try to detect
    const maybeB64 = s.replace(/^data:.*;base64,/, '').replace(/\s+/g, '');
    if (maybeB64.length > 50 && /^[A-Za-z0-9+/=\-_]+$/.test(maybeB64)) {
      return 'data:image/jpeg;base64,' + maybeB64;
    }

    // Relative path -> prefix with GRAPHQL base (remove /graphql)
    try {
      const GRAPHQL = (import.meta.env.VITE_GRAPHQL_URL as string) ?? '/graphql';
      if (/^https?:\/\//i.test(GRAPHQL)) {
        const base = GRAPHQL.replace(/\/graphql\/?$/, '');
        return base + (s.startsWith('/') ? s : '/' + s);
      }
    } catch (e) {
      // ignore
    }

    return null;
  } catch {
    return null;
  }
}
