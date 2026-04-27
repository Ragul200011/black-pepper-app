// src/redux/slices/userSlice.js — v4
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { currentUser: null, isAuthenticated: false, loading: false, error: null },
  reducers: {
    signInStart: (s) => {
      s.loading = true;
      s.error = null;
    },
    signInSuccess: (s, { payload }) => {
      s.currentUser = payload;
      s.isAuthenticated = true;
      s.loading = false;
      s.error = null;
    },
    signInFailure: (s, { payload }) => {
      s.loading = false;
      s.error = payload;
      s.isAuthenticated = false;
    },
    signOut: (s) => {
      s.currentUser = null;
      s.isAuthenticated = false;
      s.error = null;
      s.loading = false;
    },
    clearError: (s) => {
      s.error = null;
    },
    updateProfile: (s, { payload }) => {
      if (s.currentUser) s.currentUser = { ...s.currentUser, ...payload };
    },
  },
});

export const { signInStart, signInSuccess, signInFailure, signOut, clearError, updateProfile } =
  userSlice.actions;
export const setUser = signInSuccess; // backward compat

export const selectCurrentUser = (s) => s.user.currentUser;
export const selectIsAuthenticated = (s) => s.user.isAuthenticated;
export const selectAuthLoading = (s) => s.user.loading;
export const selectAuthError = (s) => s.user.error;

export default userSlice.reducer;
