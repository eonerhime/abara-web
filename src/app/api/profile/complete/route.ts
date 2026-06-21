import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = sessionClaims?.publicMetadata?.businessId;
  if (!businessId) {
    return NextResponse.json(
      { error: "No business associated with this user yet." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { adminFirstName, adminLastName, phone } = body;

  if (!adminFirstName || !adminLastName || !phone) {
    return NextResponse.json(
      { error: "adminFirstName, adminLastName, and phone are required." },
      { status: 400 },
    );
  }

  // 1. Sync to abara-api businesses record
  const apiRes = await fetch(
    `${process.env.INTERNAL_API_URL}/v1/internal/businesses/${businessId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
      },
      body: JSON.stringify({ adminFirstName, adminLastName, phone }),
    },
  );

  if (!apiRes.ok) {
    const errBody = await apiRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errBody.error || "Failed to update business record." },
      { status: apiRes.status },
    );
  }

  // 2. Sync to Clerk user + mark profileComplete in publicMetadata
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    firstName: adminFirstName,
    lastName: adminLastName,
  });

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...(sessionClaims?.publicMetadata ?? {}),
      profileComplete: true,
    },
  });

  return NextResponse.json({ success: true });
}
