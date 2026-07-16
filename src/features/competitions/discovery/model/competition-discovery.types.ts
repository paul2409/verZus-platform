export type CompetitionDiscoveryTab = "all" | "live" | "upcoming" | "entered" | "popular";

export type CompetitionCardState = "live" | "upcoming" | "entered";

export type CompetitionDiscoveryGame =
  "all" | "ea-fc" | "cod-mobile" | "clash-royale" | "league-of-legends";

export type CompetitionDiscoveryTeamSize = "all" | "1V1" | "4V4" | "5V5";

export type CompetitionDiscoveryEntryFee = "all" | "free" | "paid";

export type CompetitionDiscoverySort = "starts-soon" | "popular" | "prize-high" | "availability";

export type CompetitionDiscoveryScenario =
  | "normal"
  | "empty"
  | "stale"
  | "partial_failure"
  | "offline"
  | "maintenance"
  | "unauthorized"
  | "forbidden"
  | "malformed";

export type CompetitionResourceState =
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "error"
  | "offline"
  | "retrying"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "maintenance"
  | "partial_failure";

export type CompetitionDiscoveryFilters = {
  search: string;
  tab: CompetitionDiscoveryTab;
  game: CompetitionDiscoveryGame;
  teamSize: CompetitionDiscoveryTeamSize;
  entryFee: CompetitionDiscoveryEntryFee;
  sort: CompetitionDiscoverySort;
  page: number;
};

export type CompetitionDiscoveryResult = {
  items: CompetitionDiscoveryItem[];
  page: number;
  pageCount: number;
  total: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type CompetitionArtKey =
  "championship" | "ea-fc" | "cod-mobile" | "clash-royale" | "league-of-legends";

export type FeaturedCompetitionViewModel = {
  id: string;
  eyebrow: string;
  name: string;
  seasonLabel: string;
  weekLabel: string;
  gameLabel: string;
  formatLabel: string;
  prizePoolLabel: string;
  rewardNote: string;
  countdownLabel: string;
  statusLabel: string;
  artKey: CompetitionArtKey;
};

export type CompetitionJourneyStep = {
  id: string;
  number: number;
  label: string;
  description: string;
};

export type CompetitionDiscoveryItem = {
  id: string;
  name: string;
  game: string;
  gameFilterValue: Exclude<CompetitionDiscoveryGame, "all">;
  teamSize: Exclude<CompetitionDiscoveryTeamSize, "all">;
  format: string;
  state: CompetitionCardState;
  statusLabel: string;
  capacityLabel: string;
  timingLabel: string;
  prizePoolLabel?: string | undefined;
  entryFeeLabel: string;
  entryFeeType: Exclude<CompetitionDiscoveryEntryFee, "all">;
  popularity: number;
  startsAtOrder: number;
  prizeValue: number;
  remainingCapacity: number;
  searchTerms: string[];
  artKey: CompetitionArtKey;
};

export type CompetitionEntryViewModel = {
  id: string;
  competitionName: string;
  stateLabel: string;
  teamLabel: string;
  statusLabel: string;
};

export type CompetitionGuideLink = {
  id: string;
  label: string;
};

export type CompetitionDiscoveryOption<TValue extends string> = {
  value: TValue;
  label: string;
};

export type CompetitionDiscoveryFilterOptions = {
  tabs: CompetitionDiscoveryOption<CompetitionDiscoveryTab>[];
  games: CompetitionDiscoveryOption<CompetitionDiscoveryGame>[];
  teamSizes: CompetitionDiscoveryOption<CompetitionDiscoveryTeamSize>[];
  entryFees: CompetitionDiscoveryOption<CompetitionDiscoveryEntryFee>[];
  sorts: CompetitionDiscoveryOption<CompetitionDiscoverySort>[];
};

export type CompetitionResourceMeta = {
  requestId: string;
  serverNow: string;
  lastUpdatedAt: string;
  freshness: "fresh" | "stale";
};

export type FeaturedCompetitionResourceData = {
  competition: FeaturedCompetitionViewModel | null;
  meta: CompetitionResourceMeta;
};

export type CompetitionListResourceData = CompetitionDiscoveryResult & {
  meta: CompetitionResourceMeta;
};

export type CompetitionMetadataResourceData = {
  journey: CompetitionJourneyStep[];
  guideLinks: CompetitionGuideLink[];
  filterOptions: CompetitionDiscoveryFilterOptions;
  meta: CompetitionResourceMeta;
};

export type CompetitionEntryResourceData = {
  entry: CompetitionEntryViewModel | null;
  meta: CompetitionResourceMeta;
};

export type CompetitionResource<TData> = {
  state: CompetitionResourceState;
  data: TData | null;
  errorCode: string | null;
  requestId: string | null;
  canRetry: boolean;
};

export type CompetitionDiscoveryMock = {
  featured: FeaturedCompetitionViewModel;
  journey: CompetitionJourneyStep[];
  competitions: CompetitionDiscoveryItem[];
  entry: CompetitionEntryViewModel;
  guideLinks: CompetitionGuideLink[];
};
