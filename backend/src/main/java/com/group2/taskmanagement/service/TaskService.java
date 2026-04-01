package com.group2.taskmanagement.service;

import com.group2.taskmanagement.domain.AppUser;
import com.group2.taskmanagement.domain.Comment;
import com.group2.taskmanagement.domain.Task;
import com.group2.taskmanagement.domain.TaskPriority;
import com.group2.taskmanagement.domain.TaskStatus;
import com.group2.taskmanagement.domain.Workspace;
import com.group2.taskmanagement.dto.task.CommentRequest;
import com.group2.taskmanagement.dto.task.CommentResponse;
import com.group2.taskmanagement.dto.task.CreateTaskRequest;
import com.group2.taskmanagement.dto.task.TaskResponse;
import com.group2.taskmanagement.dto.task.UpdateTaskRequest;
import com.group2.taskmanagement.exception.NotFoundException;
import com.group2.taskmanagement.repository.AppUserRepository;
import com.group2.taskmanagement.repository.CommentRepository;
import com.group2.taskmanagement.repository.TaskRepository;
import com.group2.taskmanagement.security.AppUserPrincipal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final AppUserRepository appUserRepository;
    private final WorkspaceService workspaceService;

    public List<TaskResponse> listTasks(
        UUID workspaceId,
        TaskStatus status,
        TaskPriority priority,
        UUID assigneeId,
        String query,
        Boolean overdue,
        AppUserPrincipal principal
    ) {
        workspaceService.ensureMembership(workspaceId, principal.getId());
        LocalDate today = LocalDate.now();

        return taskRepository.findAllByWorkspace_IdOrderByUpdatedAtDesc(workspaceId).stream()
            .filter(task -> status == null || task.getStatus() == status)
            .filter(task -> priority == null || task.getPriority() == priority)
            .filter(task -> assigneeId == null || (task.getAssignee() != null && assigneeId.equals(task.getAssignee().getId())))
            .filter(task -> query == null || query.isBlank() || matchesQuery(task, query))
            .filter(task -> overdue == null || !overdue || (task.getDueDate() != null && task.getDueDate().isBefore(today) && task.getStatus() != TaskStatus.DONE))
            .map(TaskResponse::from)
            .toList();
    }

    public TaskResponse createTask(UUID workspaceId, CreateTaskRequest request, AppUserPrincipal principal) {
        Workspace workspace = workspaceService.getWorkspace(workspaceId);
        workspaceService.ensureMembership(workspaceId, principal.getId());

        AppUser creator = getUser(principal.getId());
        AppUser assignee = resolveAssignee(request.assigneeId(), workspaceId);

        Task task = new Task();
        task.setWorkspace(workspace);
        task.setTitle(request.title().trim());
        task.setDescription(emptyToNull(request.description()));
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setAssignee(assignee);
        task.setCreator(creator);
        taskRepository.save(task);

        return TaskResponse.from(task);
    }

    public TaskResponse getTask(UUID taskId, AppUserPrincipal principal) {
        Task task = getAuthorizedTask(taskId, principal.getId());
        return TaskResponse.from(task);
    }

    public TaskResponse updateTask(UUID taskId, UpdateTaskRequest request, AppUserPrincipal principal) {
        Task task = getAuthorizedTask(taskId, principal.getId());
        AppUser assignee = resolveAssignee(request.assigneeId(), task.getWorkspace().getId());

        task.setTitle(request.title().trim());
        task.setDescription(emptyToNull(request.description()));
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setAssignee(assignee);
        taskRepository.save(task);

        return TaskResponse.from(task);
    }

    public void deleteTask(UUID taskId, AppUserPrincipal principal) {
        Task task = getAuthorizedTask(taskId, principal.getId());
        taskRepository.delete(task);
    }

    public List<CommentResponse> listComments(UUID taskId, AppUserPrincipal principal) {
        Task task = getAuthorizedTask(taskId, principal.getId());
        return commentRepository.findAllByTask_IdOrderByCreatedAtAsc(task.getId()).stream()
            .map(CommentResponse::from)
            .toList();
    }

    public CommentResponse addComment(UUID taskId, CommentRequest request, AppUserPrincipal principal) {
        Task task = getAuthorizedTask(taskId, principal.getId());
        AppUser author = getUser(principal.getId());

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setBody(request.body().trim());
        commentRepository.save(comment);

        return CommentResponse.from(comment);
    }

    private Task getAuthorizedTask(UUID taskId, UUID userId) {
        Task task = taskRepository.findWithDetailsById(taskId)
            .orElseThrow(() -> new NotFoundException("Task not found"));
        workspaceService.ensureMembership(task.getWorkspace().getId(), userId);
        return task;
    }

    private AppUser getUser(UUID userId) {
        return appUserRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private AppUser resolveAssignee(UUID assigneeId, UUID workspaceId) {
        if (assigneeId == null) {
            return null;
        }
        workspaceService.ensureMembership(workspaceId, assigneeId);
        return getUser(assigneeId);
    }

    private boolean matchesQuery(Task task, String query) {
        String normalized = query.trim().toLowerCase();
        return task.getTitle().toLowerCase().contains(normalized)
            || (task.getDescription() != null && task.getDescription().toLowerCase().contains(normalized))
            || (task.getAssignee() != null && task.getAssignee().getName().toLowerCase().contains(normalized));
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
