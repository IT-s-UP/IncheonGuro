import { useEffect, useRef, useState } from 'react';
import RouteDuration from '@/pages/MyCourses/CourseEdit/RouteDuration';
import type { CoursePlace, Transport } from '@/pages/MyCourses/types';

interface CourseGuideRouteDurationProps {
  from: CoursePlace;
  to: CoursePlace;
  transport: Transport;
}

// RouteDuration.tsx(팀원 소유, 수정 불가)를 감싸서, 응답이 "약 0분 · 0m"으로 오는 경우
// (도보로는 갈 수 없을 만큼 먼 거리인데 API가 0을 그대로 반환하는 백엔드 이슈로 추정)를
// 감지해서 다른 문구로 바꿔 보여줌. RouteDuration이 렌더링하는 텍스트를
// MutationObserver로 감시하다가 패턴이 맞으면 화면에서 숨기고 대체 문구를 보여주는 방식
function CourseGuideRouteDuration({ from, to, transport }: CourseGuideRouteDurationProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isUnreachable, setIsUnreachable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // "0분 · 0m" 형태의 텍스트인지 확인 (계산 중 문구나 실제 값과는 겹치지 않음)
    const checkText = () => {
      const text = container.textContent?.trim() ?? '';
      setIsUnreachable(/^약\s*0분\s*·\s*0m$/.test(text));
    };

    checkText();

    const observer = new MutationObserver(checkText);
    observer.observe(container, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [from, to, transport]);

  return (
    <>
      <span ref={containerRef} style={{ display: isUnreachable ? 'none' : 'inline' }}>
        <RouteDuration from={from} to={to} transport={transport} />
      </span>
      {isUnreachable && <span>도보로 이동하기 어려운 거리예요</span>}
    </>
  );
}

export default CourseGuideRouteDuration;
