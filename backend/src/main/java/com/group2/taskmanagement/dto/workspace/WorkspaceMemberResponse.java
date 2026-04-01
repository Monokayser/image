package com.group2.taskmanagement.dto.workspace;

import com.group2.taskmanagement.domain.WorkspaceMember;
import java.util.UUID;

public record WorkspaceMemberResponse(
    UUID userId,
    String name,
    String email,
    String role
) {
    public static WorkspaceMemberResponse from(WorkspaceMember member) {
        return new WorkspaceMemberResponse(
            member.getUser().getId(),
            member.getUser().getName(),
            member.getUser().getEmail(),
            member.getRole().name()
        );
    }
}
