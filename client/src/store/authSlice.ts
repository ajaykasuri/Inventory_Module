import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/auth";
import type { Profile } from "../api/auth";
import { refreshSession, tokens } from "../api/http";

interface AuthState {
  status: "loading" | "authenticated" | "anonymous";
  profile: Profile | null;
}
const initialState: AuthState = { status: "loading", profile: null };

// Runs once when the app opens: if a refresh token exists, restore the session.
export const bootstrap = createAsyncThunk("auth/bootstrap", async () => {
  if (!tokens.getRefresh()) return null;
  if (!(await refreshSession())) return null;
  return authApi.me();
});

export const login = createAsyncThunk("auth/login", async (input: { email: string; password: string }) => {
  const res = await authApi.login(input);
  tokens.setAccess(res.accessToken);
  tokens.setRefresh(res.refreshToken);
  return authApi.me();
});

export const logout = createAsyncThunk("auth/logout", async () => {
  const refreshToken = tokens.getRefresh();
  if (refreshToken) await authApi.logout(refreshToken).catch(() => undefined);
  tokens.setAccess(null);
  tokens.setRefresh(null);
});

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionLost(state) {
      state.status = "anonymous";
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrap.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = action.payload ? "authenticated" : "anonymous";
      })
      .addCase(bootstrap.rejected, (state) => {
        state.status = "anonymous";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = "authenticated";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "anonymous";
        state.profile = null;
      });
  },
});

export const { sessionLost } = slice.actions;
export default slice.reducer;
