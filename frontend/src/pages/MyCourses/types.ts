export type Transport = '도보' | '대중교통' | '자전거' | '자차';

export interface CoursePlace {
  id: number;
  name: string;
  address: string;
}

export interface CourseCost {
  transportation: number;
  food: number;
  admission: number;
  etc: number;
}

export interface CourseDay {
  id: number;
  day: number;
  transport: Transport;
  places: CoursePlace[];
  costs: CourseCost;
}

export interface Course {
  id: number;
  name: string;
  days: CourseDay[];
}
