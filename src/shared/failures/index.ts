// VERZUS M4 STEP 4.10

export {
  appFailureCodeSchema,
  appFailureCodeValues,
  appFailureSchema,
  appFailureSourceSchema,
} from "./app-failure.schema";
export type { AppFailure, AppFailureCode, AppFailureSource } from "./app-failure.schema";

export {
  createAppFailure,
  createMaintenanceFailure,
  createOfflineFailure,
} from "./app-failure.factory";
export type { CreateAppFailureInput } from "./app-failure.factory";

export { adaptHttpFailure, parseRetryAfterSeconds } from "./http-failure.adapter";
export type { AdaptHttpFailureInput } from "./http-failure.adapter";

export { mockFailureScenarioValues, resolveMockFailureScenario } from "./mock-failure-scenario";
export type { MockFailureScenario, ResolveMockFailureScenarioInput } from "./mock-failure-scenario";
