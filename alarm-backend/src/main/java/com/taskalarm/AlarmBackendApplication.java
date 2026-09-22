package com.taskalarm;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class AlarmBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlarmBackendApplication.class, args);
    }

    // Ensures the JVM always treats "now" as IST, regardless of the
    // server's actual system timezone (important since Render defaults to UTC).
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }
}
