// VERZUS M8.4 INDEPENDENT MODE READ MODELS

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import type {
  LeaderboardFoundationBoard,
  LeaderboardMode,
} from "../../foundation/model/leaderboard-foundation.types";
import { getLeaderboardModeComposition } from "../model/leaderboard-mode.registry";
import type { LeaderboardModeComposition } from "../model/leaderboard-mode.types";

export type LeaderboardModeReadModel = {
  mode: LeaderboardMode;
  board: LeaderboardFoundationBoard;
  composition: LeaderboardModeComposition;
};

function assertModeOwnership(readModel: LeaderboardModeReadModel): LeaderboardModeReadModel {
  const invalid = [...readModel.board.rows, readModel.board.currentEntry].find(
    (row) => row.entityType !== readModel.composition.entityType,
  );
  if (invalid) {
    throw new Error(
      `Leaderboard ${readModel.mode} read model expected ${readModel.composition.entityType} entries but received ${invalid.entityType}.`,
    );
  }
  return readModel;
}

function createWeeklyPlayerReadModel(): LeaderboardModeReadModel {
  return assertModeOwnership({
    mode: "weekly",
    board: leaderboardFoundationBoards.weekly,
    composition: getLeaderboardModeComposition("weekly"),
  });
}

function createWeeklyPoolReadModel(): LeaderboardModeReadModel {
  return assertModeOwnership({
    mode: "pools",
    board: leaderboardFoundationBoards.pools,
    composition: getLeaderboardModeComposition("pools"),
  });
}

function createGameLaneReadModel(): LeaderboardModeReadModel {
  return assertModeOwnership({
    mode: "game",
    board: leaderboardFoundationBoards.game,
    composition: getLeaderboardModeComposition("game"),
  });
}

function createCrewChampionshipReadModel(): LeaderboardModeReadModel {
  return assertModeOwnership({
    mode: "crew",
    board: leaderboardFoundationBoards.crew,
    composition: getLeaderboardModeComposition("crew"),
  });
}

function createCombineReadModel(): LeaderboardModeReadModel {
  return assertModeOwnership({
    mode: "combine",
    board: leaderboardFoundationBoards.combine,
    composition: getLeaderboardModeComposition("combine"),
  });
}

const modeFactories: Record<LeaderboardMode, () => LeaderboardModeReadModel> = {
  weekly: createWeeklyPlayerReadModel,
  pools: createWeeklyPoolReadModel,
  game: createGameLaneReadModel,
  crew: createCrewChampionshipReadModel,
  combine: createCombineReadModel,
};

export function getLeaderboardModeReadModel(mode: LeaderboardMode): LeaderboardModeReadModel {
  return modeFactories[mode]();
}
