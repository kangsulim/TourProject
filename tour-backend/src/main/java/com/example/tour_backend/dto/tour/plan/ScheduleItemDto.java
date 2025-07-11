package com.example.tour_backend.dto.tour.plan;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleItemDto {
    private String scheduleId;
    private String date;
    private String startTime;
    private String endTime;
    private String title;
    private String content;
    private String type; // "location" or "traffic"
    private LocationDataDto locationData;
    private TrafficDataDto trafficData;
}