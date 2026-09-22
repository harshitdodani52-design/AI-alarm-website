package com.taskalarm.repository;

import com.taskalarm.entity.Alarm;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AlarmRepository extends MongoRepository<Alarm, String> {
    List<Alarm> findByUserId(String userId);
    List<Alarm> findByUserIdAndActiveTrue(String userId);
}
