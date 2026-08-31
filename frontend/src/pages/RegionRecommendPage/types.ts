export interface RegionRecommendAnswers {
  place: string;
  moveType: string;
  mood: string;
  companion: string;
}

export interface RecommendedPlace {
  id: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
}

export interface RegionRecommendResult {
  id: string;
  regionName: string;
  title: string;
  description: string;
  imageUrl?: string;
  recommendedPlaces: RecommendedPlace[];
}
