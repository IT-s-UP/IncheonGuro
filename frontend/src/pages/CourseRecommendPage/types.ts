export interface CourseRecommendAnswers {
  transport: string;
  startDate: string;
  endDate: string;
  scheduleType: string;
  travelStyles: string[];
  companion: string;
}

export interface CoursePlace {
  id: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
}

export interface CourseCost {
  id: number;
  label: string;
  amount: number;
}

export interface CourseDay {
  day: number;
  title: string;
  places: CoursePlace[];
  costs: CourseCost[];
  totalCost: number;
}

export interface CourseRecommendResult {
  id: string;
  title: string;
  description: string;
  mapLabel: string;
  days: CourseDay[];
}
