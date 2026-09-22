package com.taskalarm.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "alarms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alarm {

    @Id
    private String id;

    private String userId;

    // Always stored in UTC. Convert to/from IST only at the API boundary.
    private Instant alarmTimeUtc;

    // e.g. ["MON","TUE","WED"] for repeat days, empty = one-time alarm
    private List<String> repeatDays;

    private boolean active = true;

    private Instant createdAt = Instant.now();
}
