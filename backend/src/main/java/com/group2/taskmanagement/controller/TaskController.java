package com.group2.taskmanagement.controller;

import com.group2.taskmanagement.domain.TaskPriority;
import com.group2.taskmanagement.domain.TaskStatus;
import com.group2.taskmanagement.dto.task.CommentRequest;
import com.group2.taskmanagement.dto.task.CommentResponse;
import com.group2.taskmanagement.dto.task.CreateTaskRequest;
import com.group2.taskmanagement.dto.task.TaskResponse;
import com.group2.taskmanagement.dto.task.UpdateTaskRequest;
import com.group2.taskmanagement.security.AppUserPrincipal;
import com.group2.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/api/workspaces/{workspaceId}/tasks")
    public ResponseEntity<List<TaskResponse>> listTasks(
        @PathVariable UUID workspaceId,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(required = false) TaskPriority priority,
        @RequestParam(required = false) UUID assigneeId,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Boolean overdue,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(taskService.listTasks(workspaceId, status, priority, assigneeId, q, overdue, principal));
    }

    @PostMapping("/api/workspaces/{workspaceId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
        @PathVariable UUID workspaceId,
        @Valid @RequestBody CreateTaskRequest request,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(taskService.createTask(workspaceId, request, principal));
    }

    @GetMapping("/api/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
        @PathVariable UUID taskId,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(taskService.getTask(taskId, principal));
    }

    @PutMapping("/api/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
        @PathVariable UUID taskId,
        @Valid @RequestBody UpdateTaskRequest request,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request, principal));
    }

    @DeleteMapping("/api/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
        @PathVariable UUID taskId,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        taskService.deleteTask(taskId, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentResponse>> listComments(
        @PathVariable UUID taskId,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(taskService.listComments(taskId, principal));
    }

    @PostMapping("/api/tasks/{taskId}/comments")
    public ResponseEntity<CommentResponse> addComment(
        @PathVariable UUID taskId,
        @Valid @RequestBody CommentRequest request,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(taskService.addComment(taskId, request, principal));
    }
}
