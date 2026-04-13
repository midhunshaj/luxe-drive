import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import carReducer from './features/carSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carReducer,
  },
});
