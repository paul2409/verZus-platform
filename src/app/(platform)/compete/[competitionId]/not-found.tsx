import Link from "next/link";

export default function CompetitionDetailNotFound() {
  return (
    <main>
      <h1>Competition not found</h1>
      <p>This competition may be archived or unavailable.</p>
      <Link href="/compete">Back to Compete</Link>
    </main>
  );
}
