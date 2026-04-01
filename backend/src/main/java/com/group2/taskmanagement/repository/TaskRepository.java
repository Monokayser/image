package com.group2.taskmanagement.repository;

import com.group2.taskmanagement.domain.Task;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    @EntityGraph(attributePaths = {"assignee", "creator", "workspace"})
    List<Task> findAllByWorkspace_IdOrderByUpdatedAtDesc(UUID workspaceId);

    @EntityGraph(attributePaths = {"assignee", "creator", "workspace"})
    @Query("select t from Task t where t.id = :id")
    Optional<Task> findWithDetailsById(@Param("id") UUID id);
}
