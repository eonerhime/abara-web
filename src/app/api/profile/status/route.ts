// src/app/api/profile/status/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const liveUser = await client.users.getUser(userId);
  const businessId = liveUser.publicMetadata?.businessId as string | undefined;

  return NextResponse.json({ ready: Boolean(businessId) });
}
