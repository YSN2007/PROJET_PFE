import { Navigate } from "react-router-dom";
import { getDashboardPathByRole, getStoredRoleId, getStoredToken } from "../utils/auth";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = getStoredToken();
  const roleId = getStoredRoleId();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(roleId)) {
    return <Navigate to="/unauthorized" replace state={{ redirectPath: getDashboardPathByRole(roleId) }} />;
  }

  return children;
}

export default ProtectedRoute;
