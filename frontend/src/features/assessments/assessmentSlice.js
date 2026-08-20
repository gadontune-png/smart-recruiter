import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { assessmentService } from "../../services/assessmentService";

export const fetchAssessments = createAsyncThunk(
  "assessments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await assessmentService.listAssessments();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAssessmentById = createAsyncThunk(
  "assessments/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await assessmentService.getAssessment(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAssessment = createAsyncThunk(
  "assessments/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await assessmentService.createAssessment(payload);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const publishAssessment = createAsyncThunk(
  "assessments/publish",
  async (id, { rejectWithValue }) => {
    try {
      return await assessmentService.publishAssessment(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const assessmentSlice = createSlice({
  name: "assessments",
  initialState: {
    items: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearCurrentAssessment(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchAssessmentById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssessmentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchAssessmentById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(publishAssessment.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx].status = action.payload.status;
        if (state.current?.id === action.payload.id) {
          state.current.status = action.payload.status;
        }
      });
  },
});

export const { clearCurrentAssessment } = assessmentSlice.actions;
export default assessmentSlice.reducer;
