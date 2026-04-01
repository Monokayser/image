package com.group2.taskmanagement.dto.workspace;

import com.group2.taskmanagement.domain.Role;
import com.group2.taskmanagement.domain.Workspace;
import java.time.LocalDateTime;
import java.util.UUID;

public record WorkspaceSummaryResponse(
    UUID id,
    String name,
    String description,
    String inviteCode,
    Role role,
    LocalDateTime createdAt
) {
    public static WorkspaceSummaryResponse from(Workspace workspace, Role role) {
        return new WorkspaceSummaryResponse(
            workspace.getId(),
            workspace.getName(),
            workspace.getDescription(),
            workspace.getInviteCode(),
            role,
            workspace.getCreatedAt()
        );
    }
}
