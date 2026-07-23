import { randomUUID } from "node:crypto";

import { runProactiveOperations } from "../src/shared/composition/proactive-operations/server/proactive-operations.service";

async function main() {
  const result = await runProactiveOperations({
    requestId: `proactive-cli-${randomUUID()}`,
    trigger: "cli",
  });

  console.log(
    JSON.stringify(
      {
        status: result.status,
        runId: result.runId,
        candidates: result.candidateCount,
        reminders: result.reminderCount,
        created: result.createdCount,
        updated: result.updatedCount,
        resolved: result.resolvedCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Proactive operations failed.");
  console.error(error);
  process.exitCode = 1;
});
