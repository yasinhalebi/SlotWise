import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchServices = createAsyncThunk('services/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/services');
    return data.services;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load services');
  }
});

export const createService = createAsyncThunk('services/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/services', payload);
    return data.service;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create service');
  }
});

export const updateService = createAsyncThunk(
  'services/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/services/${id}`, payload);
      return data.service;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk('services/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/services/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete service');
  }
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    clearServicesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const idx = state.list.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearServicesError } = servicesSlice.actions;
export default servicesSlice.reducer;
