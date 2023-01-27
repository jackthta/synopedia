import { configureStore } from "@reduxjs/toolkit";

import tvShowsReducer from "../slices/tv-show/tv-show";
import tmdbConfigurationReducer from "../slices/tmdb-configuration";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const store = configureStore({
  reducer: {
    tvShows: tvShowsReducer,
    tmdbConfiguration: tmdbConfigurationReducer,
  },
});

export default store;
