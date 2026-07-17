// VERZUS M7.7 TERMINAL OPERATIONS DOMAIN SCHEMAS

import { z } from "zod";

import { matchOperationStates } from "./match-operations.types";
import {
  matchTerminalActions,
  matchTerminalRoles,
  terminalMatchStates,
} from "./match-terminal-operations.types";

export const matchTerminalActionSchema = z.enum(matchTerminalActions);
export const matchTerminalRoleSchema = z.enum(matchTerminalRoles);
export const terminalMatchStateSchema = z.enum(terminalMatchStates);

export const matchTerminalCommandSchema = z.object({
  expectedState: z.enum(matchOperationStates),
  expectedVersion: z.number().int().nonnegative(),
  action: matchTerminalActionSchema,
  reason: z.string().trim().min(8).max(500),
});
