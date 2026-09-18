import { setStorageMember, clearMemberStorage } from './accountStorage';
import { Fragment, createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch, loginWithPassword, setAccessToken } from './api';

type User = { id: string; provider: 'kakao' | 'google' | 'local'; nickname: string };
type Auth = {
  user: User | null;

  // 로그인 상태 확인 중인지 여부
  isLoading: boolean;

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
        // 세션 기반 로그인(카카오/구글)을 항상 먼저 확인한다.
        // 브라우저에 예전 아이디/비번 로그인 토큰이 남아있는 상태로 소셜 로그인을 하면,
        // 순서가 반대일 경우 그 옛날 토큰이 먼저 검증돼서 전혀 다른 계정 정보가 복원되는 문제가 있었음.
        const sessionResponse = await fetch('/api/auth/me', {
          credentials: 'same-origin', signal: controller.signal,
        });
        if (!valid()) return;
        if (sessionResponse.ok) {
          const data = await sessionResponse.json();
          if (!valid()) return;
          localStorage.removeItem(TOKEN);
          localStorage.removeItem(USER);
          setStorageMember(data.user.id);
          setAccessToken(data.accessToken);
          setUser(data.user);
          return;
        }

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

    // 이 브라우저에 남아있을 수 있는 이전 소셜 로그인 세션을 정리한다
    // (남겨두면 다음 새로고침 때 restore()가 세션을 우선 확인하면서 방금 한 로그인을 덮어씀).
    try {
      const session = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (session.ok) {
        const data = await session.json();
        await fetch('/api/auth/logout', {
          method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': data.csrfToken },
        });
      }
    } catch { /* best-effort */ }

    const nextUser: User = { id: String(member.memberId), provider: 'local', nickname: member.nickname };
    setStorageMember(nextUser.id);
    setAccessToken(member.accessToken);

    /*
     * 사용자 정보 저장
     */
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
