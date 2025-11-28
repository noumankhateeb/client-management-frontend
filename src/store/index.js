import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import clientsReducer from './slices/clientsSlice';
import ordersReducer from './slices/ordersSlice';
import commentsReducer from './slices/commentsSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productsReducer,
        clients: clientsReducer,
        orders: ordersReducer,
        comments: commentsReducer,
        users: usersReducer,
    },
});

export default store;
