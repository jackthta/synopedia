import { useEffect } from "react";

import { fetchTvShowSimilarShows } from "../../../redux/slices/tv-show/tv-show";
import { selectTvShowSimilarShows } from "../../../redux/slices/tv-show/selectors";
import { useDispatch, useSelector } from "../../../redux/store/hooks";

import MediaCard from "../../../components/media-card/MediaCard";

import type {
  ContentRating,
  Images,
  Seasons,
  SupplementalVideos,
  TvShowSpecificInformation,
} from "../../../utilities/axios/types";

import CSS from "./TvShowSimilarShows.module.scss";

type Props = {
  show: TvShowSpecificInformation &
    Images &
    ContentRating &
    Seasons &
    SupplementalVideos;
};

function TvShowSimilarShows({ show }: Props) {
  const dispatch = useDispatch();
  const similarShows = useSelector((state) =>
    selectTvShowSimilarShows(state, show.id)
  );

  // Fetch similar shows if it hasn't
  // been fetched and cached.
  useEffect(() => {
    if (similarShows == null) {
      var fetch = dispatch(fetchTvShowSimilarShows(show.id));
    }

    return () => fetch.abort();
  }, []);

  if (!similarShows) return null;

  // TODO: figure out why movie "similar shows" are being returned
  const SimilarShows = similarShows
    .slice(0, 10)
    .map((show, index) => (
      <MediaCard
        key={show.id}
        show={show}
        loading={index > 2 ? "lazy" : "eager"}
      />
    ));

  return (
    <section className={CSS.section}>
      <h4 className={CSS.heading}>Similar Shows</h4>
      <div className={CSS.list}>{SimilarShows}</div>
    </section>
  );
}

export default TvShowSimilarShows;