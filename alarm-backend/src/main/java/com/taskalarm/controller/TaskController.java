package com.taskalarm.controller;

import com.taskalarm.dto.TaskRequest;
import com.taskalarm.dto.ValidationResult;
import com.taskalarm.entity.Task;
import com.taskalarm.repository.TaskRepository;
import com.taskalarm.service.TaskValidationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskValidationService validationService;
    private final TaskRepository taskRepository;
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    public TaskController(TaskValidationService validationService, TaskRepository taskRepository) {
        this.validationService = validationService;
        this.taskRepository = taskRepository;
    }

    // Step 1: just validate, don't save yet — lets the frontend show feedback and allow retries
    @PostMapping("/validate")
    public ResponseEntity<ValidationResult> validate(@Valid @RequestBody TaskRequest request) {
        ValidationResult result = validationService.validateTask(request.getText());
        return ResponseEntity.ok(result);
    }

    // Step 2: once valid, frontend calls this to persist the task for the day
    @PostMapping
    public ResponseEntity<Task> saveTask(@Valid @RequestBody TaskRequest request, Authentication authentication) {
        String username = authentication.getName();

        ValidationResult result = validationService.validateTask(request.getText());
        if (!result.isValid()) {
            return ResponseEntity.badRequest().build();
        }

        Task task = new Task();
        task.setUserId(username);
        task.setAlarmId(request.getAlarmId());
        task.setText(request.getText());
        task.setWordCount(request.getText().trim().split("\\s+").length);
        task.setDate(LocalDate.now(IST));
        task.setValid(true);
        task.setAiReason(result.getReason());

        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> getMyTasks(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(taskRepository.findByUserId(username));
    }
}
