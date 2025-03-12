import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  isLoggedIn: false,
  access_token:  null,
  loading: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loadingStart: (state) => {
      state.loading = true
    },
    loadingEnd: (state) => {
      state.loading = false
    },
    loginStart: (state) => {
      state.loading = true
    },
    loginSuccess: (state, action) => {
      state.isLoggedIn = true
      state.loading = false
      state.currentUser = action.payload
    },
    loginFailure: (state) => {
      state.isLoggedIn = false
      state.loading = false
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.access_token = null
      state.currentUser = null
      state.loading = false
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = false
    },
    setAccessToken: (state, action) => {
      state.access_token = action.payload
    },
    clearAccessToken: (state) => {
      state.access_token = null
    }
  }
})

export const {
  loadingStart,
  loadingEnd,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setAccessToken,
  setLoggedIn,
  clearAccessToken,
} = userSlice.actions

export default userSlice.reducer