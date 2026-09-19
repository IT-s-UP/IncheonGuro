let accessToken = '';
export function setAccessToken(token: string) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}
export function apiFetch(path: string, options: RequestInit = {}) {
  if (!path.startsWith('/api/') && !path.startsWith('/stamp/')) {
    throw new Error('Invalid API path');
  }

  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set('Authorization', 'Bearer ' + accessToken);
  }

  return fetch(path, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
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

export async function isLoginIdAvailable(loginId: string) {
  const response = await fetch(`/auth/check-id?loginId=${encodeURIComponent(loginId)}`);

  if (!response.ok) {
    throw new Error('아이디 확인에 실패했습니다.');
  }

  const body = await response.json();
  return body.available as boolean;
}

export type SignupPayload = {
  loginId: string;
  password: string;
  phoneNumber: string;
  name: string;
  birth: string;
  gender: string;
  email: string;
  nickname: string;
  interestedRegion: number;
};

export async function signup(payload: SignupPayload) {
  const response = await fetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? '회원가입에 실패했습니다.');
  }
}

export type RegionRecommendRequest = {
  placeType: string;
  transport: string;
  mood: string;
  companion: string;
  interestedRegion?: string;
};

export type RegionRecommendResponse = {
  regionName: string;
  description: string;
  imageUrl: string;
  score: number;
};

export async function recommendRegion(
  request: RegionRecommendRequest,
): Promise<RegionRecommendResponse> {
  const response = await apiFetch('/api/region/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new Error(body?.message ?? `지역 추천에 실패했습니다. (${response.status})`);
  }

  return response.json();
}

export type RecommendedRegionResponse = {
  regionId: number | null;
  regionName: string | null;
};

export async function getRecommendedRegion(): Promise<RecommendedRegionResponse> {
  const response = await apiFetch('/api/region/recommended');

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new Error(body?.message ?? `추천 지역 조회에 실패했습니다. (${response.status})`);
  }

  return response.json();
}
