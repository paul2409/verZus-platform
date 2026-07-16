import Link from "next/link";

import { SystemStateScreen } from "@/components/layout/system-state";

export default function NotFound() {
  return (
    <SystemStateScreen
      action={<Link href="/play">Return to Play</Link>}
      description="The requested VERZUS route does not exist or is no longer available."
      eyebrow="ROUTE NOT FOUND"
      title="NO COMPETITIVE RECORD HERE"
      tone="not-found"
    />
  );
}
