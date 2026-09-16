// src/api/courses.ts
// "내 코스" 서버 API 클라이언트 (/api/courses)

import { apiFetch } from '@/auth/api';
import type { Course } from '@/pages/MyCourses/types';

interface CoursePayload {
  name: string;
  days: {
    day: number;
    transport: string;
    places: { name: string; address: string }[];
    costs: { transportation: number; food: number; admission: number; etc: number };
  }[];
}

function toPayload(course: Course): CoursePayload {
  return {
    name: course.name,
    days: course.days.map((day) => ({
      day: day.day,
      transport: day.transport,
      places: day.places.map((place) => ({ name: place.name, address: place.address })),
      costs: day.costs,
    })),
  };
}

async function handle<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? fallbackMessage);
  }

  return response.json() as Promise<T>;
}

export async function listCourses(): Promise<Course[]> {
  const response = await apiFetch('/api/courses');
  return handle<Course[]>(response, '코스 목록을 불러오지 못했습니다.');
}

export async function createCourse(course: Course): Promise<Course> {
  const response = await apiFetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(course)),
  });

  return handle<Course>(response, '코스 저장에 실패했습니다.');
}

export async function updateCourse(courseId: number, course: Course): Promise<Course> {
  const response = await apiFetch(`/api/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(course)),
  });

  return handle<Course>(response, '코스 저장에 실패했습니다.');
}

export async function deleteCourse(courseId: number): Promise<void> {
  const response = await apiFetch(`/api/courses/${courseId}`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error('코스 삭제에 실패했습니다.');
  }
}
