import { generateSignature, decryptPayload } from './vaultCrypto';

// Store reference to native browser fetch
const originalFetch = window.fetch;

// Initialize global fetch interceptor to secure all API communication
export function initSecurityInterceptor() {
  if ((window as any).__RENTOBIT_INTERCEPTOR_ACTIVE__) {
    return;
  }
  (window as any).__RENTOBIT_INTERCEPTOR_ACTIVE__ = true;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

    // Only intercept internal /api/ endpoints
    const isApiRequest = urlString.includes('/api/');
    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    // Build secure headers
    const headers = new Headers(init?.headers || {});

    const ts = Date.now();
    const sig = generateSignature(ts);

    headers.set('X-Rentobit-Client', 'Rentobit-Secure-Web');
    headers.set('X-Rentobit-Timestamp', ts.toString());
    headers.set('X-Rentobit-Signature', sig);
    headers.set('X-Requested-With', 'XMLHttpRequest');

    // Attach active user session & credentials
    try {
      const stored = localStorage.getItem('rentobit_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.id) {
          headers.set('X-User-Id', u.id);
          headers.set('X-User-Role', u.role || 'user');
          const token = localStorage.getItem('rentobit_token') || `jwt_${u.id}`;
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
          }
        }
      }
    } catch {}

    // Attach Admin Master Key if calling admin routes or within admin portal
    if (urlString.includes('/api/admin') || (typeof window !== 'undefined' && window.location?.pathname?.includes('/kkgroup'))) {
      headers.set('X-Admin-Key', 'Admin@rentobit2026');
    }

    const securedInit: RequestInit = {
      ...init,
      headers,
    };

    try {
      const res = await originalFetch(input, securedInit);

      // Check if response was blocked or redirected
      const contentType = res.headers.get('content-type') || '';

      // If response is JSON, check for AES encrypted vault envelope
      if (contentType.includes('application/json')) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (json && typeof json === 'object' && '__enc' in json && typeof json.__enc === 'string') {
            const decrypted = decryptPayload(json.__enc);
            return new Response(JSON.stringify(decrypted), {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers,
            });
          }
        } catch {
          // If parse fails, return original text in new response
        }
        return new Response(text, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      }

      return res;
    } catch (err) {
      throw err;
    }
  };

  console.log('🔒 [RentoBit Security] Active Vault Shield & API Protection Loaded.');
}

// Auto-initialize when imported
initSecurityInterceptor();
