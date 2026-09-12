let accessToken = '';
export function setAccessToken(token: string) { accessToken = token; }
export function apiFetch(path: string, options: RequestInit = {}) {
  if (!path.startsWith('/api/')) throw new Error('Invalid API path');
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken);
  return fetch(path, { ...options, headers, credentials: 'same-origin' });
}
