import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersApi } from '../../api';

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await ordersApi.getAll();
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
});

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
    try {
        const response = await ordersApi.create(data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
});

export const updateOrder = createAsyncThunk('orders/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await ordersApi.update(id, data);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
});

export const deleteOrder = createAsyncThunk('orders/delete', async (id, { rejectWithValue }) => {
    try {
        await ordersApi.delete(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete order');
    }
});

const ordersSlice = createSlice({
    name: 'orders',
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
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateOrder.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    },
});

export const { clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
