import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { loginWithPassword, setAccessToken } from './api';

type User =
  | {
      id: string;
      provider: 'kakao' | 'google';
      nickname: string;
    }
  | {
      id: string;
      provider: 'local';
      nickname: string;
    };

type Auth = {
  user: User | null;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const ACCESS_TOKEN_STORAGE_KEY = 'incheonguro.accessToken';
const USER_STORAGE_KEY = 'incheonguro.user';

const AuthContext = createContext<Auth>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  function accept(data: { user: User; csrfToken?: string; accessToken?: string }) {
    setUser(data.user);

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    // 로그인 정보가 localStorage에 있으면
    // 먼저 복구
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;

        setAccessToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('저장된 사용자 정보 복구 실패:', error);

        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

        localStorage.removeItem(USER_STORAGE_KEY);

        setAccessToken('');
        setUser(null);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    // 저장된 로그인 정보가 없는 경우
    // 기존 세션 확인
    const controller = new AbortController();

    void fetch('/api/auth/me', {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = await response.json();

        accept(data);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('로그인 상태 확인 실패:', error);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function login(loginId: string, password: string) {
    const member = await loginWithPassword(loginId, password);

    const nextUser: User = {
      id: String(member.memberId),
      provider: 'local',
      nickname: member.nickname,
    };

    // 메모리에 저장
    setAccessToken(member.accessToken);
    setUser(nextUser);

    // 새로고침 후 복구할 수 있도록 저장
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, member.accessToken);

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }

  async function logout() {
    if (csrfToken) {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    }

    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

    localStorage.removeItem(USER_STORAGE_KEY);

    setUser(null);
    setCsrfToken('');
    setAccessToken('');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
