import { ResetPasswordInteractiveScreen } from "@/features/auth";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return <ResetPasswordInteractiveScreen resetToken={token} />;
}
