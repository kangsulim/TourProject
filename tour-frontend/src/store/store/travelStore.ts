import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  TourType,
  ScheduleType,
  MapEntityType,
  TrafficType,
  WeatherType,
  RouteResult,
  LocationData,
  VehicleData
} from '../../types/types/travel';
import { GooglePlaceResult } from '../../types/types/googleMaps';

interface TravelState {
  // 현재 여행 정보
  currentTour: TourType | null;
  
  // 일정 관련
  schedules: ScheduleType[];
  mapEntities: MapEntityType[];
  trafficData: TrafficType[];
  
  // 지도 관련
  selectedLocation: GooglePlaceResult | null;
  routeResults: RouteResult[];
  isRoutePanelOpen: boolean;
  
  // 날씨 정보
  weatherData: WeatherType[];
  
  // UI 상태
  selectedDayIndex: number;
  isLoading: boolean;
  error: string | null;
}

interface TravelActions {
  // Tour 관련 액션
  setCurrentTour: (tour: TourType) => void;
  clearCurrentTour: () => void;
  
  // Schedule 관련 액션
  addSchedule: (schedule: Omit<ScheduleType, 'scheduleId'>) => void;
  updateSchedule: (scheduleId: number, updates: Partial<ScheduleType>) => void;
  removeSchedule: (scheduleId: number) => void;
  reorderSchedules: (startIndex: number, endIndex: number) => void;
  
  // MapEntity 관련 액션
  addLocationToSchedule: (location: GooglePlaceResult, scheduleData?: Partial<ScheduleType>) => void;
  removeMapEntity: (mapId: number) => void;
  updateMapEntity: (mapId: number, updates: Partial<MapEntityType>) => void;
  
  // Traffic 관련 액션
  addRouteToSchedule: (route: RouteResult, scheduleData?: Partial<ScheduleType>) => void;
  removeTraffic: (trafficId: number) => void;
  
  // 지도 관련 액션
  setSelectedLocation: (location: GooglePlaceResult | null) => void;
  setRouteResults: (results: RouteResult[]) => void;
  toggleRoutePanel: () => void;
  setRoutePanelOpen: (isOpen: boolean) => void;
  
  // 날씨 관련 액션
  setWeatherData: (weatherData: WeatherType[]) => void;
  
  // UI 상태 액션
  setSelectedDayIndex: (index: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 데이터 초기화
  resetTravelData: () => void;
}

// 초기 상태
const initialState: TravelState = {
  currentTour: null,
  schedules: [],
  mapEntities: [],
  trafficData: [],
  selectedLocation: null,
  routeResults: [],
  isRoutePanelOpen: false,
  weatherData: [],
  selectedDayIndex: 0,
  isLoading: false,
  error: null,
};

// Zustand Store 생성
export const useTravelStore = create<TravelState & TravelActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Tour 관련 액션
      setCurrentTour: (tour) => 
        set({ currentTour: tour }, false, 'setCurrentTour'),

      clearCurrentTour: () => 
        set({ currentTour: null }, false, 'clearCurrentTour'),

      // Schedule 관련 액션
      addSchedule: (schedule) => {
        const newSchedule: ScheduleType = {
          ...schedule,
          scheduleId: Date.now(), // 임시 ID, 실제로는 서버에서 받아옴
        };
        set(
          (state) => ({
            schedules: [...state.schedules, newSchedule],
          }),
          false,
          'addSchedule'
        );
      },

      updateSchedule: (scheduleId, updates) =>
        set(
          (state) => ({
            schedules: state.schedules.map((schedule) =>
              schedule.scheduleId === scheduleId
                ? { ...schedule, ...updates }
                : schedule
            ),
          }),
          false,
          'updateSchedule'
        ),

      removeSchedule: (scheduleId) =>
        set(
          (state) => ({
            schedules: state.schedules.filter(
              (schedule) => schedule.scheduleId !== scheduleId
            ),
            mapEntities: state.mapEntities.filter(
              (entity) => entity.scheduleId !== scheduleId
            ),
          }),
          false,
          'removeSchedule'
        ),

      reorderSchedules: (startIndex, endIndex) => {
        const { schedules } = get();
        const result = Array.from(schedules);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        set({ schedules: result }, false, 'reorderSchedules');
      },

      // MapEntity 관련 액션
      addLocationToSchedule: (location, scheduleData = {}) => {
        const { currentTour } = get();
        if (!currentTour) return;

        // 기본 시간 설정 (2시간)
        const now = new Date();
        const defaultStartTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const defaultEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

        // Schedule 생성
        const newSchedule: ScheduleType = {
          scheduleId: Date.now(),
          tourId: currentTour.tourId!,
          scheduleTitle: location.name || '새로운 장소',
          content: location.formatted_address || '',
          date: new Date().toISOString().split('T')[0],
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          ...scheduleData,
        };

        // MapEntity 생성
        const locationData = {
          name: location.name || '',
          link: `https://maps.google.com/maps?place_id=${location.place_id}`,
          placeId: location.place_id || '',
          address: location.formatted_address || '',
          photoUrl: location.photos?.[0]?.getUrl({ maxWidth: 400 }) || '',
          rating: location.rating || 0,
        };

        const newMapEntity: MapEntityType = {
          mapId: Date.now() + 1,
          scheduleId: newSchedule.scheduleId!,
          tourId: currentTour.tourId!,
          location: JSON.stringify(locationData),
          googleMapLink: locationData.link,
          photoUrl: locationData.photoUrl,
          rating: locationData.rating,
        };

        set(
          (state) => ({
            schedules: [...state.schedules, newSchedule],
            mapEntities: [...state.mapEntities, newMapEntity],
          }),
          false,
          'addLocationToSchedule'
        );
      },

      removeMapEntity: (mapId) =>
        set(
          (state) => ({
            mapEntities: state.mapEntities.filter(
              (entity) => entity.mapId !== mapId
            ),
          }),
          false,
          'removeMapEntity'
        ),

      updateMapEntity: (mapId, updates) =>
        set(
          (state) => ({
            mapEntities: state.mapEntities.map((entity) =>
              entity.mapId === mapId ? { ...entity, ...updates } : entity
            ),
          }),
          false,
          'updateMapEntity'
        ),

      // Traffic 관련 액션
      addRouteToSchedule: (route, scheduleData = {}) => {
        const { currentTour } = get();
        if (!currentTour) return;

        // Schedule 생성
        const newSchedule: ScheduleType = {
          scheduleId: Date.now(),
          tourId: currentTour.tourId!,
          scheduleTitle: `${route.departure} → ${route.destination}`,
          content: `${route.duration}분 소요, 환승 ${route.transfers}회`,
          date: new Date().toISOString().split('T')[0],
          startTime: route.departureTime,
          endTime: route.arrivalTime,
          ...scheduleData,
        };

        // Traffic 생성
        const vehicleData = {
          mode: 'TRANSIT',
          steps: route.route,
          totalDuration: `${route.duration}분`,
          transfers: route.transfers,
          departure: route.departure,
          destination: route.destination,
        };

        const newTraffic: TrafficType = {
          trafficId: Date.now() + 1,
          tourId: currentTour.tourId!,
          vehicle: JSON.stringify(vehicleData),
          spendTime: new Date().toISOString(),
          price: route.price || 0,
          departureTime: route.departureTime,
          arrivalTime: route.arrivalTime,
          route: route.route.map(step => `${step.line} (${step.departure} → ${step.arrival})`).join(', '),
        };

        set(
          (state) => ({
            schedules: [...state.schedules, newSchedule],
            trafficData: [...state.trafficData, newTraffic],
          }),
          false,
          'addRouteToSchedule'
        );
      },

      removeTraffic: (trafficId) =>
        set(
          (state) => ({
            trafficData: state.trafficData.filter(
              (traffic) => traffic.trafficId !== trafficId
            ),
          }),
          false,
          'removeTraffic'
        ),

      // 지도 관련 액션
      setSelectedLocation: (location) =>
        set({ selectedLocation: location }, false, 'setSelectedLocation'),

      setRouteResults: (results) =>
        set({ routeResults: results }, false, 'setRouteResults'),

      toggleRoutePanel: () =>
        set(
          (state) => ({ isRoutePanelOpen: !state.isRoutePanelOpen }),
          false,
          'toggleRoutePanel'
        ),

      setRoutePanelOpen: (isOpen) =>
        set({ isRoutePanelOpen: isOpen }, false, 'setRoutePanelOpen'),

      // 날씨 관련 액션
      setWeatherData: (weatherData) =>
        set({ weatherData }, false, 'setWeatherData'),

      // UI 상태 액션
      setSelectedDayIndex: (index) =>
        set({ selectedDayIndex: index }, false, 'setSelectedDayIndex'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),

      setError: (error) =>
        set({ error }, false, 'setError'),

      // 데이터 초기화
      resetTravelData: () =>
        set(
          {
            ...initialState,
          },
          false,
          'resetTravelData'
        ),
    }),
    {
      name: 'travel-store', // devtools에서 보여질 이름
    }
  )
);

// 편의 함수들
export const useTravelActions = () => {
  const store = useTravelStore();
  return {
    setCurrentTour: store.setCurrentTour,
    clearCurrentTour: store.clearCurrentTour,
    addSchedule: store.addSchedule,
    updateSchedule: store.updateSchedule,
    removeSchedule: store.removeSchedule,
    reorderSchedules: store.reorderSchedules,
    addLocationToSchedule: store.addLocationToSchedule,
    removeMapEntity: store.removeMapEntity,
    updateMapEntity: store.updateMapEntity,
    addRouteToSchedule: store.addRouteToSchedule,
    removeTraffic: store.removeTraffic,
    setSelectedLocation: store.setSelectedLocation,
    setRouteResults: store.setRouteResults,
    toggleRoutePanel: store.toggleRoutePanel,
    setRoutePanelOpen: store.setRoutePanelOpen,
    setWeatherData: store.setWeatherData,
    setSelectedDayIndex: store.setSelectedDayIndex,
    setLoading: store.setLoading,
    setError: store.setError,
    resetTravelData: store.resetTravelData,
  };
};

// 상태만 가져오는 함수
export const useTravelState = () => {
  const store = useTravelStore();
  return {
    currentTour: store.currentTour,
    schedules: store.schedules,
    mapEntities: store.mapEntities,
    trafficData: store.trafficData,
    selectedLocation: store.selectedLocation,
    routeResults: store.routeResults,
    isRoutePanelOpen: store.isRoutePanelOpen,
    weatherData: store.weatherData,
    selectedDayIndex: store.selectedDayIndex,
    isLoading: store.isLoading,
    error: store.error,
  };
};
