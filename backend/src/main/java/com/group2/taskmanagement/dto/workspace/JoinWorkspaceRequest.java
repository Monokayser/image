package com.group2.taskmanagement.dto.workspace;

import jakarta.validation.constraints.NotBlank;

public record JoinWorkspaceRequest(
    @NotBlank(message = "Invite code is required")
    String inviteCode
) {
}
