import React, { useEffect, useState, useContext } from 'react';
import { getComments, postComment, updateComment, deleteComment } from '../../services/commentApi';
import { Comment, CommentRequest } from '../../types/comment';
import styles from './Comments.module.css';
import { AuthContext } from '../../context/AuthContext';

// 대부분 다 수정했으니 전체를 봐주세요 7/2

interface CommentsProps { // 컴포넌트 Props 타입 - 어느 게시글(thread)의 댓글인지 구분하는 ID
  threadId: number;   // 댓글을 가져올 게시글(스레드) ID
}

const Comments: React.FC<CommentsProps> = ({ threadId }) => {
  const [comments, setComments] = useState<Comment[]>([]); // 댓글 목록 상태 (Comment 배열)
  const [newComment, setNewComment] = useState('');  // 새 댓글 작성용 텍스트 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);  // 현재 수정 중인 댓글 ID (없으면 null)
  const [replyingTo, setReplyingTo] = useState<number | null>(null); // 대댓글 작성 중인 부모 댓글 ID 7/2
  const [replyContent, setReplyContent] = useState(''); // 대댓글 내용
  const [editingContent, setEditingContent] = useState(''); // 댓글 수정 텍스트 상태
  const { user } = useContext(AuthContext); // 로그인 사용자 정보 (AuthContext에서 가져옴)
  const isLoggedIn = !!user; // 로그인 여부 확인

  // 댓글 목록 불러오기 함수 - useCallback으로 감싸서 의존성(threadId)이 변할 때만 재생성
  const fetchComments = React.useCallback(async () => {
    try {
      // API 호출해서 댓글 데이터 받아오기
      const data = await getComments(threadId);
       // 받아온 댓글 데이터를 상태에 저장
      setComments(data);
    } catch (error) {
      console.error('댓글 불러오기 실패:', error);
    }
  }, [threadId]);
   // 컴포넌트가 처음 렌더링될 때와 threadId가 바뀔 때 댓글 목록 다시 불러오기
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 새 댓글 작성 폼 제출 시 호출되는 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     // 빈 댓글은 등록하지 않음
    if (!newComment.trim()) return;
 // 댓글 작성 요청용 객체 생성
    const requestData: CommentRequest = { //7/2 댓글
      comment: newComment.trim(),
      threadId,
      author: user?.username || 'anonymous', // 로그인 안 됐으면 anonymous
    };

    try {
       // API 호출해서 댓글 서버에 등록
      const newData = await postComment(requestData);
       // 등록된 댓글을 상태에 추가 (기존 댓글 유지하고 새 댓글 추가)
      setComments((prev) => [...prev, newData]);
       // 입력창 초기화
      setNewComment('');
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록에 실패했습니다. 로그인 상태를 확인해주세요.');
    }
  };
    // 대댓글 작성 제출 시 호출되는 함수
   const handleReplySubmit = async (parentId: number, e: React.FormEvent) => {
    e.preventDefault();
     // 빈 대댓글 등록 방지
    if (!replyContent.trim()) return;
 // 대댓글 작성 요청 데이터 (부모 댓글 ID 포함)
    const requestData: CommentRequest = {
      comment: replyContent.trim(),
      threadId,
      author: user?.username || 'anonymous',
      parentId, // 이 값이 있으면 서버에서 대댓글로 처리
    };

    try {
       // API 호출해서 대댓글 등록
      const newReply = await postComment(requestData);
      // 부모 댓글의 comments 배열에 대댓글 추가
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.commentId === parentId
            ? { ...c, comments: [...(c.comments || []), newReply] }
            : c
        )
      );
       // 대댓글 입력창 초기화 및 대댓글 작성 모드 종료
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('대댓글 등록 실패:', error);
      alert('대댓글 등록에 실패했습니다.');
    }
  };

  // 댓글 수정 시작수정할 댓글 ID와 현재 댓글 내용 전달)
  const handleEdit = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  // 댓글 수정 취소(수정 모드 종료 및 입력창 초기화)
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  // 댓글 수정 저장  (수정한 내용을 서버에 반영)
  const handleSaveEdit = async (commentId: number) => {
    if (!editingContent.trim()) {
      alert('댓글 내용을 입력하세요.');
      return;
    }
    try {
      // API 호출해서 댓글 수정 요청
      await updateComment(commentId, { comment: editingContent.trim(), threadId, author: user?.username || 'anonymous', }); 
       // 댓글 목록 다시 불러오기
      await fetchComments();
        // 수정 모드 종료
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제(삭제 확인 창 띄우고, 서버 삭제 후 목록 갱신)
  const handleDelete = async (commentId: number) => {
    const confirmed = window.confirm('이 댓글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      // API 호출해서 댓글 삭제
      await deleteComment(commentId);
       // 삭제 후 댓글 목록 다시 불러오기
      await fetchComments();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

   //  // 댓글과 대댓글을 재귀적으로 렌더링하는 함수
   const renderComments = (commentList: Comment[]) => {
    return commentList.map((comment) => (
      <li key={comment.commentId} className={styles.commentItem}>
         {/* 댓글 작성자와 작성일 표시 */}
        <div className={styles.commentHeader}>
          <span className={styles.author}>{comment.author}</span>
          <span className={styles.date}>{new Date(comment.createDate).toLocaleString()}</span>
        </div>
  {/* 현재 이 댓글이 수정 중인 댓글이면 수정용 textarea와 저장/취소 버튼 표시 */}
        {editingCommentId === comment.commentId ? (
          <>
            <textarea
              className={styles.editTextarea}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
            />
            <div className={styles.actions}>
              <button onClick={() => handleSaveEdit(comment.commentId)} className={styles.saveBtn}>
                저장
              </button>
              <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                취소
              </button>
            </div>
          </>
        ) : (
          <>
           {/* 수정 중이 아니면 댓글 내용과 수정/삭제/답글 버튼 표시 */}
            <p className={styles.content}>{comment.comment}</p>

            <div className={styles.actions}>
              {/* 로그인한 사용자에게만 답글 버튼 보임 */}
              {isLoggedIn && (
                <button
                  onClick={() => setReplyingTo(comment.commentId)}  // 대댓글 작성 폼 열기
                  className={styles.replyBtn}
                >
                  답글
                </button>
              )}
               {/* 댓글 작성자 본인에게만 수정/삭제 버튼 노출 */}
              {user?.username === comment.author && (
                <>
                  <button
                    onClick={() => handleEdit(comment.commentId, comment.comment)}
                    className={styles.editBtn}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(comment.commentId)}
                    className={styles.deleteBtn}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* 대댓글 작성 폼 (현재 댓글에 답글 작성 중일 때만 노출) */}
        {replyingTo === comment.commentId && (
          <form
            onSubmit={(e) => handleReplySubmit(comment.commentId, e)}
            className={styles.replyForm}
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 입력하세요"
              className={styles.textarea}
            />
            <button type="submit" className={styles.submitButton}>
              답글 등록
            </button>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setReplyContent('');
              }}
              className={styles.cancelBtn}
            >
              취소
            </button>
          </form>
        )}

        {/* 자식 댓글 (대댓글) 재귀 렌더링 */}
        {comment.comments && comment.comments.length > 0 && (
          <ul className={styles.childCommentList}>
            {renderComments(comment.comments)}
          </ul>
        )}
      </li>
    ));
  };
 // 컴포넌트 최종 렌더링 부분
  return (
    <div className={styles.commentSection}>
       {/* 댓글 총 개수 표시 */}
      <h3>댓글 ({comments.length})</h3>
      {/* 댓글 리스트 렌더링 */}
      <ul className={styles.commentList}>{renderComments(comments)}</ul>
     {/* 로그인 상태면 댓글 작성 폼 노출 */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            className={styles.textarea}
          />
          <button type="submit" className={styles.submitButton}>
            댓글 작성
          </button>
        </form>
      ) : (
         // 비로그인 시 로그인 안내 문구 노출
        <p className={styles.loginNotice}>로그인 후 댓글을 작성할 수 있습니다.</p>
      )}
    </div>
  );
};

export default Comments;