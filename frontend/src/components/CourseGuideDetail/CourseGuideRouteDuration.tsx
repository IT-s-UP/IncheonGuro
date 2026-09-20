import { useEffect, useRef, useState } from 'react';
import RouteDuration from '@/pages/MyCourses/CourseEdit/RouteDuration';
import type { CoursePlace, Transport } from '@/pages/MyCourses/types';

interface CourseGuideRouteDurationProps {
  from: CoursePlace;
  to: CoursePlace;
  transport: Transport;
}

// RouteDuration.tsx(팀원 소유, 수정 불가)를 감싸서 두 가지 문구를 대체함.
// 1) "약 0분 · 0m" - 도보로는 갈 수 없을 만큼 먼 거리인데 API가 0을 그대로 반환하는 것으로 추정되는 케이스
// 2) "이동 가능한 경로가 없습니다." - 백엔드가 404를 반환한 케이스. 재시도해도 결과가 달라지지 않는데
//    RouteDuration은 이 경우에도 "다시 시도" 버튼을 그대로 보여줘서 마치 일시적 오류처럼 보이는 문제가 있음
// RouteDuration이 렌더링하는 텍스트를 MutationObserver로 감시하다가 패턴이 맞으면
// 화면에서 숨기고(재시도 버튼 포함) 대체 문구를 보여주는 방식
const noRouteMessageByTransport: Record<Transport, string> = {
  도보: '도보로 이동하기 어려운 거리예요',
  대중교통: '대중교통으로 바로 갈 수 있는 경로가 없어요',
  자전거: '자전거로 이동 가능한 경로가 없어요',
  자차: '자동차로 이동 가능한 경로가 없어요',
};

function CourseGuideRouteDuration({ from, to, transport }: CourseGuideRouteDurationProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [alternateText, setAlternateText] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkText = () => {
      const text = container.textContent?.trim() ?? '';
      if (/^약\s*0분\s*·\s*0m$/.test(text)) {
        setAlternateText(noRouteMessageByTransport[transport]);
      } else if (text.startsWith('이동 가능한 경로가 없습니다.')) {
        // 실패 시 RouteDuration이 같은 컨테이너 안에 "다시 시도" 버튼 텍스트를 이어붙이므로 startsWith로 비교
        setAlternateText(noRouteMessageByTransport[transport]);
      } else {
        setAlternateText(null);
      }
    };

    checkText();

    const observer = new MutationObserver(checkText);
    observer.observe(container, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [from, to, transport]);

  return (
    <>
      <span ref={containerRef} style={{ display: alternateText ? 'none' : 'inline' }}>
        <RouteDuration from={from} to={to} transport={transport} />
      </span>
      {alternateText && <span>{alternateText}</span>}
    </>
  );
}

export default CourseGuideRouteDuration;
