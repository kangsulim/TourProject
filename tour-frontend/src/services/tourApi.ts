import api, { ApiResponse } from './api';
import { TourType, ScheduleType, MapEntityType, TrafficType } from '../types/travel';

// Tour API 서비스
export const tourAPI = {
  // 모든 여행 목록 조회
  getAllTours: async (): Promise<TourType[]> => {
    const response = await api.get<ApiResponse<TourType[]>>('/tours');
    return response.data.data;
  },

  // 특정 여행 조회
  getTourById: async (tourId: number): Promise<TourType> => {
    const response = await api.get<ApiResponse<TourType>>(`/tours/${tourId}`);
    return response.data.data;
  },

  // 사용자별 여행 목록 조회
  getToursByUserId: async (userId: number): Promise<TourType[]> => {
    const response = await api.get<ApiResponse<TourType[]>>(`/tours/user/${userId}`);
    return response.data.data;
  },

  // 새 여행 생성
  createTour: async (tourData: Omit<TourType, 'tourId'>): Promise<TourType> => {
    const response = await api.post<ApiResponse<TourType>>('/tours', tourData);
    return response.data.data;
  },

  // 여행 정보 수정
  updateTour: async (tourId: number, tourData: Partial<TourType>): Promise<TourType> => {
    const response = await api.put<ApiResponse<TourType>>(`/tours/${tourId}`, tourData);
    return response.data.data;
  },

  // 여행 삭제
  deleteTour: async (tourId: number): Promise<void> => {
    await api.delete(`/tours/${tourId}`);
  },

  // 여행 계획 전체 저장 (일정, 여행지, 교통편 포함)
  saveTourPlan: async (
    tourId: number,
    planData: {
      schedules: ScheduleType[];
      mapEntities: MapEntityType[];
      trafficData: TrafficType[];
    }
  ): Promise<void> => {
    await api.post(`/tours/${tourId}/plan`, planData);
  },

  // 여행 계획 전체 조회
  getTourPlan: async (tourId: number): Promise<{
    tour: TourType;
    schedules: ScheduleType[];
    mapEntities: MapEntityType[];
    trafficData: TrafficType[];
  }> => {
    const response = await api.get<ApiResponse<{
      tour: TourType;
      schedules: ScheduleType[];
      mapEntities: MapEntityType[];
      trafficData: TrafficType[];
    }>>(`/tours/${tourId}/plan`);
    return response.data.data;
  }
};

export default tourAPI;
