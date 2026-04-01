package com.group2.taskmanagement.service;

import com.group2.taskmanagement.domain.AppUser;
import com.group2.taskmanagement.domain.Role;
import com.group2.taskmanagement.domain.Workspace;
import com.group2.taskmanagement.domain.WorkspaceMember;
import com.group2.taskmanagement.domain.WorkspaceMemberId;
import com.group2.taskmanagement.dto.workspace.CreateWorkspaceRequest;
import com.group2.taskmanagement.dto.workspace.JoinWorkspaceRequest;
import com.group2.taskmanagement.dto.workspace.WorkspaceMemberResponse;
import com.group2.taskmanagement.dto.workspace.WorkspaceSummaryResponse;
import com.group2.taskmanagement.exception.BadRequestException;
import com.group2.taskmanagement.exception.ForbiddenException;
import com.group2.taskmanagement.exception.NotFoundException;
import com.group2.taskmanagement.repository.AppUserRepository;
import com.group2.taskmanagement.repository.WorkspaceMemberRepository;
import com.group2.taskmanagement.repository.WorkspaceRepository;
import com.group2.taskmanagement.security.AppUserPrincipal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final AppUserRepository appUserRepository;

    public List<WorkspaceSummaryResponse> listWorkspaces(AppUserPrincipal principal) {
        return workspaceMemberRepository.findAllByUserId(principal.getId()).stream()
            .map(member -> WorkspaceSummaryResponse.from(member.getWorkspace(), member.getRole()))
            .toList();
    }

    public WorkspaceSummaryResponse createWorkspace(CreateWorkspaceRequest request, AppUserPrincipal principal) {
        AppUser user = getUser(principal.getId());

        Workspace workspace = new Workspace();
        workspace.setName(request.name().trim());
        workspace.setDescription(request.description() != null ? request.description().trim() : null);
        workspace.setInviteCode(generateInviteCode());
        workspaceRepository.save(workspace);

        WorkspaceMember membership = new WorkspaceMember();
        membership.setId(new WorkspaceMemberId(workspace.getId(), user.getId()));
        membership.setWorkspace(workspace);
        membership.setUser(user);
        membership.setRole(Role.OWNER);
        workspaceMemberRepository.save(membership);

        return WorkspaceSummaryResponse.from(workspace, Role.OWNER);
    }

    public WorkspaceSummaryResponse joinWorkspace(JoinWorkspaceRequest request, AppUserPrincipal principal) {
        AppUser user = getUser(principal.getId());
        Workspace workspace = workspaceRepository.findByInviteCode(request.inviteCode().trim().toUpperCase())
            .orElseThrow(() -> new NotFoundException("Workspace not found for that invite code"));

        if (workspaceMemberRepository.existsByIdWorkspaceIdAndIdUserId(workspace.getId(), user.getId())) {
            throw new BadRequestException("You are already a member of this workspace");
        }

        WorkspaceMember membership = new WorkspaceMember();
        membership.setId(new WorkspaceMemberId(workspace.getId(), user.getId()));
        membership.setWorkspace(workspace);
        membership.setUser(user);
        membership.setRole(Role.MEMBER);
        workspaceMemberRepository.save(membership);

        return WorkspaceSummaryResponse.from(workspace, Role.MEMBER);
    }

    public List<WorkspaceMemberResponse> listMembers(UUID workspaceId, AppUserPrincipal principal) {
        ensureMembership(workspaceId, principal.getId());
        return workspaceMemberRepository.findAllByWorkspaceId(workspaceId).stream()
            .map(WorkspaceMemberResponse::from)
            .toList();
    }

    public void ensureMembership(UUID workspaceId, UUID userId) {
        if (!workspaceMemberRepository.existsByIdWorkspaceIdAndIdUserId(workspaceId, userId)) {
            throw new ForbiddenException("You do not have access to this workspace");
        }
    }

    public Workspace getWorkspace(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new NotFoundException("Workspace not found"));
    }

    private AppUser getUser(UUID userId) {
        return appUserRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}
