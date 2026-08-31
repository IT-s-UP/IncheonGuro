import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './CourseGuideBackButton.css';

function CourseGuideBackButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
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
