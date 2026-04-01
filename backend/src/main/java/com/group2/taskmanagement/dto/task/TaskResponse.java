package com.group2.taskmanagement.dto.task;

import com.group2.taskmanagement.domain.Task;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
    UUID id,
    UUID workspaceId,
    String title,
    String description,
    String status,
    String priority,
    LocalDate dueDate,
    UUID assigneeId,
    String assigneeName,
    UUID creatorId,
    String creatorName,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
            task.getId(),
            task.getWorkspace().getId(),
            task.getTitle(),
            task.getDescription(),
            task.getStatus().name(),
            task.getPriority().name(),
            task.getDueDate(),
            task.getAssignee() != null ? task.getAssignee().getId() : null,
            task.getAssignee() != null ? task.getAssignee().getName() : null,
            task.getCreator().getId(),
            task.getCreator().getName(),
            task.getCreatedAt(),
            task.getUpdatedAt()
        );
    }
}
