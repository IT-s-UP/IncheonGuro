import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './CourseGuideBackButton.css';

interface CourseGuideBackButtonProps {
  to?: string; // 이동할 경로, 값 없으면 기본값으로 메인페이지('/')로 이동
}

function CourseGuideBackButton({ to = '/' }: CourseGuideBackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <div className="course-guide-back-button-wrap">
      <button className="course-guide-back-button" onClick={handleClick}>
        <ChevronLeft size={20} />
        <span className="course-guide-back-button-text">코스 안내</span>
      </button>
    </div>
  );
}

export default CourseGuideBackButton;
