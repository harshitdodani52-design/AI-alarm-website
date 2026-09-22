package com.taskalarm.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    private String id;

    private String userId;

    private String alarmId;

    private String text;

    private int wordCount;

    private LocalDate date;

    private boolean valid;

    private String aiReason;

    private Instant createdAt = Instant.now();
}
