import { setStorageMember, clearMemberStorage } from './accountStorage';
import { Fragment, createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch, loginWithPassword, setAccessToken } from './api';

type User = { id: string; provider: 'kakao' | 'google' | 'local'; nickname: string };
type Auth = {
  user: User | null; isLoading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  withdraw: (password: string) => Promise<void>;
};
const TOKEN = 'incheonguro.accessToken', USER = 'incheonguro.user';
const AuthContext = createContext<Auth>({
  user: null, isLoading: true, login: async () => {}, logout: async () => {}, withdraw: async () => {},
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const version = useRef(0);
  function clear() {
    version.current++;
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER);
    setAccessToken('');
    setStorageMember(null);
    setUser(null);
  }
  useEffect(() => {
    let active = true;
    const current = version.current;
    const valid = () => active && current === version.current;
    const controller = new AbortController();
    async function restore() {
      try {
        const token = localStorage.getItem(TOKEN), saved = localStorage.getItem(USER);
        if (token && saved) {
          const response = await fetch('/api/mypage', {
            headers: { Authorization: 'Bearer ' + token }, signal: controller.signal,
          });
          if (!valid()) return;
          if (response.ok) {
            const profile = await response.json();
            if (!valid()) return;
            const local = JSON.parse(saved) as User;
            setStorageMember(local.id);
            setAccessToken(token);
            setUser({ ...local, nickname: profile.data.nickname });
            return;
          }
          if (response.status !== 401) return;
          localStorage.removeItem(TOKEN);
          localStorage.removeItem(USER);
        }
        const response = await fetch('/api/auth/me', { credentials: 'same-origin', signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          if (valid()) { setStorageMember(data.user.id); setAccessToken(data.accessToken); setUser(data.user); }
        }
      } catch { /* Keep the screen signed out when restoration cannot be verified. */ }
      finally { if (valid()) setIsLoading(false); }
    }
    void restore();
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'incheonguro.signedOut') {
        clear();
        setIsLoading(false);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => { active = false; controller.abort(); window.removeEventListener('storage', onStorage); };
  }, []);
  function signedOut() {
    clear();
    localStorage.setItem('incheonguro.signedOut', String(Date.now()));
  }
  async function login(loginId: string, password: string) {
    const member = await loginWithPassword(loginId, password);
    version.current++;
    const nextUser: User = { id: String(member.memberId), provider: 'local', nickname: member.nickname };
    setStorageMember(nextUser.id);
    setAccessToken(member.accessToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN, member.accessToken);
    localStorage.setItem(USER, JSON.stringify(nextUser));
    setIsLoading(false);
  }
  async function logout() {
    // Resolve the session independently of local password-login state.
    const session = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (session.ok) {
      const data = await session.json();
      const response = await fetch('/api/auth/logout', {
        method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': data.csrfToken },
      });
      if (!response.ok) throw new Error('로그아웃에 실패했습니다. 다시 시도해 주세요.');
    } else if (session.status !== 401) {
      throw new Error('서버에 연결할 수 없습니다. 다시 시도해 주세요.');
    }
    signedOut();
  }
  async function withdraw(password: string) {
    const response = await apiFetch('/api/mypage', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: true, password }),
    });
    if (!response.ok) {
      throw new Error(response.status === 400 ? '현재 비밀번호를 확인해 주세요.' :
        response.status === 401 ? '로그인이 만료되었습니다. 다시 로그인해 주세요.' :
        '탈퇴를 완료하지 못했습니다. 다시 시도해 주세요.');
    }
    clearMemberStorage();
    signedOut();
  }
  return <AuthContext.Provider value={{ user, isLoading, login, logout, withdraw }}><Fragment key={user?.id ?? "guest"}>{children}</Fragment></AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
