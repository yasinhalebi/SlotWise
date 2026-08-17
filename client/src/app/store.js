import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import servicesReducer from '../features/services/servicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
  },
});
