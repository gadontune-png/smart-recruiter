import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import uiReducer from "../features/ui/uiSlice";
import assessmentsReducer from "../features/assessments/assessmentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    assessments: assessmentsReducer,
  },
});
