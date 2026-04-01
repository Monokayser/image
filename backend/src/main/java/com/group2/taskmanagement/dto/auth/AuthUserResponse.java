package com.group2.taskmanagement.dto.auth;

import com.group2.taskmanagement.domain.AppUser;
import java.time.LocalDateTime;
import java.util.UUID;

public record AuthUserResponse(
    UUID id,
    String name,
    String email,
    LocalDateTime createdAt
) {
    public static AuthUserResponse from(AppUser user) {
        return new AuthUserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
