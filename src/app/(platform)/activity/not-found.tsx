// VERZUS M12.5 ACTIVITY ROUTE NOT FOUND STATE

import Link from "next/link";

export default function ActivityNotFound() {
  return (
    <main data-m12-stage="12.5" style={{ padding: "1rem" }}>
      <p>Activity reference not found</p>
      <h1>This activity destination does not exist</h1>
      <Link href="/activity">Return to activity</Link>
    </main>
  );
}
