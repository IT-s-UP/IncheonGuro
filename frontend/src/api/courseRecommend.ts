// src/api/courseRecommend.ts
// 코스 추천 페이지 전용 API 호출 함수

import { apiFetch } from '@/auth/api';

import type { CourseRecommendAnswers, CourseRecommendResult } from '@/pages/CourseRecommendPage/types';

export async function recommendCourse(
  answers: CourseRecommendAnswers,
): Promise<CourseRecommendResult> {
  const response = await apiFetch('/api/course-recommend/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message ?? '코스 추천에 실패했습니다.');
  }

  return body as CourseRecommendResult;
}
