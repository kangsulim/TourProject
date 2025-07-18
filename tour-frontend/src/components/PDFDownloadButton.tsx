// src/components/PDFDownloadButton.tsx
import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer'; // PDFViewer 임포트
import { TourType, ScheduleItemDto } from '../types/travel';
import { generateTravelPlanPdfBlob } from '../utils/pdfGenerator'; // 변경된 함수명 임포트

// --- MUI 컴포넌트 임포트 ---
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // 닫기 아이콘
import GetAppIcon from '@mui/icons-material/GetApp'; // 다운로드 아이콘
import VisibilityIcon from '@mui/icons-material/Visibility'; // 미리보기 아이콘
import ArticleIcon from '@mui/icons-material/Article'; // PDF 생성 아이콘 (문서 아이콘)

interface PDFDownloadButtonProps {
  tour: TourType;
  date?: string; // YYYY-MM-DD 형식 (선택적: 날짜별 PDF용)
  filename?: string; // 저장할 파일명 (선택적)
  // --- 추가된 prop: PDF Blob을 부모 컴포넌트에 전달하기 위한 콜백 ---
  onPdfGenerated: (blob: Blob | null, type: 'full' | 'day', key: string) => void;
  // --- 추가된 prop: 현재 버튼과 연결된 PDF Blob (부모로부터 받음) ---
  currentPdfBlob: Blob | null;
  // --- 미리보기 기능 관련 prop (옵션): 미리보기 버튼 표시 여부 ---
  showPreview?: boolean;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  tour,
  date,
  filename,
  onPdfGenerated,
  currentPdfBlob, // 부모로부터 받은 PDF Blob
  showPreview = true, // 기본값 true로 설정하여 미리보기 항상 표시
}) => {
  const [isGenerating, setIsGenerating] = useState(false); // PDF 생성 중 상태 관리
  const [openPdfViewer, setOpenPdfViewer] = useState(false); // 미리보기 Dialog(모달) 상태

  // --- PDF 생성 및 Blob 전달 핸들러 ---
  const handleGeneratePdf = async () => {
    // 여행 계획 데이터가 없는 경우 알림
    if (!tour.planData?.schedules) {
      alert('일정 데이터가 없습니다.');
      return;
    }

    setIsGenerating(true); // PDF 생성 시작 알림 (로딩 스피너 활성화)
    let generatedBlob: Blob | null = null;
    let pdfType: 'full' | 'day' = 'full';
    let pdfKey: string = tour.tourId ? String(tour.tourId) : 'unknown_tour'; // PDF Blob을 저장할 고유 키

    try {
      // 날짜 필터링: date prop이 있으면 해당 날짜 스케줄만, 없으면 전체 스케줄 사용
      const filteredSchedules: ScheduleItemDto[] = date
        ? tour.planData.schedules.filter(schedule => schedule.date === date)
        : tour.planData.schedules;

      // 필터링 후 스케줄이 없는 경우 알림
      if (filteredSchedules.length === 0) {
        alert('선택한 날짜에 일정이 없습니다.');
        return;
      }

      // PDF 타입과 키 결정
      pdfType = date ? 'day' : 'full';
      if (date) {
        pdfKey = `${tour.tourId || 'unknown'}_${date}`; // 날짜별 PDF 키 (투어ID_날짜)
      } else {
        pdfKey = String(tour.tourId); // 전체 PDF 키 (투어ID)
      }

      // `pdfGenerator.ts`의 함수를 호출하여 PDF Blob 생성
      generatedBlob = await generateTravelPlanPdfBlob(tour, filteredSchedules);
      // 생성된 Blob을 부모 컴포넌트의 상태로 전달
      onPdfGenerated(generatedBlob, pdfType, pdfKey);
      // alert('PDF가 성공적으로 생성되었습니다!'); // Dialog(모달)나 Snackbar로 대체될 수 있음

    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      alert('PDF 생성에 실패했습니다.');
      onPdfGenerated(null, pdfType, pdfKey); // 오류 발생 시 null Blob 전달
    } finally {
      setIsGenerating(false); // PDF 생성 완료 (로딩 스피너 비활성화)
    }
  };

  // --- PDF 다운로드 핸들러 ---
  const handleDownload = () => {
    // PDF Blob이 준비되지 않은 경우 알림
    if (!currentPdfBlob) {
      alert('먼저 PDF를 생성해주세요!');
      return;
    }

    // 파일명 결정 (filename prop이 없으면 기본 파일명 사용)
    const pdfFilename = filename || (date ? `${tour.title}_${date}_일정.pdf` : `${tour.title}_전체_일정.pdf`);
    const url = URL.createObjectURL(currentPdfBlob); // Blob URL 생성
    const a = document.createElement('a'); // 가상 <a> 태그 생성
    a.href = url; // Blob URL 할당
    a.download = pdfFilename; // 다운로드 파일명 할당
    document.body.appendChild(a); // DOM에 추가
    a.click(); // 클릭 이벤트 발생시켜 다운로드
    document.body.removeChild(a); // DOM에서 제거
    URL.revokeObjectURL(url); // 메모리 해제 (Blob URL 해제)
  };

  // --- 미리보기 열기 핸들러 ---
  const handlePreviewOpen = () => {
    // PDF Blob이 준비되지 않은 경우 알림
    if (!currentPdfBlob) {
      alert('먼저 PDF를 생성해주세요!');
      return;
    }
    setOpenPdfViewer(true); // 미리보기 Dialog 열기
  };

  // --- 미리보기 닫기 핸들러 ---
  const handlePreviewClose = () => {
    setOpenPdfViewer(false); // 미리보기 Dialog 닫기
  };

  return (
    // MUI Box 컴포넌트로 버튼 그룹의 레이아웃 관리 (gap: 1은 8px 간격)
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', my: 1 }}>
      {/* PDF 생성 버튼 (MUI Button) */}
      <Button
        variant="contained" // 채워진 스타일
        color="primary"     // 기본 색상
        onClick={handleGeneratePdf} // 클릭 시 PDF 생성 함수 호출
        disabled={isGenerating}     // 생성 중이면 비활성화
        startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <ArticleIcon />} // 로딩 스피너 또는 아이콘
        sx={{ minWidth: 150 }} // 최소 너비 설정
      >
        {isGenerating ? '생성 중...' : (date ? `${date} 생성` : '전체 생성')}
      </Button>

      {/* PDF 다운로드 버튼 (MUI Button) */}
      <Button
        variant="outlined" // 외곽선 스타일
        color="secondary"  // 보조 색상
        onClick={handleDownload} // 클릭 시 다운로드 함수 호출
        disabled={!currentPdfBlob} // PDF Blob이 없으면 비활성화
        startIcon={<GetAppIcon />} // 다운로드 아이콘
      >
        다운로드
      </Button>

      {/* 미리보기 버튼 (MUI Button) - showPreview prop이 true일 때만 표시 */}
      {showPreview && (
        <Button
          variant="outlined" // 외곽선 스타일
          color="info"       // 정보성 색상
          onClick={handlePreviewOpen} // 클릭 시 미리보기 Dialog 열기
          disabled={!currentPdfBlob} // PDF Blob이 없으면 비활성화
          startIcon={<VisibilityIcon />} // 미리보기 아이콘
        >
          미리보기
        </Button>
      )}

      {/* PDF 미리보기 Dialog (모달) */}
      <Dialog
        open={openPdfViewer} // Dialog 열림/닫힘 상태
        onClose={handlePreviewClose} // Dialog 외부 클릭 또는 ESC 키 눌렀을 때 닫기
        maxWidth="md" // Dialog의 최대 너비 (미디어 쿼리 기반)
        fullWidth     // maxWidth 설정 시 너비를 100% 채움
      >
        {/* Dialog 제목 */}
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="h6" component="div">
            PDF 미리보기: {filename || (date ? `${tour.title}_${date}_일정` : `${tour.title}_전체_일정`)}
          </Typography>
          {/* 닫기 버튼 */}
          <IconButton
            aria-label="close"
            onClick={handlePreviewClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {/* Dialog 내용 - PDF 뷰어 삽입 */}
        <DialogContent dividers sx={{ height: '70vh', p: 0 }}> {/* 내용 영역, 구분선, 높이 설정, 내부 패딩 제거 */}
          {currentPdfBlob && (
            <PDFViewer width="100%" height="100%">
              {/* @react-pdf/renderer의 PDFViewer는 Blob URL을 src로 받는 iframe을 사용합니다 */}
              <iframe
                src={URL.createObjectURL(currentPdfBlob)}
                style={{ border: 'none', width: '100%', height: '100%' }}
                title="PDF Preview"
              ></iframe>
            </PDFViewer>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PDFDownloadButton;