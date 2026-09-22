package com.taskalarm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank(message = "Task text cannot be empty")
    private String text;

    private String alarmId;
}
