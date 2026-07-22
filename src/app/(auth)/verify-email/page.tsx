import { EmailVerificationInteractiveScreen } from "@/features/auth";
import { requireServerAuthStates } from "@/features/auth/server";

export default async function VerifyEmailPage() {
  const session = await requireServerAuthStates(["email_unverified"]);
  const email = session.user?.email;
  if (!email) return null;
  return <EmailVerificationInteractiveScreen email={email} />;
}
