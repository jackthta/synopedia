import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

import axios from "../../utilities/axios/axios";
import { KIND } from "../../utilities/enum";

import type { AxiosResponse } from "axios";
import type {
  TvShowFetchResponse,
  TvShowInformation,
  TvShowSpecificInformation,
} from "../../utilities/axios/types";
import type { RootState } from "../store";

type Kind = {
  shows: TvShowInformation[];
  page: number;
  lastFetch: number | null;
};

type TVShowsCache = Record<number, TvShowSpecificInformation>;

export type TvShowsState = {
  trending: Kind;
  popular: Kind;
  topRated: Kind;

  showsCache: TVShowsCache; // *1
};

const initialState: TvShowsState = {
  trending: {
    shows: [],
    page: 1,
    lastFetch: null,
  },
  popular: {
    shows: [],
    page: 1,
    lastFetch: null,
  },
  topRated: {
    shows: [],
    page: 1,
    lastFetch: null,
  },

  showsCache: {},
};

export const tvShowsSlice = createSlice({
  name: "tv-shows",
  initialState,
  reducers: {
    clearShowsCache(state) {
      // Point to new empty object reference;
      // allow old object reference containing
      // possibly outdated show details to be
      // garbage collected.
      state.showsCache = {};
    },
  },
  extraReducers(builder) {
    // Better pattern than having separate a `addCase` for every `KIND`
    // Source: https://github.com/reduxjs/redux-toolkit/issues/429#issuecomment-810031743
    builder.addMatcher(
      isAnyOf(
        fetchTvShows[KIND.TRENDING].fulfilled,
        fetchTvShows[KIND.POPULAR].fulfilled,
        fetchTvShows[KIND.TOP_RATED].fulfilled
      ),
      (state, action) => {
        const {
          payload: { page, results: newShows },
        } = action;

        // `action.type` format: `tv-shows/${KIND}/fulfilled`
        const kind = action.type.split("/")[1];

        if (page === 1) {
          // Initial fetch or refresh

          state[kind as KIND].shows = newShows;
          state[kind as KIND].lastFetch = Date.now();
        } else if (page > 1) {
          // A "new page" fetch

          // Remove any duplicate shows
          // API, on occasion, returns the same show
          // at (n) page's last item and (n + 1) page's
          // first item.
          state[kind as KIND].shows = [
            ...new Map(
              [...state[kind as KIND].shows, ...newShows].map((show) => [
                show.id,
                show,
              ])
            ).values(),
          ];
        }

        state[kind as KIND].page += 1;
      }
    );
  },
});

const createAsyncFetchThunk = (kind: KIND) => {
  let typePrefix = "tv-shows";
  let endpoint: string;

  switch (kind) {
    case KIND.TRENDING:
      typePrefix += `/${KIND.TRENDING}`;

      endpoint = "/trending/tv/day";
      break;
    case KIND.POPULAR:
      typePrefix += `/${KIND.POPULAR}`;

      endpoint = "/tv/popular";
      break;
    case KIND.TOP_RATED:
      typePrefix += `/${KIND.TOP_RATED}`;

      endpoint = "/tv/top_rated";
      break;
  }

  return createAsyncThunk(
    typePrefix,
    async (page: number, controller?: AbortController) => {
      const { data } = await axios.get<
        never,
        AxiosResponse<TvShowFetchResponse>
      >(endpoint, {
        params: {
          page,
        },
        signal: controller?.signal,
      });

      // Format rating to contain only one fractional digit
      // (API returns rating with three fractional digits)
      data.results = data.results.map((show) => ({
        ...show,
        vote_average: +show.vote_average.toFixed(1),
      }));

      // Data returned from these endpoints will not contain
      // a `media_type: "tv"` in the results. Manually set.
      if (kind === KIND.POPULAR || kind === KIND.TOP_RATED) {
        data.results = data.results.map((show) => ({
          ...show,
          media_type: "tv",
        }));
      }

      return data;
    }
  );
};

export const { clearShowsCache } = tvShowsSlice.actions;

export const fetchTvShows: Record<KIND, any> = {
  [KIND.TRENDING]: createAsyncFetchThunk(KIND.TRENDING),
  [KIND.POPULAR]: createAsyncFetchThunk(KIND.POPULAR),
  [KIND.TOP_RATED]: createAsyncFetchThunk(KIND.TOP_RATED),
};

// TODO: replace KIND type with string? or figure out a way to extract
// all values of the KIND enum into a type to use (to stop needing to type cast `KIND` everywhere)
export const selectShowsByKind = (state: RootState, kind: KIND) =>
  state.tvShows[kind].shows;

export const selectPageByKind = (state: RootState, kind: KIND) =>
  state.tvShows[kind].page;

export default tvShowsSlice.reducer;

/**
 *
 * *1 — Optimization
 *      - Refresh TV Shows `shows` data every hour elapsed from:
 *          1. Initial page fetch timestamp
 *          2. Subsequent "refresh" fetch timestamps
 *      - `lastFetch` is set to each respective `Kind`'s
 *         state on _only_ (TV Shows or `Kind` TV Shows) pages mount.
 *      - "Refresh" means to:
 *          1. Fetch page 1 from `Kind` endpoint and replace that respective
 *             `Kind`'s `shows` and `page` properties (i.e. akin to an initial fetch).
 *          2. Clear `showsCache`.
 *
 */
