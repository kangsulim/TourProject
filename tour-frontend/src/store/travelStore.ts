import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  TourType,
  TravelPlanDto,
  ScheduleType,
  MapEntityType,
  TrafficType,
  WeatherType,
  RouteResult,
  LocationData,
  VehicleData
} from '../types/travel';
import { GooglePlaceResult } from '../types/googleMaps';
import { convertTourToBackendFormat, convertTourFromBackendFormat } from '../utils/tourDataConverter';
import { tourAPI } from '../services/tourApi';

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
  updateTourInfo: (tourInfo: Partial<TourType>) => void;
  clearCurrentTour: () => void;
  resetTourInfo: () => void;
  
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
  
  // 백엔드 연동 액션들
  saveTourToBackend: () => Promise<TourType | null>;
  loadTourFromBackend: (tourId: number) => Promise<void>;
  loadUserToursFromBackend: (userId: number) => Promise<TourType[]>;
  createNewTourInBackend: (userId: number) => Promise<TourType | null>;
}

// 샘플 데이터
const sampleData = {
  tour: {
    tourId: 1,
    title: "서울 2박 3일 여행",
    startDate: "2025-07-15",
    endDate: "2025-07-17",
    travelers: 2,
    budget: 'medium'
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

      updateTourInfo: (tourInfo) =>
        set(
          (state) => ({
            currentTour: state.currentTour
              ? { ...state.currentTour, ...tourInfo }
              : { 
                  title: '',
                  startDate: '',
                  endDate: '',
                  travelers: 2,
                  budget: 'medium' as const,
                  ...tourInfo 
                }
          }),
          false,
          'updateTourInfo'
        ),

      clearCurrentTour: () => 
        set({ currentTour: null }, false, 'clearCurrentTour'),

      resetTourInfo: () =>
        set({ 
          currentTour: {
            title: '',
            startDate: '',
            endDate: '',
            travelers: 2,
            budget: 'medium'
          } 
        }, false, 'resetTourInfo'),

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
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7일 후
            travelers: 2,
            budget: 'medium'
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
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7일 후
            travelers: 2,
            budget: 'medium'
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

      // 백엔드 연동 액션들
      saveTourToBackend: async () => {
        const { currentTour, schedules, mapEntities, trafficData, weatherData } = get();
        
        if (!currentTour) {
          console.error('저장할 여행 데이터가 없습니다.');
          return null;
        }

        try {
          set({ isLoading: true, error: null }, false, 'saveTourToBackend:start');
          
          console.log('=== 저장 시작 ===');
          console.log('현재 투어:', currentTour);
          console.log('일정 목록:', schedules);
          console.log('지도 엔티티:', mapEntities);
          console.log('교통편 데이터:', trafficData);
          console.log('날씨 데이터:', weatherData);
          
          // 사용자 인증 상태 확인 및 userId 가져오기
          const storedUser = localStorage.getItem('user');
          let currentUserId = currentTour.userId;
          
          if (!currentUserId && storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              currentUserId = userData.userId;
              console.log('localStorage에서 userId 가져옴:', currentUserId);
            } catch (error) {
              console.error('localStorage 사용자 데이터 파싱 실패:', error);
            }
          }
          
          if (!currentUserId) {
            console.error('사용자 ID가 없습니다. 로그인이 필요합니다.');
            set({
              isLoading: false,
              error: '로그인이 필요합니다. 사용자 인증 후 다시 시도해주세요.'
            }, false, 'saveTourToBackend:nouser');
            return null;
          }
          
          // currentTour에 userId 설정
          currentTour.userId = currentUserId;
          
          // 프론트엔드 데이터를 백엔드 형식으로 변환
          const backendTour = convertTourToBackendFormat(
            currentTour,
            schedules,
            mapEntities,
            trafficData,
            weatherData
          );
          
          console.log('백엔드 전송 데이터:', JSON.stringify(backendTour, null, 2));

          let savedTour: TourType;
          
          if (currentTour.tourId) {
            // 기존 여행 수정
            savedTour = await tourAPI.updateTour(currentTour.tourId, backendTour);
            console.log('여행 계획 수정 완료:', savedTour);
          } else {
            // 새 여행 생성
            savedTour = await tourAPI.createTour(backendTour);
            console.log('새 여행 계획 생성 완료:', savedTour);
          }

          // 저장된 데이터로 업데이트
          set(
            {
              currentTour: {
                ...currentTour,
                tourId: savedTour.tourId,
                createDate: savedTour.createDate,
                modifiedDate: savedTour.modifiedDate
              },
              isLoading: false
            },
            false,
            'saveTourToBackend:success'
          );

          return savedTour;
        } catch (error) {
          console.error('여행 계획 저장 실패:', error);
          
          // Axios 에러 상세 정보 추출
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            console.error('백엔드 응답:', axiosError.response?.data);
            console.error('상태 코드:', axiosError.response?.status);
            console.error('요청 데이터:', axiosError.config?.data);
          }
          
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.'
            },
            false,
            'saveTourToBackend:error'
          );
          return null;
        }
      },

      loadTourFromBackend: async (tourId: number) => {
        try {
          set({ isLoading: true, error: null }, false, 'loadTourFromBackend:start');
          
          const backendTour = await tourAPI.getTourById(tourId);
          const converted = convertTourFromBackendFormat(backendTour);
          
          set(
            {
              currentTour: converted.tour,
              schedules: converted.schedules,
              mapEntities: converted.mapEntities,
              trafficData: converted.trafficData,
              weatherData: converted.weatherData,
              isLoading: false
            },
            false,
            'loadTourFromBackend:success'
          );
          
          console.log('여행 계획 로드 완료:', converted);
        } catch (error) {
          console.error('여행 계획 로드 실패:', error);
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : '로드 중 오류가 발생했습니다.'
            },
            false,
            'loadTourFromBackend:error'
          );
        }
      },

      loadUserToursFromBackend: async (userId: number) => {
        try {
          set({ isLoading: true, error: null }, false, 'loadUserToursFromBackend:start');
          
          const tours = await tourAPI.getToursByUserId(userId);
          
          set({ isLoading: false }, false, 'loadUserToursFromBackend:success');
          
          console.log('사용자 여행 목록 로드 완료:', tours);
          return tours;
        } catch (error) {
          console.error('사용자 여행 목록 로드 실패:', error);
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : '목록 로드 중 오류가 발생했습니다.'
            },
            false,
            'loadUserToursFromBackend:error'
          );
          return [];
        }
      },

      createNewTourInBackend: async (userId: number) => {
        try {
          set({ isLoading: true, error: null }, false, 'createNewTourInBackend:start');
          
          const today = new Date().toISOString().split('T')[0];
          const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          const newTourData: Omit<TourType, 'tourId' | 'createDate' | 'modifiedDate'> = {
            userId,
            title: '나의 여행 계획',
            startDate: today,
            endDate: nextWeek,
            travelers: 2,
            budget: 'medium',
            planData: {
              schedules: [],
              weatherData: [],
              metadata: {
                version: '1.0',
                lastUpdated: new Date().toISOString(),
                totalDays: 0,
                estimatedBudget: 0
              }
            }
          };
          
          const createdTour = await tourAPI.createTour(newTourData);
          
          // 생성된 여행을 현재 여행으로 설정
          set(
            {
              currentTour: createdTour,
              schedules: [],
              mapEntities: [],
              trafficData: [],
              weatherData: [],
              isLoading: false
            },
            false,
            'createNewTourInBackend:success'
          );
          
          console.log('새 여행 생성 완료:', createdTour);
          return createdTour;
        } catch (error) {
          console.error('새 여행 생성 실패:', error);
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.'
            },
            false,
            'createNewTourInBackend:error'
          );
          return null;
        }
      },
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
    updateTourInfo: store.updateTourInfo,
    clearCurrentTour: store.clearCurrentTour,
    resetTourInfo: store.resetTourInfo,
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
    // 백엔드 연동 액션들
    saveTourToBackend: store.saveTourToBackend,
    loadTourFromBackend: store.loadTourFromBackend,
    loadUserToursFromBackend: store.loadUserToursFromBackend,
    createNewTourInBackend: store.createNewTourInBackend,
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