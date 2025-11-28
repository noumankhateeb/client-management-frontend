import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commentsApi } from '../../api';

export const fetchComments = createAsyncThunk('comments/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await commentsApi.getAll();
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
});

export const createComment = createAsyncThunk('comments/create', async (data, { rejectWithValue }) => {
    try {
        const response = await commentsApi.create(data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
    }
});

export const updateComment = createAsyncThunk('comments/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await commentsApi.update(id, data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
});

export const deleteComment = createAsyncThunk('comments/delete', async (id, { rejectWithValue }) => {
    try {
        await commentsApi.delete(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
});

const commentsSlice = createSlice({
    name: 'comments',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export const { clearError } = commentsSlice.actions;
export default commentsSlice.reducer;
