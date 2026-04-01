package com.group2.taskmanagement.repository;

import com.group2.taskmanagement.domain.Comment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

    @EntityGraph(attributePaths = {"author"})
    List<Comment> findAllByTask_IdOrderByCreatedAtAsc(UUID taskId);
}
