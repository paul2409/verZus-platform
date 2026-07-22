import "server-only";

import type { QueryResultRow } from "pg";

import { queryDatabase } from "@/lib/db";

type CurrentCrewRow = QueryResultRow & {
  id: string;
  name: string;
  tag: string;
  role: "owner" | "captain" | "manager" | "member" | "trial";
};

export interface CurrentCrewSummary {
  id: string;
  name: string;
  tag: string;
  roleLabel: string;
}

export async function readCurrentCrewSummary(userId: string): Promise<CurrentCrewSummary | null> {
  const result = await queryDatabase<CurrentCrewRow>(
    `SELECT crews.id, crews.name, crews.tag, members.role
     FROM crew_members AS members
     INNER JOIN crews ON crews.id = members.crew_id
     WHERE members.user_id = $1
       AND members.left_at IS NULL
       AND crews.lifecycle NOT IN ('disbanded', 'archived')
     ORDER BY members.joined_at DESC
     LIMIT 1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    roleLabel: row.role.charAt(0).toUpperCase() + row.role.slice(1),
  };
}
