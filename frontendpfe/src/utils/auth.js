export const AUTH_TOKEN_STORAGE_KEY = "token";
export const AUTH_USER_STORAGE_KEY = "authUser";
export const AUTH_ROLE_STORAGE_KEY = "role_id";
export const AUTH_LOGIN_CONTEXT_STORAGE_KEY = "authLoginContext";

export function normalizeRoleId(roleId) {
  const parsed = Number(roleId);
  return Number.isFinite(parsed) ? parsed : null;
}

export function saveAuthSession({ token, user }) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }

  if (user) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    const normalizedRoleId = normalizeRoleId(user.role_id);
    if (normalizedRoleId !== null) {
      localStorage.setItem(AUTH_ROLE_STORAGE_KEY, String(normalizedRoleId));
    }
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
}

export function saveLoginContext(context) {
  if (!context) return;
  sessionStorage.setItem(AUTH_LOGIN_CONTEXT_STORAGE_KEY, JSON.stringify(context));
}

export function getLoginContext() {
  try {
    const rawValue = sessionStorage.getItem(AUTH_LOGIN_CONTEXT_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

export function clearLoginContext() {
  sessionStorage.removeItem(AUTH_LOGIN_CONTEXT_STORAGE_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  try {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function getStoredRoleId() {
  const storedRoleId = normalizeRoleId(localStorage.getItem(AUTH_ROLE_STORAGE_KEY));
  if (storedRoleId !== null) {
    return storedRoleId;
  }

  return normalizeRoleId(getStoredUser()?.role_id);
}

export function getDashboardPathByRole(roleId) {
  const normalizedRoleId = normalizeRoleId(roleId);

  if (normalizedRoleId === 1) return "/admin/dashboard";
  if (normalizedRoleId === 2) return "/formateur/dashboard";
  if (normalizedRoleId === 3) return "/stagiaire/dashboard";

  return "/";
}

export function getRoleLabelById(roleId) {
  const normalizedRoleId = normalizeRoleId(roleId);

  if (normalizedRoleId === 1) return "Admin";
  if (normalizedRoleId === 2) return "Formateur";
  if (normalizedRoleId === 3) return "Stagiaire";

  return "Utilisateur";
}
