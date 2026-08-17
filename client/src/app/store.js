import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import servicesReducer from '../features/services/servicesSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    appointments: appointmentsReducer,
  },
});
