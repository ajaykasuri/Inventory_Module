import { configureStore } from "@reduxjs/toolkit";
import { setAuthLostHandler } from "../api/http";
import authReducer, { sessionLost } from "./authSlice";

export const store = configureStore({ reducer: { auth: authReducer } });

// If a refresh fails anywhere, the API layer tells the store to log the user out.
setAuthLostHandler(() => store.dispatch(sessionLost()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
