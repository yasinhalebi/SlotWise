import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/appointments', { params });
      return data.appointments;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load appointments');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/appointments/${id}/status`, { status });
      return data.appointment;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const deleteAppointment = createAsyncThunk('appointments/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/appointments/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete appointment');
  }
});

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    clearAppointmentsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearAppointmentsError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
