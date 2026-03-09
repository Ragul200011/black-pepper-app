// src/redux/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  loading:     false,
  error:       null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart(state) {
      state.loading = true;
      state.error   = null;
    },
    signInSuccess(state, action) {
      state.currentUser = action.payload;
      state.loading     = false;
      state.error       = null;
    },
    signInFailure(state, action) {
      state.loading = false;
      state.error   = action.payload;
    },
    signOut(state) {
      state.currentUser = null;
      state.error       = null;
      state.loading     = false;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  signOut,
} = userSlice.actions;

// Alias used by SignInScreen and SignUpScreen
export const setUser = signInSuccess;

export default userSlice.reducer;