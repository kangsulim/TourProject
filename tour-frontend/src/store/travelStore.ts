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
} from '../types/travel';
import { GooglePlaceResult } from '../types/googleMaps';

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
  
  // MapEntity 관련 액션
  addLocationToSchedule: (location: LocationData, scheduleData?: Partial<ScheduleType>) => void;
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
  
  // 테스트용 샘플 데이터 로드
  loadSampleData: () => void;
}

// 샘플 데이터
const sampleData = {
  tour: {
    tourId: 1,
    title: "서울 2박 3일 여행",
    startDate: "2025-07-15",
    endDate: "2025-07-17"
  },
  schedules: [
    {
      scheduleId: 1,
      tourId: 1,
      scheduleTitle: "경복궁 관람",
      content: "조선 왕조의 정궁, 근정전과 경회루 관람",
      date: "2025-07-15",
      startTime: "09:00",
      endTime: "11:00"
    },
    {
      scheduleId: 2,
      tourId: 1,
      scheduleTitle: "지하철 3호선 이용",
      content: "경복궁역 → 안국역, 5분 소요",
      date: "2025-07-15",
      startTime: "11:15",
      endTime: "11:20"
    },
    {
      scheduleId: 3,
      tourId: 1,
      scheduleTitle: "북촌한옥마을 산책",
      content: "전통 한옥의 아름다움과 서울 전경 감상",
      date: "2025-07-15",
      startTime: "11:30",
      endTime: "13:00"
    },
    {
      scheduleId: 4,
      tourId: 1,
      scheduleTitle: "명동 맛집 탐방",
      content: "명동교자 본점에서 만두 점심",
      date: "2025-07-15",
      startTime: "14:00",
      endTime: "15:30"
    },
    {
      scheduleId: 5,
      tourId: 1,
      scheduleTitle: "남산타워 관광",
      content: "서울의 야경 감상",
      date: "2025-07-15",
      startTime: "18:00",
      endTime: "20:00"
    }
  ],
  mapEntities: [
    {
      mapId: 1,
      scheduleId: 1,
      tourId: 1,
      location: JSON.stringify({
        name: "경복궁",
        address: "서울특별시 종로구 사직로 161",
        coordinates: { lat: 37.5796, lng: 126.9770 },
        placeId: "ChIJzRz3K2WIFTER4Dl0Zw8Uy6E",
        link: "https://maps.google.com/?cid=경복궁",
        rating: 4.3,
        photoUrl: "https://example.com/photo1.jpg"
      })
    },
    {
      mapId: 3,
      scheduleId: 3,
      tourId: 1,
      location: JSON.stringify({
        name: "북촌한옥마을",
        address: "서울특별시 종로구 계동길 37",
        coordinates: { lat: 37.5816, lng: 126.9839 },
        placeId: "ChIJ12345example",
        link: "https://maps.google.com/?cid=북촌한옥마을",
        rating: 4.1,
        photoUrl: "https://example.com/photo2.jpg"
      })
    },
    {
      mapId: 4,
      scheduleId: 4,
      tourId: 1,
      location: JSON.stringify({
        name: "명동교자 본점",
        address: "서울특별시 중구 명동10길 29",
        coordinates: { lat: 37.5618, lng: 126.9852 },
        placeId: "ChIJ67890example",
        link: "https://maps.google.com/?cid=명동교자",
        rating: 4.0,
        photoUrl: "https://example.com/photo3.jpg"
      })
    },
    {
      mapId: 5,
      scheduleId: 5,
      tourId: 1,
      location: JSON.stringify({
        name: "N서울타워",
        address: "서울특별시 용산구 남산공원길 105",
        coordinates: { lat: 37.5512, lng: 126.9882 },
        placeId: "ChIJabcdefexample",
        link: "https://maps.google.com/?cid=남산타워",
        rating: 4.2,
        photoUrl: "https://example.com/photo4.jpg"
      })
    }
  ],
  trafficData: [
    {
      trafficId: 2,
      tourId: 1,
      vehicle: JSON.stringify({
        mode: 'TRANSIT',
        steps: [
          {
            mode: 'SUBWAY',
            line: '지하철 3호선',
            departure: '경복궁역',
            arrival: '안국역',
            departureTime: '11:15',
            arrivalTime: '11:20'
          }
        ],
        totalDuration: '5분',
        transfers: 0,
        departure: '경복궁역',
        destination: '안국역'
      }),
      spendTime: '2025-07-15T11:15:00.000Z',
      price: 1500,
      departureTime: '11:15',
      arrivalTime: '11:20',
      route: '지하철 3호선 (경복궁역 → 안국역)'
    }
  ]
};

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

      // MapEntity 관련 액션
      addLocationToSchedule: (location, scheduleData = {}) => {
        let { currentTour } = get();
        
        // currentTour가 없으면 기본 투어 생성
        if (!currentTour) {
          const defaultTour: TourType = {
            tourId: Date.now(),
            title: "나의 여행 계획",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7일 후
          };
          
          // 기본 투어 설정
          set({ currentTour: defaultTour }, false, 'setDefaultTour');
          currentTour = defaultTour;
          
          console.log('기본 투어 자동 생성:', defaultTour);
        }

        // 기본 시간 설정 (2시간)
        const now = new Date();
        const defaultStartTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const defaultEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

        // Schedule 생성
        const newSchedule: ScheduleType = {
          scheduleId: Date.now(),
          tourId: currentTour.tourId!,
          scheduleTitle: location.name,
          content: location.address,
          date: new Date().toISOString().split('T')[0],
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          ...scheduleData,
        };

        // MapEntity 생성 - LocationData를 JSON으로 저장
        const newMapEntity: MapEntityType = {
          mapId: Date.now() + 1,
          scheduleId: newSchedule.scheduleId!,
          tourId: currentTour.tourId!,
          location: JSON.stringify(location), // LocationData 전체를 JSON으로 저장
        };

        console.log('일정 추가 - Schedule:', newSchedule);
        console.log('일정 추가 - MapEntity:', newMapEntity);

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
        let { currentTour } = get();
        
        // currentTour가 없으면 기본 투어 생성
        if (!currentTour) {
          const defaultTour: TourType = {
            tourId: Date.now(),
            title: "나의 여행 계획",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7일 후
          };
          
          // 기본 투어 설정
          set({ currentTour: defaultTour }, false, 'setDefaultTour');
          currentTour = defaultTour;
          
          console.log('기본 투어 자동 생성 (교통편):', defaultTour);
        }

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

        console.log('교통편 추가 - Schedule:', newSchedule);
        console.log('교통편 추가 - Traffic:', newTraffic);

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

      // 테스트용 샘플 데이터 로드
      loadSampleData: () =>
        set(
          {
            currentTour: sampleData.tour,
            schedules: sampleData.schedules,
            mapEntities: sampleData.mapEntities,
            trafficData: sampleData.trafficData,
          },
          false,
          'loadSampleData'
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
    loadSampleData: store.loadSampleData,
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