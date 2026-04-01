package com.group2.taskmanagement.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
    @NotBlank(message = "Comment body is required")
    @Size(max = 3000, message = "Comment body must be at most 3000 characters")
    String body
) {
}
