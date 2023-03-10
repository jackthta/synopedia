import { useParams } from "react-router";

import { useSelector } from "../../redux/store/hooks";
import { useRefreshTvShows } from "../../hooks/media";
import { fetchMediaByKindAndType } from "../../redux/slices/media/thunks";
import {
  selectShowsByKind,
  selectPageByKind,
  selectTotalPagesByKind,
} from "../../redux/slices/media/selectors";
import { KIND } from "../../utilities/enum";

import BaseLayout from "../../layouts/base-layout/BaseLayout";
import ShowResults from "../../components/show-results/ShowResults";

import type { MediaType } from "../../redux/slices/media/types";

type Props = {
  mediaType: MediaType;
};

function MediaKind({ mediaType }: Props) {
  let { kind: _kind } = useParams();
  const kind = _kind! as KIND;

  const shows = useSelector((state) =>
    selectShowsByKind(state, mediaType, kind)
  );
  const page = useSelector((state) => selectPageByKind(state, mediaType, kind));
  const totalPages = useSelector((state) =>
    selectTotalPagesByKind(state, mediaType, kind)
  );
  const action = fetchMediaByKindAndType[kind](mediaType)(page);

  useRefreshTvShows(mediaType, kind);

  return (
    <BaseLayout>
      <ShowResults
        type="media"
        shows={shows}
        page={page}
        totalPages={totalPages}
        action={action}
        kind={kind}
        mediaType={mediaType}
      />
    </BaseLayout>
  );
}

export default MediaKind;
