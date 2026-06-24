import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Gets the current Clerk user's businessId from publicMetadata.
 * Redirects to sign-in if unauthenticated, or to /onboarding if
 * the business hasn't been created/linked yet.
 */
export async function requireBusinessId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const businessId = user?.publicMetadata?.businessId as string | undefined;

  if (!businessId) redirect("/onboarding");

  return businessId;
}
