import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { LocationOn, Cloud, CalendarToday, AccessTime } from '@mui/icons-material';
import Maps from '../Maps/Maps';
import Weathers from '../Weathers/Weathers';
import Schedules from '../Schedules/Schedules';
import { TravelInfo } from '../../components/TravelInfo';

/**
 * Tours 메인 페이지 - 여행 계획 통합 인터페이스
 * 
 * 레이아웃:
 * - 60% 지도 영역 (Maps 컴포넌트)
 * - 40% 사이드패널
 *   - 25% 여행 정보 폼
 *   - 15% 날씨 위젯
 *   - 60% 일정 관리
 */
const Tours: React.FC = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa'
      }}
    >
      {/* 60% 지도 영역 */}
      <Box 
        sx={{ 
          flex: '0 0 60%',
          position: 'relative',
          borderRight: '1px solid #e0e0e0'
        }}
      >
        <Maps />
      </Box>
      
      {/* 40% 사이드패널 */}
      <Box 
        sx={{ 
          flex: '0 0 40%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff'
        }}
      >
        {/* 25% 여행 정보 폼 영역 */}
        <Box 
          sx={{ 
            flex: '0 0 25%',
            borderBottom: '1px solid #e0e0e0',
            overflow: 'auto'
          }}
        >
          <TravelInfo />
        </Box>
        
        {/* 15% 날씨 위젯 영역 */}
        <Box 
          sx={{ 
            flex: '0 0 15%',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f8f9ff'
          }}
        >
          <Weathers />
        </Box>
        
        {/* 60% 일정 관리 영역 */}
        <Box 
          sx={{ 
            flex: '1',
            overflow: 'hidden' // Schedules 컴포넌트가 내부에서 스크롤 처리
          }}
        >
          <Schedules />
        </Box>
      </Box>
    </Box>
  );
};

export default Tours;