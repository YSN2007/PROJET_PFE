import { NavLink } from "react-router-dom";

function RoleSpaceNav({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="role-space-nav" aria-label="Role space navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `role-space-nav-link ${isActive ? "active" : ""}`}
        >
          <span>{item.label}</span>
          {item.caption ? <small>{item.caption}</small> : null}
        </NavLink>
      ))}
    </nav>
  );
}

export default RoleSpaceNav;
