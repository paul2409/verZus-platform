// VERZUS M3 STEP 3.7

export const dynamic = "force-dynamic";

export default function ShellAuditRouteCrashPage(): never {
  throw Object.assign(new Error("Intentional M3 route-level audit failure"), {
    digest: "M3-SHELL-ROUTE-AUDIT",
  });
}
