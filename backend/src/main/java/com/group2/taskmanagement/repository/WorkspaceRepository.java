package com.group2.taskmanagement.repository;

import com.group2.taskmanagement.domain.Workspace;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    Optional<Workspace> findByInviteCode(String inviteCode);
}
