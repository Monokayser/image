package com.group2.taskmanagement.dto.task;

import com.group2.taskmanagement.domain.TaskPriority;
import com.group2.taskmanagement.domain.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 180, message = "Title must be at most 180 characters")
    String title,

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    String description,

    @NotNull(message = "Status is required")
    TaskStatus status,

    @NotNull(message = "Priority is required")
    TaskPriority priority,

    LocalDate dueDate,

    UUID assigneeId
) {
}
