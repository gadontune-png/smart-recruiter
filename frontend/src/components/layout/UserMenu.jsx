import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Dropdown from "../common/Dropdown";
import { ROUTES } from "../../utils/constants";

function UserMenu() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logoutUser();
    navigate(ROUTES.LOGIN);
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Dropdown
      trigger={
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Open profile menu">
          <span className="avatar" aria-hidden="true">
            {initials}
          </span>
        </button>
      }
    >
      <li role="none" className="dropdown-item" style={{ cursor: "default" }}>
        <strong>{user.name}</strong>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          {user.email}
        </div>
      </li>
      <Dropdown.Divider />
      <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
    </Dropdown>
  );
}

export default UserMenu;