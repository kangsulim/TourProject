package com.example.tour_backend.dto.comment;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
/* Lombok 어노테이션-> 자동으로 다음 메서드를 만들어 줍니다: getter,setter toString()equals(), hashCode() */

public class CommentDto {
    private Long commentId; //Long은 정수 타입 중에서도 매우 큰 숫자를 담을 수 있는 자료형
    private Long threadId;
    private String comment;
    private String author; // ✅ 유지: 프론트엔드 호환성을 위해 남겨두지만 user.username에서 가져옴
    private LocalDateTime createDate;
    private LocalDateTime modifiedDate;
    private Long parentId; // 부모 댓글 ID 추가 7/2
    private List<CommentDto> comments; //7/2 자식 댓글 리스트
    
    // ✅ 추가: 사용자 ID (댓글 작성/수정/삭제 권한 확인용)
    private Long userId;
}