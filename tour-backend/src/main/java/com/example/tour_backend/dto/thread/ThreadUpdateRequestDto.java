package com.example.tour_backend.dto.thread;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ThreadUpdateRequestDto {
    private String title;
    private String content;
    private String author;
    private String area;
    private Long userId;
    private String filePath; // 파일 업로드
}
