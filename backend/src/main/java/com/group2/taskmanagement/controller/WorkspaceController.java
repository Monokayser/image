package com.group2.taskmanagement.controller;

import com.group2.taskmanagement.dto.workspace.CreateWorkspaceRequest;
import com.group2.taskmanagement.dto.workspace.JoinWorkspaceRequest;
import com.group2.taskmanagement.dto.workspace.WorkspaceMemberResponse;
import com.group2.taskmanagement.dto.workspace.WorkspaceSummaryResponse;
import com.group2.taskmanagement.security.AppUserPrincipal;
import com.group2.taskmanagement.service.WorkspaceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    public ResponseEntity<List<WorkspaceSummaryResponse>> list(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(workspaceService.listWorkspaces(principal));
    }

    @PostMapping
    public ResponseEntity<WorkspaceSummaryResponse> create(
        @Valid @RequestBody CreateWorkspaceRequest request,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(workspaceService.createWorkspace(request, principal));
    }

    @PostMapping("/join")
    public ResponseEntity<WorkspaceSummaryResponse> join(
        @Valid @RequestBody JoinWorkspaceRequest request,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(workspaceService.joinWorkspace(request, principal));
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMemberResponse>> members(
        @PathVariable UUID workspaceId,
        @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(workspaceService.listMembers(workspaceId, principal));
    }
}
