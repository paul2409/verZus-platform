// VERZUS M7.1 MATCH OPERATIONS ROUTE

import Link from "next/link";

export default function MatchOperationsNotFound() {
  return (
    <main>
      <h1>Match not found</h1>
      <p>This match may have been archived or the link may be invalid.</p>
      <Link href="/matches">Return to matches</Link>
    </main>
  );
}
