import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { apiSlice } from "./features/api/apiSlice";
import { caseApiSlice } from "./features/api/caseApiSlice";
import { categoryApiSlice } from "./features/api/categoryApiSlice";
import { dashboardApiSlice } from "./features/api/dashboardApiSlice";
import { notificationApiSlice } from "./features/api/notificationApiSlice";
import { resourceApiSlice } from "./features/api/resourceApiSlice";
import authReducer from "./features/auth/authSlice";

// 🧩 1. Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [caseApiSlice.reducerPath]: caseApiSlice.reducer,
  [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
  [resourceApiSlice.reducerPath]: resourceApiSlice.reducer,
  [dashboardApiSlice.reducerPath]: dashboardApiSlice.reducer,
  [notificationApiSlice.reducerPath]: notificationApiSlice.reducer,
});

// 🧩 2. Setup persist config (only persist auth)
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // persist only auth state
};

// 🧩 3. Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }).concat(
      apiSlice.middleware,
      caseApiSlice.middleware,
      categoryApiSlice.middleware,
      resourceApiSlice.middleware,
      dashboardApiSlice.middleware,
      notificationApiSlice.middleware
    ),
  devTools: import.meta.env.VITE_NODE_ENV !== "production",
});

// 5. Create persistor
export const persistor = persistStore(store);
