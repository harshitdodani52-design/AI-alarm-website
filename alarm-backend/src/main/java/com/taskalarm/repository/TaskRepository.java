package com.taskalarm.repository;

import com.taskalarm.entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByUserId(String userId);
    List<Task> findByUserIdAndDate(String userId, LocalDate date);
}
