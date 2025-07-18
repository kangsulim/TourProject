import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container } from '@mui/material';
import Maps from '../Maps/Maps';
import Weathers from '../Weathers/Weathers';
import { TravelInfo } from '../../components/TravelInfo';
import TransportSection from '../../components/TransportSection';
import ScheduleSection from './components/ScheduleSection';
import { useTravelActions } from '../../store/travelStore';
import PDFDownloadButton from '../components/PDFDownloadButton'; // PDFDownloadButton 임포트
import { TourType, ScheduleItemDto, TravelPlanDto, WeatherItemDto, PlanMetadataDto } from '../types/travel'; // 필요한 타입 임포트


// 액션 버튼 컴포넌트
const ActionButtons = () => {
  const { saveTourToBackend } = useTravelActions();
  
  // 여행 완료 버튼 클릭 핸들러
  const handleTourComplete = async () => {
    try {
      const result = await saveTourToBackend();
      if (result) {
        alert('여행 계획이 성공적으로 저장되었습니다! 해피 트립! 🎉');
      } else {
        alert('저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('여행 완료 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };
  
  return (
  <Box 
    sx={{ 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2,
      backgroundColor: 'white',
      borderTop: '1px solid #e0e0e0',
      borderRadius: '0 0 15px 15px'
    }}
  >
    <Box sx={{ display: 'flex', gap: 1 }}>
      {/* 임시저장, 미리보기 버튼 제거 */}
    </Box>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <button style={{ padding: '8px 16px', borderRadius: '25px', border: 'none', background: '#4caf50', color: 'white' }}>
        📄 PDF 저장
      </button>
      <button 
        style={{ padding: '8px 16px', borderRadius: '25px', border: 'none', background: '#1976d2', color: 'white' }}
        onClick={handleTourComplete}
      >
        여행 완료
      </button>
    </Box>
  </Box>
);
};

/**
 * Tours 메인 페이지 - 새로운 planner.html 스타일 레이아웃
 * 
 * 새로운 레이아웃:
 * - 70% 메인 영역 (지도 + 일정 관리)
 * - 30% 사이드바 (여행 정보 + 교통 정보 + 날씨)
 */
const Tours: React.FC = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        p: 2
      }}
    >
      <Container maxWidth="xl">
        {/* 페이지 헤더 */}
        <Box 
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            p: 3,
            mb: 2,
            borderRadius: '15px'
          }}
        >
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>✈️ 나만의 여행 계획</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0 }}>완벽한 여행을 위한 스마트한 계획을 세워보세요</p>
        </Box>

        {/* 메인 레이아웃 */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: '70% 30%', // 정확한 70% + 30% 비율
            gap: 2,
            mb: 2,
            '@media (max-width: 1024px)': {
              gridTemplateColumns: '1fr', // 태블릿에서는 세로로
            }
          }}
        >
          {/* 70% 메인 영역 (지도 + 일정) */}
          <Box 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* 지도 영역 */}
            <Box 
              sx={{ 
                p: 2,
                pb: 1,
                flex: '0 0 450px' // 지도 높이 조정
              }}
            >
              <Box 
                sx={{ 
                  height: '100%',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Maps />
              </Box>
            </Box>

            {/* 일정 관리 영역 */}
            <Box 
              sx={{ 
                p: 2,
                pt: 1,
                flex: 1,
                minHeight: '400px', // 최소 높이 보장
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <ScheduleSection />
            </Box>

            {/* 액션 버튼들 */}
            <ActionButtons />
          </Box>

          {/* 30% 사이드바 */}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              '@media (max-width: 1024px)': {
                order: -1, // 모바일에서는 사이드바가 위로
              }
            }}
          >
            {/* 여행 정보 */}
            <Box 
              sx={{ 
                backgroundColor: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <TravelInfo />
            </Box>

            {/* 교통 정보 (신규 섹션) */}
            <Box 
              sx={{ 
                backgroundColor: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <TransportSection />
            </Box>

            {/* 날씨 정보 */}
            <Box 
              sx={{ 
                backgroundColor: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              <Weathers />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Tours;