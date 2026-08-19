import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, login, logout, register } from "../features/auth/authSlice";

export function useAuth() {
  const { user, status, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const isAuthenticated = Boolean(user);
  const isLoading = status === "loading";

  const loginUser = useCallback(
    (credentials) => dispatch(login(credentials)),
    [dispatch]
  );

  const registerUser = useCallback(
    (details) => dispatch(register(details)),
    [dispatch]
  );

  const logoutUser = useCallback(() => dispatch(logout()), [dispatch]);

  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginUser,
    registerUser,
    logoutUser,
    clearError,
  };
}