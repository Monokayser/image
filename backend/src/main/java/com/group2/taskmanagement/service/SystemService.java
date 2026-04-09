package com.group2.taskmanagement.service;

import com.group2.taskmanagement.repository.AppUserRepository;
import com.group2.taskmanagement.repository.CommentRepository;
import com.group2.taskmanagement.repository.TaskRepository;
import com.group2.taskmanagement.repository.WorkspaceMemberRepository;
import com.group2.taskmanagement.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final AppUserRepository appUserRepository;

    @Transactional
    public void resetApplicationData() {
        commentRepository.deleteAllInBatch();
        taskRepository.deleteAllInBatch();
        workspaceMemberRepository.deleteAllInBatch();
        workspaceRepository.deleteAllInBatch();
        appUserRepository.deleteAllInBatch();
    }
}
