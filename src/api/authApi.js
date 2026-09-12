import api, { unwrap } from "./axios";

const saveAuth = (payload) => {
  const data = payload?.data ?? payload;
  const token =
    data?.token ||
    data?.access_token ||
    payload?.token ||
    payload?.access_token;
  const user = data?.user || payload?.user || data;
  if (token) localStorage.setItem("token", token);
  if (user && typeof user === "object")
    localStorage.setItem("user", JSON.stringify(user));
  return { token, user };
};

export const login = async ({ username, email, password }) => {
  const response = await api.post("/login", {
    username,
    email: email || username,
    password,
  });
  return saveAuth(unwrap(response));
};

export const register = async ({
  name,
  username,
  email,
  password,
  password_confirmation,
}) => {
  const response = await api.post("/register", {
    name,
    username: username || email,
    email,
    password,
    password_confirmation: password_confirmation || password,
  });
  const result = saveAuth(unwrap(response));
  return { ...result, raw: unwrap(response) };
};

export const getCurrentUser = async () => {
  const response = await api.get("/user");
  const user = unwrap(response)?.user || unwrap(response);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const updateCurrentUser = async (data) => {
  const response = await api.put("/user", data);
  const user = unwrap(response)?.user || unwrap(response);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }
};

export const isAuthenticated = () =>
  Boolean(
    localStorage.getItem("token") || localStorage.getItem("access_token"),
  );
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};
