import { redirect } from "next/navigation";

import { getServerAuthContext } from "@/features/auth/server";

export default async function HomePage(): Promise<never> {
  const auth = await getServerAuthContext();
  return redirect(auth.destination);
}
