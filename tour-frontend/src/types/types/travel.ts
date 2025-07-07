export interface TourType {
  tourId?: number;
  title: string;
  startDate: string;
  endDate: string;
}

export interface ScheduleType {
  scheduleId?: number;
  tourId: number;
  scheduleTitle: string;
  content: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface MapEntityType {
  mapId?: number;
  scheduleId: number;
  tourId: number;
  location: string; // JSON 형태의 여행지 정보
  googleMapLink: string; // 구글맵 링크
  photoUrl?: string; // 구글 Places API에서 가져온 사진
  rating?: number; // 구글 별점
}

// MapEntity.location 필드에 저장될 JSON 구조
export interface LocationData {
  name: string;
  link: string;
  placeId: string;
  address: string;
  photoUrl?: string;
  rating?: number;
}

export interface TrafficType {
  trafficId?: number;
  tourId: number;
  vehicle: string; // JSON 형태의 교통수단 상세 정보
  spendTime: string; // ISO datetime format
  price: number;
  departureTime: string;
  arrivalTime: string;
  route: string; // 경로 설명
}

// Traffic.vehicle 필드에 저장될 JSON 구조
export interface VehicleData {
  mode: 'TRANSIT';
  steps: RouteStep[];
  totalDuration: string;
  transfers: number;
  departure: string;
  destination: string;
}

export interface WeatherType {
  temperature: number;
  description: string;
  date: string;
  icon?: string;
}

export interface RouteResult {
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number; // 분 단위
  transfers: number;
  price: number;
  route: RouteStep[];
}

export interface RouteStep {
  mode: 'BUS' | 'SUBWAY';
  line: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
}