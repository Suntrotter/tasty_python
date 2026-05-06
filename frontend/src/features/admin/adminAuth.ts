const ADMIN_SESSION_KEY = "tasty-python-admin-session";
const ADMIN_TOKEN_KEY = "tasty-python-admin-token";

export function getAdminPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD || "tasty-python-admin";
}

export function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function loginAdmin(password: string) {
  const expectedPassword = getAdminPassword();

  if (password !== expectedPassword) {
    return false;
  }

  localStorage.setItem(ADMIN_SESSION_KEY, "true");
  localStorage.setItem(ADMIN_TOKEN_KEY, password);

  return true;
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminAuthHeaders() {
  const token = getAdminToken();

  if (!token) {
    return {};
  }

  return {
    "X-Admin-Token": token,
  };
}