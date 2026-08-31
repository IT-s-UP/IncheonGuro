export type Transport = '도보' | '대중교통' | '자전거' | '자차';

export interface CoursePlace {
  id: number;
  name: string;
  address: string;
}

export interface Course {
  id: number;
  name: string;
  transport?: Transport;
  places?: CoursePlace[];
}
