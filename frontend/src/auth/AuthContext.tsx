import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { loginWithPassword, setAccessToken } from './api';
type User =
  | { id: string; provider: 'kakao' | 'google'; nickname: string }
  | { id: string; provider: 'local'; nickname: string };
type Auth = {
  user: User | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const ACCESS_TOKEN_STORAGE_KEY = 'incheonguro.accessToken';
const USER_STORAGE_KEY = 'incheonguro.user';
const AuthContext = createContext<Auth>({
  user: null,
  login: async () => {},
  logout: async () => {},
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  function accept(data: { user: User; csrfToken: string; accessToken: string }) {
    setUser(data.user); setCsrfToken(data.csrfToken); setAccessToken(data.accessToken);
  }
  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
      return;
    }
    const controller = new AbortController();
    void fetch('/api/auth/me', { credentials: 'same-origin', signal: controller.signal })
      .then(async response => { if (response.ok) accept(await response.json()); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  async function login(loginId: string, password: string) {
    const member = await loginWithPassword(loginId, password);
    const nextUser: User = { id: String(member.memberId), provider: 'local', nickname: member.nickname };
    setAccessToken(member.accessToken);
    setUser(nextUser);
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, member.accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }
  async function logout() {
    if (csrfToken) {
      const response = await fetch('/api/auth/logout', {
        method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': csrfToken },
      });
      if (!response.ok) throw new Error('Logout failed');
    }
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null); setCsrfToken(''); setAccessToken('');
  }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
