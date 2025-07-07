

import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Modal, Button, Container, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { fetchNotifications, markAsRead } from '../../services/notificationApi';
import { Notification } from '../../types/notification';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const NotificationPopup: React.FC = () => {
  // 모달(팝업창) 열림 여부 상태
  const [open, setOpen] = useState(false);
   // 서버에서 받아온 알림 목록 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
   // 사용자가 '삭제 선택' 버튼으로 선택한 알림 ID 목록 상태
  //const [selectedIds, setSelectedIds] = useState<number[]>([]);
    // 읽지 않은 새로운 알림이 있는지 여부 상태 (종 아이콘 점멸 효과용)
  const [hasNew, setHasNew] = useState(false);
  // 초기값은 'unread' (읽지 않은 알림 탭)
  const [tab, setTab] = useState<'unread' | 'read'>('unread');
    // 현재 로그인한 사용자 정보 (AuthContext에서 가져옴)
  const { user } = useContext(AuthContext);
  // react-router의 navigation 함수 (페이지 이동용)
  const navigate = useNavigate();

  // // 컴포넌트가 mount 되거나 open 상태, user가 바뀔 때마다 알림을 서버에서 불러오는 useEffect
  useEffect(() => {
    // user가 없으면(로그인 안됨) 아무것도 안함
    if (!user) return;
 // 비동기 함수로 알림 API 호출 및 상태 업데이트
    const load = async () => {
      const data = await fetchNotifications(user.userId);// 로그인 유저 ID로 알림 요청
          //1주일 지난 알림 필터링
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
          const filtered = data.filter(n => new Date(n.createDate) >= oneWeekAgo);

      setNotifications(filtered); // 받아온 알림 목록 상태에 저장
      setHasNew(filtered.some(n => !n.isRead)); // 읽지 않은 알림이 하나라도 있으면 true로 설정
    };
    load();
  }, [open, user]); // open 또는 user가 바뀌면 다시 불러옴
// 읽지 않은 알림만 또는 읽은 알림만 필터링해서 보여줌
  const filteredNotifications = notifications.filter(n =>
    tab === 'unread' ? !n.isRead : n.isRead
  );
  

   // 알림 클릭 시 해당 게시글 상세 페이지로 이동하고 팝업 닫음
   const handleClickThread = (threadId: number, noticeId: number) => {
    
      markAsRead(noticeId).catch(error => { 
        console.error('알림 읽음 처리 실패:', error);
      });      // 서버에 읽음 처리 요청
      setNotifications(prev =>
        prev.map(n => n.noticeId === noticeId ? { ...n, isRead: true } : n)
      );
      setTab('read'); 
      navigate(`/thread/${threadId}`);
      setOpen(false);
  };

  return (
    <>
      {/* 1. 오른쪽 아래에 고정된 종 모양 알림 아이콘 */}
      <Box
        sx={{
          position: 'fixed',  // 화면 고정 위치 지정
          bottom: 24,
          right: 24,
          zIndex: 1300, // 다른 요소 위에 표시
        }}
      >
          {/* 아이콘 버튼: 새로운 알림 있을 때 빨간색으로 강조 */}
        <IconButton
          color={hasNew ? 'error' : 'default'} // error 컬러는 빨간색
          onClick={() => setOpen(true)}  // 클릭 시 팝업 열기
        >
           {/* Badge는 아이콘 오른쪽 위에 작은 점을 표시 (새 알림 표시용) */}
          <Badge
            color="error"
            variant="dot"
            invisible={!hasNew} // 새로운 알림 없으면 점 숨김
          >
            {/* 종 모양 아이콘 */}
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>

         {/* 2. 알림 리스트를 보여주는 팝업 모달 */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Container
          sx={{
            position: 'absolute', // 모달 위치 지정 (우측 하단 근처)
            bottom: 200,
            right: 300,
            width: 600, // 넓이
            height: 500, //높이
            overflowY: 'auto', // 스크롤 가능하게
            bgcolor: 'white', // 배경 흰색
            borderRadius: 2, // 모서리 둥글게
            boxShadow: 24,  // 그림자 효과
            p: 2, // 패딩
          }}
        >
           {/* 제목 */}
          <Typography variant="h6" mb={2}>🔔 알림</Typography>

            {/* ---  읽지 않은 알림 / 읽은 알림 탭 버튼 UI --- */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant={tab === 'unread' ? 'contained' : 'outlined'}
              onClick={() => setTab('unread')}
              fullWidth
            >
              읽지 않은 알림
            </Button>
            <Button
              variant={tab === 'read' ? 'contained' : 'outlined'}
              onClick={() => setTab('read')}
              fullWidth
            >
              읽은 알림
            </Button>
          </Box>




           {/* 알림이 하나도 없으면 안내 메시지 */}
           {filteredNotifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {tab === 'unread' ? '읽지 않은 알림이 없습니다.' : '읽은 알림이 없습니다.'}
              </Typography>
          ) : (
            /* --- 알림 목록을 filteredNotifications로 교체 ---
               탭 상태에 따라 필터링 된 알림만 보여줌 */
            filteredNotifications.map(n => (
              <Box
                key={n.noticeId}
                onClick={() => handleClickThread(n.threadId, n.noticeId)}
                sx={{
                  p: 1,
                  mb: 1,
                  bgcolor: '#fafafa',
                  cursor: 'pointer',
                  borderRadius: 1,
                  border: '1px solid #ddd'
                }}
                >
              {/* 알림 메시지 */}
              <Typography variant="body2">
                💬 <strong>{n.message}</strong>
              </Typography>
               {/* 알림 생성일 표시 (로컬 시간) */}
              <Typography variant="caption" color="text.secondary">
                {new Date(n.createDate).toLocaleString()}
              </Typography>
             
             
            </Box>
          )))}
        
         
            
        
        </Container>
      </Modal>
      </>
  );
};

export default NotificationPopup;
