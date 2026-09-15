import { useEffect, useState } from 'react';
import type { CoursePlace, Transport } from '../types';
import { loadKakaoMap, locateAddress } from './kakaoMap';
import { apiFetch } from '@/auth/api';

const modes: Record<Transport, string> = {
  도보: 'walk',
  대중교통: 'transit',
  자전거: 'bicycle',
  자차: 'car',
};
const cache = new Map<string, { text: string; expires: number }>();

async function coordinates(place: CoursePlace) {
  if (
    typeof place.latitude === 'number' &&
    typeof place.longitude === 'number' &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    Math.abs(place.latitude) <= 90 &&
    Math.abs(place.longitude) <= 180
  ) {
    return { latitude: place.latitude, longitude: place.longitude };
  }
  return locateAddress(await loadKakaoMap(), place.address);
}

export default function RouteDuration({
  from,
  to,
  transport,
}: {
  from: CoursePlace;
  to: CoursePlace;
  transport: Transport;
}) {
  const [text, setText] = useState('이동 시간 계산 중…');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();
    setText('이동 시간 계산 중…');
    setFailed(false);
    const timer = window.setTimeout(() => abort.abort(), 20000);
    void (async () => {
      const [start, end] = await Promise.all([coordinates(from), coordinates(to)]);
      if (cancelled) return;
      if (!start || !end) throw new Error('장소를 검색해 위치를 선택해주세요.');
      const params = new URLSearchParams({
        mode: modes[transport],
        startX: String(start.longitude),
        startY: String(start.latitude),
        endX: String(end.longitude),
        endY: String(end.latitude),
      });
      const key = params.toString();
      const cached = cache.get(key);
      if (cached && cached.expires > Date.now()) {
        setText(cached.text);
        return;
      }
      const response = await apiFetch(`/api/course-routes?${key}`, { signal: abort.signal });
      if (!response.ok)
        throw new Error(
          response.status === 404
            ? '이동 가능한 경로가 없습니다.'
            : '이동 시간을 불러오지 못했습니다.',
        );
      const result: { durationSeconds: number; distanceMeters: number } = await response.json();
      if (
        !Number.isFinite(result.durationSeconds) ||
        result.durationSeconds < 0 ||
        !Number.isFinite(result.distanceMeters) ||
        result.distanceMeters < 0
      )
        throw new Error('이동 시간을 확인할 수 없습니다.');
      const minutes = Math.ceil(result.durationSeconds / 60);
      const duration =
        minutes >= 60
          ? `${Math.floor(minutes / 60)}시간${minutes % 60 ? ` ${minutes % 60}분` : ''}`
          : `${minutes}분`;
      const distance =
        result.distanceMeters >= 1000
          ? `${(result.distanceMeters / 1000).toFixed(1)}km`
          : `${Math.round(result.distanceMeters)}m`;
      const label = `약 ${duration} · ${distance}`;
      if (cancelled) return;
      if (cache.size >= 100) cache.clear();
      cache.set(key, { text: label, expires: Date.now() + 60000 });
      setText(label);
    })()
      .catch((error: unknown) => {
        if (cancelled) return;
        setFailed(true);
        setText(
          abort.signal.aborted
            ? '응답이 지연되고 있습니다.'
            : error instanceof Error
              ? error.message
              : '이동 시간을 불러오지 못했습니다.',
        );
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      cancelled = true;
      abort.abort();
      window.clearTimeout(timer);
    };
  }, [from, to, transport, attempt]);
  return (
    <span role="status">
      {text}
      {failed && (
        <button
          type="button"
          style={{
            border: 0,
            background: 'transparent',
            textDecoration: 'underline',
            cursor: 'pointer',
            color: 'inherit',
            marginLeft: 6,
          }}
          onClick={() => setAttempt((value) => value + 1)}
        >
          다시 시도
        </button>
      )}
    </span>
  );
}
