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

  // 로그인 상태 확인 중인지 여부
  isLoading: boolean;

  login: (loginId: string, password: string) => Promise<void>;

  logout: () => Promise<void>;
};

const ACCESS_TOKEN_STORAGE_KEY = 'incheonguro.accessToken';

const USER_STORAGE_KEY = 'incheonguro.user';

const AuthContext = createContext<Auth>({
  user: null,

  // 최초에는 로그인 상태 확인 중
  isLoading: true,

  login: async () => {},

  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [csrfToken, setCsrfToken] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  /*
   * 서버에서 로그인 정보를 받아왔을 때
   */
  function accept(data: { user: User; csrfToken?: string; accessToken?: string }) {
    setUser(data.user);

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    if (data.accessToken) {
      setAccessToken(data.accessToken);
    }
  }

  /*
   * 앱 최초 실행 / 새로고침
   */
  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    /*
     * localStorage에 로그인 정보가 있으면
     * 서버에 다시 확인하지 않고 바로 복원
     */
    if (storedToken && storedUser) {
      try {
        setAccessToken(storedToken);

        setUser(JSON.parse(storedUser) as User);
      } catch (error) {
        console.error('저장된 사용자 정보 복원 실패:', error);

        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

        localStorage.removeItem(USER_STORAGE_KEY);

        setAccessToken('');
        setUser(null);
      }

      /*
       * 로그인 상태 확인 완료
       */
      setIsLoading(false);

      return;
    }

    /*
     * localStorage에 로그인 정보가 없으면
     * 서버에 현재 로그인 상태 확인
     */
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
        /*
         * 새로고침 등으로 요청이 취소된 경우
         * 에러를 표시하지 않음
         */
        if (error?.name !== 'AbortError') {
          console.error('로그인 상태 확인 실패:', error);
        }
      })
      .finally(() => {
        /*
         * 로그인 여부 확인 완료
         */
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * 로그인
   */
  async function login(loginId: string, password: string) {
    const member = await loginWithPassword(loginId, password);

    const nextUser: User = {
      id: String(member.memberId),

      provider: 'local',

      nickname: member.nickname,
    };

    /*
     * 메모리에 토큰 저장
     */
    setAccessToken(member.accessToken);

    /*
     * 사용자 정보 저장
     */
    setUser(nextUser);

    /*
     * 새로고침해도 로그인 유지
     */
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, member.accessToken);

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }

  /*
   * 로그아웃
   */
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

    /*
     * 저장된 로그인 정보 삭제
     */
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);

    localStorage.removeItem(USER_STORAGE_KEY);

    /*
     * 메모리 로그인 정보 삭제
     */
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
