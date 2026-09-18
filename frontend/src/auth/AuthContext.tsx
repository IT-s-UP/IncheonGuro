import { setStorageMember, clearMemberStorage } from './accountStorage';

import { Fragment, createContext, useContext, useEffect, useRef, useState } from 'react';

import type { ReactNode } from 'react';

import { apiFetch, loginWithPassword, setAccessToken } from './api';

type User = {
  id: string;
  provider: 'kakao' | 'google' | 'local';
  nickname: string;
};

type Auth = {
  user: User | null;

  // 로그인 상태 확인 중인지 여부
  isLoading: boolean;

  login: (loginId: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  withdraw: (password: string) => Promise<void>;

  // 현재 로그인한 사용자 정보 일부를 즉시 갱신
  updateUser: (updatedUser: Partial<User>) => void;
};

const TOKEN = 'incheonguro.accessToken';
const USER = 'incheonguro.user';

const AuthContext = createContext<Auth>({
  user: null,
  isLoading: true,

  login: async () => {},
  logout: async () => {},
  withdraw: async () => {},

  updateUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const version = useRef(0);

  /* =========================
     로그아웃 및 사용자 정보 초기화
  ========================= */

  function clear() {
    version.current++;

    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER);

    setAccessToken('');

    setStorageMember(null);

    setUser(null);
  }

  /* =========================
     사용자 정보 부분 업데이트

     닉네임 변경 등에서 사용
  ========================= */

  function updateUser(updatedUser: Partial<User>) {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const nextUser = {
        ...prev,
        ...updatedUser,
      };

      /*
       * localStorage에도 최신 사용자 정보를 저장
       *
       * 새로고침했을 때 이전 닉네임으로
       * 돌아가는 것을 방지
       */
      localStorage.setItem(USER, JSON.stringify(nextUser));

      return nextUser;
    });
  }

  /* =========================
     로그인 상태 복원
  ========================= */

  useEffect(() => {
    let active = true;

    const current = version.current;

    const valid = () => active && current === version.current;

    const controller = new AbortController();

    async function restore() {
      try {
        /*
         * 세션 기반 로그인(카카오/구글)을
         * 항상 먼저 확인한다.
         */
        const sessionResponse = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          signal: controller.signal,
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

        /*
         * 일반 로그인 상태 복원
         */
        const token = localStorage.getItem(TOKEN);

        const saved = localStorage.getItem(USER);

        if (token && saved) {
          const response = await fetch('/api/mypage', {
            headers: {
              Authorization: 'Bearer ' + token,
            },
            signal: controller.signal,
          });

          if (!valid()) return;

          if (response.ok) {
            const profile = await response.json();

            if (!valid()) return;

            const local = JSON.parse(saved) as User;

            setStorageMember(local.id);

            setAccessToken(token);

            setUser({
              ...local,
              nickname: profile.data.nickname,
            });

            return;
          }

          if (response.status !== 401) {
            return;
          }

          localStorage.removeItem(TOKEN);
          localStorage.removeItem(USER);
        }
      } catch {
        /*
         * 세션 복원에 실패하면
         * 로그인되지 않은 상태로 유지
         */
      } finally {
        if (valid()) {
          setIsLoading(false);
        }
      }
    }

    void restore();

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'incheonguro.signedOut') {
        clear();

        setIsLoading(false);
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      active = false;

      controller.abort();

      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /* =========================
     로그아웃
  ========================= */

  function signedOut() {
    clear();

    localStorage.setItem('incheonguro.signedOut', String(Date.now()));
  }

  /* =========================
     일반 로그인
  ========================= */

  async function login(loginId: string, password: string) {
    const member = await loginWithPassword(loginId, password);

    version.current++;

    /*
     * 이 브라우저에 남아있을 수 있는
     * 이전 소셜 로그인 세션 정리
     */
    try {
      const session = await fetch('/api/auth/me', {
        credentials: 'same-origin',
      });

      if (session.ok) {
        const data = await session.json();

        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'X-CSRF-Token': data.csrfToken,
          },
        });
      }
    } catch {
      /*
       * best-effort
       */
    }

    const nextUser: User = {
      id: String(member.memberId),
      provider: 'local',
      nickname: member.nickname,
    };

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

  /* =========================
     로그아웃
  ========================= */

  async function logout() {
    const session = await fetch('/api/auth/me', {
      credentials: 'same-origin',
    });

    if (session.ok) {
      const data = await session.json();

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'X-CSRF-Token': data.csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error('로그아웃에 실패했습니다. 다시 시도해 주세요.');
      }
    } else if (session.status !== 401) {
      throw new Error('서버에 연결할 수 없습니다. 다시 시도해 주세요.');
    }

    signedOut();
  }

  /* =========================
     회원 탈퇴
  ========================= */

  async function withdraw(password: string) {
    const response = await apiFetch('/api/mypage', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        confirmed: true,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(
        response.status === 400
          ? '현재 비밀번호를 확인해 주세요.'
          : response.status === 401
            ? '로그인이 만료되었습니다. 다시 로그인해 주세요.'
            : '탈퇴를 완료하지 못했습니다. 다시 시도해 주세요.',
      );
    }

    clearMemberStorage();

    signedOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        withdraw,
        updateUser,
      }}
    >
      <Fragment key={user?.id ?? 'guest'}>{children}</Fragment>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
