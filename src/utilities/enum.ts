export enum KIND {
  TRENDING = "trending",
  POPULAR = "popular",
  TOP_RATED = "topRated",
}

export enum BREAKPOINT {
  TABLET = "700px",
  DESKTOP = "1024px",
}

export enum ROUTES {
  HOME = "/",

  TV_SHOW = "/tv-show/:id",
  TV_SHOWS = "/tv-shows",
  TV_SHOWS_KIND = "/tv-shows/:kind",

  MOVIE = "/movie/:id",
  MOVIES = "/movies",
  MOVIES_KIND = "/movies/:kind",

  SEARCH_RESULTS = "/search?",
}
