package com.example.tour_backend.domain.comment;

import com.example.tour_backend.domain.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.example.tour_backend.domain.thread.Thread;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comment")
@NoArgsConstructor
@Getter
@Setter
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "threadId", nullable = false)
    @JsonIgnore // 무한참조 방지 7/2
    private Thread thread;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    // ✅ author 필드 복원 (데이터베이스 호환성을 위해)
    @Column(nullable = false)
    private String author;

    @CreationTimestamp
    private LocalDateTime createDate;

    @UpdateTimestamp
    private LocalDateTime modifiedDate;

    // 7/2 대댓글 기능
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")  // 부모 댓글 참조
    private Comment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Comment> children = new ArrayList<>();

    // 📝 댓글 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ✅ 수정된 빌더 - user 필드 포함
    @Builder
    public Comment(Thread thread, String comment, User user,
                   LocalDateTime createDate, LocalDateTime modifiedDate) {
        this.thread = thread;
        this.comment = comment;
        this.user = user; // ✅ user 필드 추가
        this.author = user != null ? user.getUsername() : "unknown"; // ✅ author 자동 설정
        this.createDate = createDate;
        this.modifiedDate = modifiedDate;
    }

    // ✅ 추가: author 정보를 user에서 가져오는 편의 메서드
    public String getAuthor() {
        return author; // 이제 author 필드를 직접 반환
    }
}



