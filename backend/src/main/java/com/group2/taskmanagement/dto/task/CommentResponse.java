package com.group2.taskmanagement.dto.task;

import com.group2.taskmanagement.domain.Comment;
import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponse(
    UUID id,
    UUID taskId,
    UUID authorId,
    String authorName,
    String body,
    LocalDateTime createdAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
            comment.getId(),
            comment.getTask().getId(),
            comment.getAuthor().getId(),
            comment.getAuthor().getName(),
            comment.getBody(),
            comment.getCreatedAt()
        );
    }
}
