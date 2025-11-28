import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, permissionsApi } from '../../api';

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue, dispatch }) => {
        try {
            const response = await authApi.login(credentials);
            const { token, user } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Fetch permissions if not admin
            if (!user.isAdmin) {
                dispatch(fetchUserPermissions(user.id));
            }
            
            return { token, user };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue, dispatch }) => {
        try {
            const response = await authApi.register(userData);
            const { token, user } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Fetch permissions if not admin
            if (!user.isAdmin) {
                dispatch(fetchUserPermissions(user.id));
            }
            
            return { token, user };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await authApi.getMe();
            const user = response.data.data;
            
            // Fetch permissions if not admin
            if (!user.isAdmin) {
                dispatch(fetchUserPermissions(user.id));
            }
            
            return user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const fetchUserPermissions = createAsyncThunk(
    'auth/fetchUserPermissions',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await permissionsApi.getPermissions(userId);
            const permissions = response.data.data;
            
            // Convert permissions array to object keyed by resource
            const permissionsMap = {};
            permissions.forEach(perm => {
                permissionsMap[perm.resource] = {
                    canView: perm.canView,
                    canCreate: perm.canCreate,
                    canUpdate: perm.canUpdate,
                    canDelete: perm.canDelete,
                };
            });
            
            return permissionsMap;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
        }
    }
);

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    permissions: {},
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.permissions = {};
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch current user
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            })
            // Fetch user permissions
            .addCase(fetchUserPermissions.fulfilled, (state, action) => {
                state.permissions = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
