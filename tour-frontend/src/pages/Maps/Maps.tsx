import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  Typography,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Directions as DirectionsIcon,
  Close as CloseIcon,
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  DirectionsBus as DirectionsBusIcon,
  Clear as ClearIcon,
  VisibilityOff as VisibilityOffIcon,
  List as ListIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

// 컴포넌트 imports
import GoogleMapsLoader from './MapsComponent/GoogleMapsLoader';
import GoogleMapContainer from './MapsComponent/GoogleMapContainer';
import MapSearchBox from './MapsComponent/MapSearchBox';
import PlaceSearchInput from './MapsComponent/PlaceSearchInput';
import { searchTransitRoutes } from './MapsComponent/RouteSearchService';

// 어제 작업한 타입들 import
import { LocationData, RouteResult } from '../../types/travel';
import { useTravelStore } from '../../store/travelStore';

// Google Places API 응답을 위한 타입 (Maps.tsx 내부 사용)
interface SearchResult {
  id: string;
  name: string;
  address: string;
  rating?: number;
  photoUrl?: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
}

const Maps: React.FC = () => {
  // ========================
  // 상태 관리
  // ========================
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState<boolean>(false);
  
  // 길찾기 패널 관련 상태
  const [isRoutePanelOpen, setIsRoutePanelOpen] = useState<boolean>(false);
  const [departureLocation, setDepartureLocation] = useState<LocationData | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);
  const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
  const [isSearchingRoute, setIsSearchingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string>('');
  
  // 선택된 위치 및 마커 상태
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [mapMarkers, setMapMarkers] = useState<LocationData[]>([]);
  // 지도 중심 좌표 상태 추가
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  
  // Zustand store
  const { addLocationToSchedule, addRouteToSchedule, setSelectedLocation: setStoreSelectedLocation } = useTravelStore();

  // ========================
  // 지도 관련 함수들
  // ========================
  
  /**
   * LocationData를 GooglePlaceResult로 변환
   * Weathers 컴포넌트와의 연동을 위해 필요
   */
  const convertLocationDataToGooglePlace = useCallback((location: LocationData): google.maps.places.PlaceResult => {
    return {
      place_id: location.placeId,
      name: location.name,
      formatted_address: location.address,
      geometry: {
        location: {
          lat: () => location.coordinates.lat,
          lng: () => location.coordinates.lng
        }
      },
      rating: location.rating,
      photos: location.photoUrl ? [{
        getUrl: () => location.photoUrl!
      }] : undefined
    } as google.maps.places.PlaceResult;
  }, []);

  /**
   * 장소 선택 처리 (검색창에서)
   */
  const handlePlaceSelect = useCallback((location: LocationData) => {
    console.log('장소 선택됨:', location);
    
    setSelectedLocation(location);
    
    // **Zustand store도 업데이트 (날씨 연동을 위해)**
    const googlePlace = convertLocationDataToGooglePlace(location);
    console.log('Maps: Zustand store에 업데이트할 GooglePlace:', googlePlace);
    setStoreSelectedLocation(googlePlace);
    
    // **지도 중심을 선택된 장소로 이동**
    setMapCenter({
      lat: location.coordinates.lat,
      lng: location.coordinates.lng
    });
    
    // 검색 결과에 추가 (중복 체크)
    const isDuplicate = mapMarkers.some(marker => marker.placeId === location.placeId);
    if (!isDuplicate) {
      setMapMarkers(prev => [...prev, location]);
    }
    
    // 검색 결과 패널용 데이터 생성
    const searchResultItem: SearchResult = {
      id: location.placeId,
      name: location.name,
      address: location.address,
      rating: location.rating,
      photoUrl: location.photoUrl,
      placeId: location.placeId,
      location: {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      }
    };
    
    // 검색 결과 목록에 추가 (중복 체크)
    setSearchResults(prev => {
      const exists = prev.some(result => result.placeId === location.placeId);
      if (exists) return prev;
      
      const newResults = [searchResultItem, ...prev];
      // 검색 결과가 추가되면 패널 자동 열기
      setIsSearchResultsOpen(true);
      return newResults;
    });
    
  }, [mapMarkers, convertLocationDataToGooglePlace, setStoreSelectedLocation]);

  /**
   * 현재 위치 요청
   */
  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('현재 위치:', { lat: latitude, lng: longitude });
        
        // TODO: 현재 위치를 기준으로 지도 중심 이동
        // 이 부분은 GoogleMapContainer에 ref를 추가해서 구현할 예정
      },
      (error) => {
        console.error('위치 요청 실패:', error);
        alert('현재 위치를 가져올 수 없습니다.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분 캐시
      }
    );
  }, []);

  /**
   * 지도에서 위치 선택 처리
   */
  const handleMapLocationSelect = useCallback((location: LocationData) => {
    setSelectedLocation(location);
  }, []);

  /**
   * 검색 결과에서 위치 선택
   */
  const handleSearchResultSelect = useCallback((result: SearchResult) => {
    const locationData: LocationData = {
      name: result.name,
      link: `https://maps.google.com/maps?place_id=${result.placeId}`,
      placeId: result.placeId,
      address: result.address,
      coordinates: {
        lat: result.location.lat,
        lng: result.location.lng
      },
      photoUrl: result.photoUrl,
      rating: result.rating
    };
    
    setSelectedLocation(locationData);
    
    // **Zustand store도 업데이트 (날씨 연동을 위해)**
    const googlePlace = convertLocationDataToGooglePlace(locationData);
    setStoreSelectedLocation(googlePlace);
    
    // **검색 결과 선택 시도 지도 중심 이동**
    setMapCenter({
      lat: result.location.lat,
      lng: result.location.lng
    });
  }, [convertLocationDataToGooglePlace, setStoreSelectedLocation]);

  /**
   * 일정에 위치 추가 (수정된 버전)
   */
  const handleAddLocationToSchedule = useCallback((result: SearchResult) => {
    const locationData: LocationData = {
      name: result.name,
      link: `https://maps.google.com/maps?place_id=${result.placeId}`,
      placeId: result.placeId,
      address: result.address,
      coordinates: {
        lat: result.location.lat,
        lng: result.location.lng
      },
      photoUrl: result.photoUrl,
      rating: result.rating
    };
    
    addLocationToSchedule(locationData);
    console.log('일정에 추가된 LocationData:', locationData);
  }, [addLocationToSchedule]);

  // ========================
  // 길찾기 관련 함수들
  // ========================
  
  /**
   * 길찾기 패널 토글
   */
  const toggleRoutePanel = useCallback(() => {
    setIsRoutePanelOpen(prev => !prev);
  }, []);

  /**
   * 길찾기 검색 (실제 API 연동)
   * 
   * 구현 이유:
   * 1. placeId 기반으로 정확한 위치 지정
   * 2. Google Directions API로 실제 대중교통 정보 획득
   * 3. 여러 경로 옵션 제공으로 사용자 선택권 확대
   */
  const handleRouteSearch = useCallback(async () => {
    if (!departureLocation || !destinationLocation) {
      setRouteError('출발지와 목적지를 모두 선택해주세요.');
      return;
    }
    
    setIsSearchingRoute(true);
    setRouteError('');
    
    try {
      console.log('길찾기 검색 시작:', {
        departure: departureLocation.name,
        destination: destinationLocation.name
      });
      
      // 실제 Google Directions API 호출
      const routes = await searchTransitRoutes({
        departure: departureLocation,
        destination: destinationLocation,
        departureTime: new Date() // 현재 시간 기준
      });
      
      console.log('길찾기 결과:', routes);
      setRouteResults(routes);
      
      if (routes.length === 0) {
        setRouteError('대중교통 경로를 찾을 수 없습니다. 다른 경로를 시도해보세요.');
      }
      
    } catch (error) {
      console.error('길찾기 오류:', error);
      setRouteError(
        error instanceof Error 
          ? error.message 
          : '길찾기 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSearchingRoute(false);
    }
  }, [departureLocation, destinationLocation]);

  /**
   * 검색 결과 패널 닫기
   */
  const handleCloseSearchResults = useCallback(() => {
    setIsSearchResultsOpen(false);
  }, []);

  /**
   * 검색 결과 전체 지우기
   */
  const handleClearSearchResults = useCallback(() => {
    setSearchResults([]);
    setIsSearchResultsOpen(false);
  }, []);

  /**
   * 일정에 경로 추가
   */
  const handleAddRouteToSchedule = useCallback((route: RouteResult) => {
    addRouteToSchedule(route);
    console.log('경로를 일정에 추가:', route);
  }, [addRouteToSchedule]);

  // ========================
  // 렌더링 함수들
  // ========================
  
  /**
   * 검색 결과 패널 렌더링
   */
  const renderSearchResults = () => (
    <Drawer
      anchor="left"
      variant="persistent"
      open={searchResults.length > 0 && isSearchResultsOpen}
      sx={{
        width: 400,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
          top: 64, // 헤더 높이만큼 아래로
          height: 'calc(100vh - 64px)'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* 검색 결과 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            검색 결과 ({searchResults.length}개)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* 전체 지우기 버튼 */}
            <IconButton 
              size="small" 
              onClick={handleClearSearchResults}
              title="모두 지우기"
              sx={{ color: 'text.secondary' }}
            >
              <ClearIcon />
            </IconButton>
            
            {/* 닫기 버튼 */}
            <IconButton 
              size="small" 
              onClick={handleCloseSearchResults}
              title="패널 닫기"
              sx={{ color: 'text.secondary' }}
            >
              <VisibilityOffIcon />
            </IconButton>
          </Box>
        </Box>
        
        {searchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {searchError}
          </Alert>
        )}
        
        <List>
          {searchResults.map((result) => (
            <React.Fragment key={result.id}>
              <ListItem alignItems="flex-start">
                <Card sx={{ width: '100%' }}>
                  {result.photoUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={result.photoUrl}
                      alt={result.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {result.name}
                    </Typography>
                    
                    {result.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={result.rating} readOnly precision={0.1} size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {result.rating}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {result.address}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        지도에서 보기
                      </Button>
                      
                      {/* **구글맵에서 보기 버튼 추가** */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        onClick={() => window.open(`https://maps.google.com/maps?place_id=${result.placeId}`, '_blank')}
                        sx={{ color: '#4285f4', borderColor: '#4285f4' }}
                      >
                        구글맵에서 보기
                      </Button>
                      
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddLocationToSchedule(result)}
                      >
                        일정 추가
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  /**
   * 길찾기 패널 렌더링 (개선된 버전)
   */
  const renderRoutePanel = () => (
    <Drawer
      anchor="right"
      open={isRoutePanelOpen}
      onClose={toggleRoutePanel}
      sx={{
        width: 400,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
          top: 64,
          height: 'calc(100vh - 64px)'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            길찾기
          </Typography>
          <IconButton onClick={toggleRoutePanel}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* 출발지 입력 */}
        <PlaceSearchInput
          label="출발지"
          value={departureLocation}
          onLocationSelect={setDepartureLocation}
          placeholder="출발지를 검색하세요 (예: 강남역)"
        />
        
        {/* 목적지 입력 */}
        <PlaceSearchInput
          label="목적지"
          value={destinationLocation}
          onLocationSelect={setDestinationLocation}
          placeholder="목적지를 검색하세요 (예: 홉대입구역)"
        />
        
        {/* 에러 메시지 */}
        {routeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {routeError}
          </Alert>
        )}
        
        {/* 검색 버튼 */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<DirectionsIcon />}
          onClick={handleRouteSearch}
          disabled={!departureLocation || !destinationLocation || isSearchingRoute}
          sx={{ mb: 3 }}
        >
          {isSearchingRoute ? '검색 중...' : '길찾기'}
        </Button>
        
        {routeResults.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              경로 결과 ({routeResults.length}개)
            </Typography>
            
            {routeResults.map((route, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  {/* 경로 요약 정보 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      icon={<AccessTimeIcon />} 
                      label={`${route.duration}분`} 
                      size="small" 
                      color="primary"
                    />
                    <Chip 
                      icon={<DirectionsBusIcon />} 
                      label={`환승 ${route.transfers}회`} 
                      size="small" 
                      color="secondary"
                    />
                  </Box>
                  
                  {/* 시간 정보 */}
                  <Typography variant="body2" gutterBottom>
                    {route.departureTime} → {route.arrivalTime}
                  </Typography>
                  
                  {/* 상세 경로 정보 */}
                  {route.route.length > 0 && (
                    <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        상세 경로:
                      </Typography>
                      {route.route.map((step, stepIndex) => {
                        // 교통수단별 한글 표시 및 색상
                        const getTransportInfo = (mode: string) => {
                          switch (mode) {
                            case 'SUBWAY':
                              return { label: '지하철', color: 'info' as const };
                            case 'BUS':
                              return { label: '버스', color: 'warning' as const };
                            case 'TRAIN':
                              return { label: '기차', color: 'success' as const };
                            case 'TRAM':
                              return { label: '전차', color: 'secondary' as const };
                            case 'HEAVY_RAIL':
                              return { label: '기차', color: 'success' as const };
                            case 'COMMUTER_TRAIN':
                              return { label: '통근열차', color: 'success' as const };
                            case 'HIGH_SPEED_TRAIN':
                              return { label: '고속철도', color: 'success' as const };
                            case 'WALKING':
                              return { label: '도보', color: 'default' as const };
                            default:
                              return { label: mode, color: 'default' as const };
                          }
                        };
                        
                        const transportInfo = getTransportInfo(step.mode);
                        
                        return (
                          <Box key={stepIndex} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Chip 
                              label={transportInfo.label}
                              size="small"
                              color={transportInfo.color}
                              sx={{ mr: 1, minWidth: 50 }}
                            />
                            <Typography variant="caption">
                              {step.line} ({step.departure} → {step.arrival})
                            </Typography>
                          </Box>
                        );
                      })
                    }</Box>
                  )}
                  
                  {/* 일정 추가 버튼 */}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddRouteToSchedule(route)}
                    sx={{ mt: 2 }}
                  >
                    일정에 추가
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );

  // ========================
  // 메인 렌더링
  // ========================
  return (
    <GoogleMapsLoader>
      <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
        {/* 지도 영역 */}
        <GoogleMapContainer
          selectedLocation={selectedLocation}
          markers={mapMarkers}
          onLocationSelect={handleMapLocationSelect}
          mapCenter={mapCenter}
        >
          {/* 검색창 */}
          <MapSearchBox
            onPlaceSelect={handlePlaceSelect}
            onCurrentLocation={handleCurrentLocation}
          />
          
          {/* 길찾기 버튼 */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
            onClick={toggleRoutePanel}
          >
            <DirectionsIcon />
          </IconButton>
          
          {/* 검색 결과 패널 열기 버튼 (검색 결과가 있지만 패널이 닫혀있을 때) */}
          {searchResults.length > 0 && !isSearchResultsOpen && (
            <IconButton
              sx={{
                position: 'absolute',
                top: 70,
                right: 16,
                backgroundColor: 'white',
                boxShadow: 2,
                '&:hover': { backgroundColor: 'grey.100' }
              }}
              onClick={() => setIsSearchResultsOpen(true)}
              title={`검색 결과 ${searchResults.length}개 보기`}
            >
              <ListIcon />
            </IconButton>
          )}
        </GoogleMapContainer>
        
        {/* 검색 결과 패널 (왼쪽) */}
        {renderSearchResults()}
        
        {/* 길찾기 패널 (오른쪽) */}
        {renderRoutePanel()}
      </Box>
    </GoogleMapsLoader>
  );
};

export default Maps;