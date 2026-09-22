package com.taskalarm.controller;

import com.taskalarm.entity.Alarm;
import com.taskalarm.repository.AlarmRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {

    private final AlarmRepository alarmRepository;

    public AlarmController(AlarmRepository alarmRepository) {
        this.alarmRepository = alarmRepository;
    }

    // NOTE: expects alarmTimeUtc to already be converted to UTC by the frontend
    // before sending (the user picks a time in IST, frontend converts to UTC).
    @PostMapping
    public ResponseEntity<Alarm> createAlarm(@RequestBody Alarm alarm, Authentication authentication) {
        alarm.setUserId(authentication.getName());
        alarm.setActive(true);
        Alarm saved = alarmRepository.save(alarm);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Alarm>> getMyAlarms(Authentication authentication) {
        return ResponseEntity.ok(alarmRepository.findByUserId(authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alarm> updateAlarm(@PathVariable String id, @RequestBody Alarm updated,
                                              Authentication authentication) {
        Alarm existing = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarm not found"));

        if (!existing.getUserId().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }

        existing.setAlarmTimeUtc(updated.getAlarmTimeUtc());
        existing.setRepeatDays(updated.getRepeatDays());
        existing.setActive(updated.isActive());

        return ResponseEntity.ok(alarmRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlarm(@PathVariable String id, Authentication authentication) {
        Alarm existing = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarm not found"));

        if (!existing.getUserId().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }

        alarmRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
