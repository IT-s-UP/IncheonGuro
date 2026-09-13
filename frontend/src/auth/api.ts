let accessToken = '';
export function setAccessToken(token: string) { accessToken = token; }
export function apiFetch(path: string, options: RequestInit = {}) {
  if (!path.startsWith('/api/')) throw new Error('Invalid API path');
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken);
  return fetch(path, { ...options, headers, credentials: 'same-origin' });
}

export type LoginMember = {
  memberId: number;
  nickname: string;
  name: string;
  birth: string;
  gender: string;
  interestedRegion: number;
  phoneNumber: string;
  email: string;
};

export async function loginWithPassword(loginId: string, password: string) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId, password }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? '로그인에 실패했습니다.');
  }

  return body.data as LoginMember & { accessToken: string };
}

export async function sendEmailVerificationCode(email: string) {
  const response = await fetch('/auth/email/verification-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? '인증번호 발송에 실패했습니다.');
  }
}

export async function confirmEmailVerificationCode(email: string, code: string) {
  const response = await fetch('/auth/email/verification-code/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? '인증번호가 일치하지 않습니다.');
  }
}
