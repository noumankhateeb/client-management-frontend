import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi, permissionsApi } from '../../api';

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await usersApi.getAll();
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
});

export const createUser = createAsyncThunk('users/create', async (data, { rejectWithValue }) => {
    try {
        const response = await usersApi.create(data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await usersApi.update(id, data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
    try {
        await usersApi.delete(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
});

export const fetchUserPermissions = createAsyncThunk('users/fetchPermissions', async (userId, { rejectWithValue }) => {
    try {
        const response = await permissionsApi.getPermissions(userId);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
});

export const updatePermissions = createAsyncThunk('users/updatePermissions', async ({ userId, permissions }, { rejectWithValue }) => {
    try {
        const response = await permissionsApi.updatePermissions(userId, permissions);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update permissions');
    }
});

const usersSlice = createSlice({
    name: 'users',
    initialState: {
        items: [],
        selectedUserPermissions: [],
        loading: false,
        permissionsLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            })
            .addCase(fetchUserPermissions.pending, (state) => {
                state.permissionsLoading = true;
            })
            .addCase(fetchUserPermissions.fulfilled, (state, action) => {
                state.permissionsLoading = false;
                state.selectedUserPermissions = action.payload;
            })
            .addCase(fetchUserPermissions.rejected, (state, action) => {
                state.permissionsLoading = false;
                state.error = action.payload;
            })
            .addCase(updatePermissions.fulfilled, (state, action) => {
                state.selectedUserPermissions = action.payload;
            });
    },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
