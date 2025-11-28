import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clientsApi } from '../../api';

export const fetchClients = createAsyncThunk('clients/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await clientsApi.getAll();
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
});

export const createClient = createAsyncThunk('clients/create', async (data, { rejectWithValue }) => {
    try {
        const response = await clientsApi.create(data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create client');
    }
});

export const updateClient = createAsyncThunk('clients/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await clientsApi.update(id, data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update client');
    }
});

export const deleteClient = createAsyncThunk('clients/delete', async (id, { rejectWithValue }) => {
    try {
        await clientsApi.delete(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete client');
    }
});

const clientsSlice = createSlice({
    name: 'clients',
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
            .addCase(fetchClients.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export const { clearError } = clientsSlice.actions;
export default clientsSlice.reducer;
