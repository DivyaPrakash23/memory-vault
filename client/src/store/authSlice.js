import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../api/auth.api";

export const login = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(creds);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getMe();
    return data;
  } catch {
    return rejectWithValue(null);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    null,
    token:   localStorage.getItem("token") || null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    setToken(state, { payload }) {
      state.token = payload;
      localStorage.setItem("token", payload);
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, { payload }) => { state.loading = false; state.error = payload; };

    builder
      .addCase(login.pending,    pending)
      .addCase(login.rejected,   rejected)
      .addCase(login.fulfilled,  (state, { payload }) => {
        state.loading = false;
        state.user    = payload.user;
        state.token   = payload.accessToken;
        localStorage.setItem("token", payload.accessToken);
      })
      .addCase(register.pending,   pending)
      .addCase(register.rejected,  rejected)
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user    = payload.user;
        state.token   = payload.accessToken;
        localStorage.setItem("token", payload.accessToken);
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload.user;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
