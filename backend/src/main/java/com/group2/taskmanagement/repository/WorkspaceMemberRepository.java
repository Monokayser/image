package com.group2.taskmanagement.repository;

import com.group2.taskmanagement.domain.WorkspaceMember;
import com.group2.taskmanagement.domain.WorkspaceMemberId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {

    boolean existsByIdWorkspaceIdAndIdUserId(UUID workspaceId, UUID userId);

    Optional<WorkspaceMember> findByIdWorkspaceIdAndIdUserId(UUID workspaceId, UUID userId);

    @Query("""
        select wm from WorkspaceMember wm
        join fetch wm.user u
        where wm.id.workspaceId = :workspaceId
        order by u.name asc
        """)
    List<WorkspaceMember> findAllByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    @Query("""
        select wm from WorkspaceMember wm
        join fetch wm.workspace w
        where wm.id.userId = :userId
        order by w.createdAt desc
        """)
    List<WorkspaceMember> findAllByUserId(@Param("userId") UUID userId);
}
