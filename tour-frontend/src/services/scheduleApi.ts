import api, { ApiResponse } from './api';
import { ScheduleType } from '../types/types/travel';

// Schedule API 서비스
export const scheduleAPI = {
  // 모든 일정 조회
  getAllSchedules: async (): Promise<ScheduleType[]> => {
    const response = await api.get<ApiResponse<ScheduleType[]>>('/schedules');
    return response.data.data;
  },

  // 특정 일정 조회
  getScheduleById: async (scheduleId: number): Promise<ScheduleType> => {
    const response = await api.get<ApiResponse<ScheduleType>>(`/schedules/${scheduleId}`);
    return response.data.data;
  },

  // 여행별 일정 목록 조회
  getSchedulesByTourId: async (tourId: number): Promise<ScheduleType[]> => {
    const response = await api.get<ApiResponse<ScheduleType[]>>(`/schedules/tour/${tourId}`);
    return response.data.data;
  },

  // 새 일정 생성
  createSchedule: async (scheduleData: Omit<ScheduleType, 'scheduleId'>): Promise<ScheduleType> => {
    const response = await api.post<ApiResponse<ScheduleType>>('/schedules', scheduleData);
    return response.data.data;
  },

  // 일정 정보 수정
  updateSchedule: async (scheduleId: number, scheduleData: Partial<ScheduleType>): Promise<ScheduleType> => {
    const response = await api.put<ApiResponse<ScheduleType>>(`/schedules/${scheduleId}`, scheduleData);
    return response.data.data;
  },

  // 일정 삭제
  deleteSchedule: async (scheduleId: number): Promise<void> => {
    await api.delete(`/schedules/${scheduleId}`);
  },

  // 일정 순서 변경
  reorderSchedules: async (tourId: number, scheduleIds: number[]): Promise<void> => {
    await api.put(`/schedules/tour/${tourId}/reorder`, { scheduleIds });
  },

  // 일정 시간 일괄 수정
  updateScheduleTimes: async (scheduleId: number, timeData: { startTime: string; endTime: string }): Promise<ScheduleType> => {
    const response = await api.patch<ApiResponse<ScheduleType>>(`/schedules/${scheduleId}/time`, timeData);
    return response.data.data;
  }
};

export default scheduleAPI;
