import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  cars: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getCars = createAsyncThunk('cars/getAll', async (searchParams = {}, thunkAPI) => {
  try {
    const { startDate, endDate } = searchParams;
    let url = '/api/cars';
    if (startDate && endDate) {
      url = `/api/cars?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Admin ONLY: Send a new car to the MongoDB database securely
export const createCar = createAsyncThunk('cars/create', async (carData, thunkAPI) => {
  try {
    // 1. Grab the user token from the global Redux state
    const token = thunkAPI.getState().auth.user.token;
    // 2. Attach the token as "Bearer" payload
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // 3. Post to our heavily guarded Node REST API
    const response = await axios.post('/api/cars', carData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const carSlice = createSlice({
  name: 'car',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching Logic
      .addCase(getCars.pending, (state) => { state.isLoading = true; })
      .addCase(getCars.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cars = action.payload; 
      })
      .addCase(getCars.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Admin Uploading Logic
      .addCase(createCar.pending, (state) => { state.isLoading = true; })
      .addCase(createCar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Instantly push the new car to the website's Grid without refreshing the browser!
        state.cars.push(action.payload); 
      })
      .addCase(createCar.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = carSlice.actions;
export default carSlice.reducer;
