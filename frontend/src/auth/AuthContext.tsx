import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { setAccessToken } from './api';
type User = { id: string; provider: 'kakao' | 'google'; nickname: string };
type Auth = { user: User | null; logout: () => Promise<void> };
const AuthContext = createContext<Auth>({ user: null, logout: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  function accept(data: { user: User; csrfToken: string; accessToken: string }) {
    setUser(data.user); setCsrfToken(data.csrfToken); setAccessToken(data.accessToken);
  }
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/auth/me', { credentials: 'same-origin', signal: controller.signal })
      .then(async response => { if (response.ok) accept(await response.json()); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  async function logout() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': csrfToken },
    });
    if (!response.ok) throw new Error('Logout failed');
    setUser(null); setCsrfToken(''); setAccessToken('');
  }
  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
