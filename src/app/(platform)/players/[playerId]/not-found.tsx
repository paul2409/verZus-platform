// VERZUS M11.2 PUBLIC PROFILE NOT-FOUND STATE

import Link from "next/link";

export default function PublicPlayerNotFound() {
  return (
    <main data-m11-stage="11.2">
      <div className="vz-route-boundary vz-route-boundary--not-found">
        <h1>Player not found</h1>
        <p>This profile may have been removed, renamed or never existed.</p>
        <Link href="/leaderboards/weekly">Browse weekly players</Link>
      </div>
    </main>
  );
}
