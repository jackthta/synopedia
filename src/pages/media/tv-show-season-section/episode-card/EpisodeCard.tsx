import { useSelector } from "../../../../redux/store/hooks";
import { selectTmdbConfiguration } from "../../../../redux/slices/tmdb-configuration";
import { generateImgSrcsetDimensions } from "../../../../utilities/image";
import { BREAKPOINT } from "../../../../utilities/enum";

import CardImage from "../../../../components/card-image/CardImage";

import type { MediaSpecificInformation } from "../../../../redux/slices/media/types";
import type { Episode } from "../../../../utilities/themoviedb/types";

import CSS from "./EpisodeCard.module.scss";

type Props = {
  episode: Episode;
  show: MediaSpecificInformation;

  loading: "eager" | "lazy";
};

function EpisodeCard({ episode, show, loading }: Props) {
  const { secure_base_url: imgBaseUrl, backdrop_sizes: backdropSizes } =
    useSelector(selectTmdbConfiguration);

  const image = generateImgSrcsetDimensions(
    imgBaseUrl,
    backdropSizes,
    episode.still_path
  );
  const imageSizes = `(min-width: ${BREAKPOINT.TABLET}) 400px, (min-width: ${BREAKPOINT.DESKTOP}) 500px, 350px`;

  const airDate = new Intl.DateTimeFormat("us-en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(episode.air_date));

  return (
    <div
      className={CSS.card}
      tabIndex={0}
      aria-label={`Episode ${episode.episode_number}. ${episode.name}. ${airDate}.`}
    >
      {/* Episode # */}
      <p className={CSS.episodeNumber} aria-hidden="true">
        Episode {episode.episode_number}
      </p>

      {/* Still image */}
      <CardImage
        src={image.defaultSrc}
        srcSet={image.srcset}
        sizes={imageSizes}
        loading={loading}
        alt=""
        width="300"
        height="169"
        interactable={false}
      />

      <div className={CSS.informationContainer} aria-hidden="true">
        {/* Episode title */}
        <h3 className={CSS.title}>{episode.name}</h3>

        {/* Episode overview */}
        <p className={CSS.overview}>{episode.overview}</p>

        <div className={CSS.subinformationContainer}>
          {/* Episode runtime */}
          <p className={CSS.runtime}>{show.run_time} min</p>

          {/* Episode release date */}
          <p className={CSS.releaseDate}>{airDate}</p>
        </div>
      </div>
    </div>
  );
}

export default EpisodeCard;
