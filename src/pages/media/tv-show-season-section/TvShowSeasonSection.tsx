import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "../../../redux/store/hooks";
import { fetchTvShowSeason } from "../../../redux/slices/media/thunks";
import { selectTvShowSeasons } from "../../../redux/slices/media/selectors";

import EpisodeCard from "./episode-card/EpisodeCard";
import Separator from "../../../components/separator/Separator";

import type { MediaSpecificInformation } from "../../../redux/slices/media/types";

import CSS from "./TvShowSeasonSection.module.scss";

type Props = {
  show: MediaSpecificInformation;
};

function TvShowSeasonSection({ show }: Props) {
  const dispatch = useDispatch();
  const [season, setSeason] = useState<number | string>(1);
  const seasons = useSelector((state) => selectTvShowSeasons(state, show.id));

  // If season 1 isn't cached, fetch it first.
  useEffect(() => {
    if (seasons[1] == null) {
      var fetch = dispatch(
        fetchTvShowSeason({
          tvId: show.id,
          seasonNumber: 1,
        })
      );
    }

    return () => fetch && fetch.abort();
  }, []);

  // Only after season 1 has been fetched, fetch
  // the rest of the seasons (if there are any).
  // This is because it's most important to have
  // season 1 be fetched and returned first (for
  // display – season 1 is the default), so
  // there won't be network contention caused by
  // fetching the remainder seasons in parallel.
  useEffect(() => {
    const fetches: any[] = [];

    if (seasons[1] != null && show.number_of_seasons) {
      for (let season = 2; season <= show.number_of_seasons; season++) {
        fetches.push(
          dispatch(
            fetchTvShowSeason({
              tvId: show.id,
              seasonNumber: season,
            })
          )
        );
      }
    }

    return () => {
      fetches.forEach((fetch) => fetch && fetch.abort());
    };
  }, [seasons[1]]);

  const handleSeasonChange = ({
    target: { value: season },
  }: React.ChangeEvent<HTMLInputElement>) => setSeason(season);

  const SeasonSelectOption = Object.values(seasons).map((season) => (
    <option key={season._id} value={season.season_number}>
      {season.name}
    </option>
  ));

  const Episodes = seasons[season]?.episodes.map((episode, index) => {
    return (
      <EpisodeCard
        key={episode.id}
        episode={episode}
        show={show}
        loading={index > 2 ? "lazy" : "eager"}
      />
    );
  });

  return (
    <>
      <section
        className={CSS.section}
        onChange={handleSeasonChange}
        aria-label="Season"
        data-test="show-season-section"
      >
        {/* Seasons selector */}
        <select className={CSS.seasonSelect} aria-label="Season">
          {SeasonSelectOption}
        </select>

        {/* Episodes */}
        <div className={CSS.episodeList}>{Episodes}</div>
      </section>

      <Separator />
    </>
  );
}

export default TvShowSeasonSection;

// This comment used to be included when manually
// creating the AbortController and passing it in
// explcitly as an argument to the thunk function,
// but found out that the `createAsyncThunk` function
// includes the AbortController within its API:
// NOTE: Every fetch request needs to have its own
// unique instance of an AbortController. If this was
// initialized in the component function scope and that
// instance is passed into different dispatched fetch
// requests, one `abort()` invokation _anywhere_ using
// that instance will cancel _all_ occurring fetch requests where
// that instance was passed through as the AbortController.
