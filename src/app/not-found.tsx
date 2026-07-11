import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The requested VERZUS route does not exist.</p>
      <Link href="/">Return to foundation status</Link>
    </main>
  );
}
