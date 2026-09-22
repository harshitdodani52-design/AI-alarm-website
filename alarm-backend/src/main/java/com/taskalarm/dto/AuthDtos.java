package com.taskalarm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDtos {

    @Data
    public static class SignupRequest {
        @NotBlank
        private String username;

        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;

        public AuthResponse(String token, String username) {
            this.token = token;
            this.username = username;
        }
    }
}
