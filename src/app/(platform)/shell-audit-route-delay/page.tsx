// VERZUS M3 STEP 3.7

import { PageContainer, PageHeader } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export default async function ShellAuditRouteDelayPage() {
  await wait(1200);

  return (
    <PageContainer width="content">
      <PageHeader
        description="The route completed after an intentional server delay while the shell remained available."
        eyebrow="M3 failure injection"
        title="Delayed route loaded"
      />
    </PageContainer>
  );
}
