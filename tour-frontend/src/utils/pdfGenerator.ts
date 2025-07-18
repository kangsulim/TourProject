
import React from 'react';
import { Page, Text, View, Document, StyleSheet, pdf, Font } from '@react-pdf/renderer'; // Font 임포트 추가
import { TourType, ScheduleItemDto, LocationDataDto, TrafficDataDto } from '../types/travel'; // 기존 타입 임포트

// --- 한글 폰트 등록 (필수) ---
// Noto Sans KR 폰트 파일을 public/fonts 폴더에 두는 것을 권장합니다.
// (예: public/fonts/NotoSansKR-Regular.ttf)
// 만약 다른 경로에 있다면 해당 경로로 수정해주세요.
try {
  Font.register({
    family: 'Noto Sans KR',
    src: '/fonts/NotoSansKR-Regular.ttf', // public 폴더 기준 경로
  });
} catch (error) {
  console.error("폰트 등록 중 오류 발생. 폰트 파일 경로를 확인해주세요:", error);
}


// --- PDF 스타일 정의 (MUI 디자인 시스템 참고) ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Noto Sans KR', // 등록된 한글 폰트 적용
  },
  section: {
    margin: 10,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#3F51B5', // MUI Primary color (예시)
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#424242',
  },
  dateHeader: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#616161',
  },
  activityText: {
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 12,
    color: '#212121',
  },
  locationDetail: {
    fontSize: 11,
    color: '#757575',
    marginLeft: 20,
    marginBottom: 3,
  },
  trafficDetail: {
    fontSize: 11,
    color: '#757575',
    marginLeft: 20,
    marginBottom: 3,
  },
  memoText: { // ScheduleItemDto에 memo 필드가 없다면 이 스타일은 사용되지 않을 수 있습니다.
    fontSize: 11,
    color: '#9E9E9E',
    marginLeft: 20,
    marginTop: 6,
    fontStyle: 'italic',
  }
});

// --- PDF 문서 컴포넌트 정의 ---
interface TravelPlanDocumentProps {
  tour: TourType;
  schedules: ScheduleItemDto[];
}

const TravelPlanDocument: React.FC<TravelPlanDocumentProps> = ({ tour, schedules }) => {
  // 날짜별로 스케줄을 그룹화
  const schedulesByDate: { [key: string]: ScheduleItemDto[] } = schedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as { [key: string]: ScheduleItemDto[] });

  // 날짜를 정렬 (오름차순)
  const sortedDates = Object.keys(schedulesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{tour.title} 여행 계획</Text>
          <Text style={styles.subtitle}>
            기간: {tour.startDate} ~ {tour.endDate} ({tour.travelers}명)
          </Text>
          {tour.budget && <Text style={styles.activityText}>예상 예산: {tour.budget}</Text>}
          {tour.planData?.metadata?.totalDays && (
            <Text style={styles.activityText}>총 일수: {tour.planData.metadata.totalDays}일</Text>
          )}
          {tour.planData?.metadata?.estimatedBudget && (
            <Text style={styles.activityText}>예상 총 경비: {tour.planData.metadata.estimatedBudget.toLocaleString()}원</Text>
          )}
        </View>

        {sortedDates.map((date, dateIndex) => (
          <View key={dateIndex} style={styles.section}>
            <Text style={styles.dateHeader}>날짜: {date}</Text>
            {schedulesByDate[date]
              .sort((a, b) => a.startTime.localeCompare(b.startTime)) // 시간 순서로 스케줄 정렬
              .map((schedule, scheduleIndex) => (
              <View key={scheduleIndex} style={{ marginBottom: 8 }}>
                <Text style={styles.activityText}>
                  {schedule.startTime} - {schedule.endTime}: {schedule.title}
                </Text>
                <Text style={styles.activityText}>  내용: {schedule.content}</Text>
                {schedule.type === 'location' && schedule.locationData && (
                  <View>
                    <Text style={styles.locationDetail}>  장소: {(schedule.locationData as LocationDataDto).name}</Text>
                    <Text style={styles.locationDetail}>  주소: {(schedule.locationData as LocationDataDto).address}</Text>
                    {(schedule.locationData as LocationDataDto).rating && (
                      <Text style={styles.locationDetail}>  평점: {(schedule.locationData as LocationDataDto).rating} / 5</Text>
                    )}
                    {(schedule.locationData as LocationDataDto).googleMapLink && (
                        <Text style={styles.locationDetail}>  지도: {(schedule.locationData as LocationDataDto).googleMapLink}</Text>
                    )}
                  </View>
                )}
                {schedule.type === 'traffic' && schedule.trafficData && (
                  <View>
                    <Text style={styles.trafficDetail}>  교통수단: {(schedule.trafficData as TrafficDataDto).mode}</Text>
                    <Text style={styles.trafficDetail}>  출발: {(schedule.trafficData as TrafficDataDto).departure}</Text>
                    <Text style={styles.trafficDetail}>  도착: {(schedule.trafficData as TrafficDataDto).destination}</Text>
                    <Text style={styles.trafficDetail}>  소요 시간: {(schedule.trafficData as TrafficDataDto).totalDuration}</Text>
                    <Text style={styles.trafficDetail}>  환승: {(schedule.trafficData as TrafficDataDto).transfers}회</Text>
                    <Text style={styles.trafficDetail}>  비용: {(schedule.trafficData as TrafficDataDto).price.toLocaleString()}원</Text>
                  </View>
                )}
                 {/* ScheduleType의 memo 필드가 ScheduleItemDto에 통합되지 않았다면 제거하거나 적절히 매핑해야 합니다. */}
                 {/* <Text style={styles.memoText}>메모: {schedule.memo || '없음'}</Text> */}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

// --- PDF Blob 생성 함수 ---
// 이 함수는 PDF 문서를 React 컴포넌트 형태로 받아 Blob으로 변환하여 반환합니다.
export async function generateTravelPlanPdfBlob(
  tour: TourType,
  schedules: ScheduleItemDto[]
): Promise<Blob> {
  const doc = <TravelPlanDocument tour={tour} schedules={schedules} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

