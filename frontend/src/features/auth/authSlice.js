import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { STORAGE_KEYS } from "../../utils/constants";

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user) return parsed;
    return { access_token: parsed?.token || null, user: parsed || null };
  } catch {
    return null;
  }
}

function persistAuth(payload) {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(payload));
}

const stored = loadStoredAuth();

const initialState = {
  token: stored?.access_token || null,
  user: stored?.user || null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(error.message || "Login failed.");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (details, { rejectWithValue }) => {
    try {
      return await authService.register(details);
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.error = null;
        persistAuth(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.error = null;
        persistAuth(action.payload);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;