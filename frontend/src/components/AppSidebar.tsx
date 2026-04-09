import { appMenu } from "../theme";
import type { Workspace } from "../types";
import { formatRole, initials } from "../utils/format";
import { Button } from "./ui/Button";
import { Icon, type IconName } from "./ui/Icon";

type MenuItem = {
  key: string;
  label: string;
  icon: IconName;
  active?: boolean;
  onClick?: () => void;
  meta?: string;
};

type ProjectItem = {
  id: string;
  label: string;
  meta?: string;
  active?: boolean;
  onClick: () => void;
};

type Props = {
  userName?: string;
  userEmail?: string;
  menuItems?: MenuItem[];
  workspaces?: Workspace[];
  projects?: ProjectItem[];
  activeWorkspaceId?: string;
  onWorkspaceSelect?: (workspaceId: string) => void;
  onLogout?: () => void;
};

export function AppSidebar({
  userName,
  userEmail,
  menuItems,
  workspaces = [],
  projects,
  activeWorkspaceId,
  onWorkspaceSelect,
  onLogout,
}: Props) {
  const resolvedMenu: MenuItem[] =
    menuItems ??
    appMenu.map((item, index) => ({
      ...item,
      meta: index === 1 ? `${workspaces.length}` : undefined,
    }));

  const resolvedProjects: ProjectItem[] =
    projects ??
    workspaces.map((workspace) => ({
      id: workspace.id,
      label: workspace.name,
      meta: formatRole(workspace.role),
      active: workspace.id === activeWorkspaceId,
      onClick: () => onWorkspaceSelect?.(workspace.id),
    }));

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-panel">
        <div className="brand-lockup">
          <div className="brand-lockup-main">
            <span className="sidebar-brand">Task Manager</span>
            <p className="sidebar-microcopy">Simple workspace and task tracking</p>
          </div>
          <Button variant="icon" aria-label="Open menu">
            <Icon name="menu" size={16} />
          </Button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">Menu</span>
          <div className="sidebar-list">
            {resolvedMenu.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`sidebar-nav-item${item.active ? " is-active" : ""}`}
                onClick={item.onClick}
              >
                <span className="sidebar-nav-title">
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </span>
                {item.meta ? <span className="sidebar-nav-meta">{item.meta}</span> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section sidebar-section-projects">
          <span className="sidebar-section-label">Projects</span>
          <div className="sidebar-list">
            {resolvedProjects.length === 0 ? (
              <div className="sidebar-empty">Create or join a workspace to see it here.</div>
            ) : (
              resolvedProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`sidebar-project-item${project.active ? " is-active" : ""}`}
                  onClick={project.onClick}
                >
                  <span className="sidebar-project-content">
                    <span className="sidebar-nav-title">
                      <Icon name="workspace" size={16} />
                      <span className="sidebar-nav-text">{project.label}</span>
                    </span>
                    {project.meta ? <span className="sidebar-project-meta">{project.meta}</span> : null}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-profile-details">
            <span className="avatar-badge">{initials(userName ?? "Task App")}</span>
            <div className="sidebar-profile-copy">
              <strong>{userName ?? "Workspace Admin"}</strong>
              <span>{userEmail ?? "team@taskapp.local"}</span>
            </div>
          </div>
        </div>

        {onLogout ? (
          <Button
            variant="danger"
            className="sidebar-logout-button"
            iconLeft={<Icon name="logout" size={16} />}
            onClick={onLogout}
          >
            Log out
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
