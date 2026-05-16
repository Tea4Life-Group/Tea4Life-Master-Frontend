import { createSlice } from "@reduxjs/toolkit";
import {
  initializeAuthStatus,
  executeOnboarding,
  executeUpdateProfile,
  executeUpdateAvatar,
} from "./authThunk";

interface AuthState {
  isAuthenticated: boolean;
  fullName: string | null;
  email: string | null;
  role: string;
  isLoading: boolean;
  initialized: boolean;
  onboarded: boolean;
  avatarUrl: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  fullName: null,
  email: null,
  role: "",
  avatarUrl: null,
  isLoading: false,
  initialized: false,
  onboarded: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: () => ({ ...initialState, initialized: true }),
    setAuthFailure: (state) => {
      state.isAuthenticated = false;
      state.initialized = true;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ================================
    // AUTH INIT
    // ================================
    builder

      .addCase(initializeAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.initialized = true;

        if (action.payload) {
          state.isAuthenticated = true;
          state.onboarded = action.payload.onboarded;
          state.fullName = action.payload.fullName;
          state.email = action.payload.email;
          state.role = action.payload.role ?? "";
          state.avatarUrl = action.payload.avatarUrl ?? "";
        }
      })
      .addCase(initializeAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.initialized = true;
      });

    // ================================
    // USER ONBOARDING
    // ================================
    builder
      .addCase(executeOnboarding.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(executeOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.onboarded = action.payload.onboarded;
          state.fullName = action.payload.fullName;
          state.email = action.payload.email;
          state.role = action.payload.role ?? "";
          state.avatarUrl = action.payload.avatarUrl ?? "";
        }
      })
      .addCase(executeOnboarding.rejected, (state) => {
        state.isLoading = false;
      });

    // ================================
    // UPDATE PROFILE
    // ================================
    builder
      .addCase(executeUpdateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(executeUpdateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.fullName = action.payload.fullName;
          state.email = action.payload.email;
          state.role = action.payload.role ?? "";
          state.avatarUrl = action.payload.avatarUrl ?? "";
        }
      })
      .addCase(executeUpdateProfile.rejected, (state) => {
        state.isLoading = false;
      });

    // ================================
    // UPDATE AVATAR
    // ================================
    builder
      .addCase(executeUpdateAvatar.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(executeUpdateAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.avatarUrl = action.payload.avatarUrl ?? "";
        }
      })
      .addCase(executeUpdateAvatar.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearAuth, setAuthFailure } = authSlice.actions;
export default authSlice.reducer;
