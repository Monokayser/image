import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";

type Props = {
  title?: string;
  userName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onReset?: () => Promise<void> | void;
  resetDisabled?: boolean;
};

export function AppTopbar({
  title,
  userName,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onReset,
  resetDisabled,
}: Props) {
  const hasSearch = searchPlaceholder !== undefined;

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        {title ? <span className="app-topbar-title">{title}</span> : null}
        {hasSearch ? (
          <label className="topbar-search">
            <Icon name="search" size={15} />
            <input
              value={searchValue ?? ""}
              onChange={onSearchChange ? (event) => onSearchChange(event.target.value) : undefined}
              placeholder={searchPlaceholder}
              readOnly={!onSearchChange}
            />
          </label>
        ) : null}
      </div>

      <div className="app-topbar-actions">
        {onReset ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={resetDisabled}
            iconLeft={<Icon name="trash" size={15} />}
            onClick={() => void onReset()}
          >
            Reset app
          </Button>
        ) : null}
        <div className="topbar-user-chip">
          <span className="topbar-user-avatar">
            <Icon name="user" size={16} />
          </span>
          <span className="topbar-user-name">{userName ?? "Workspace User"}</span>
        </div>
      </div>
    </header>
  );
}
