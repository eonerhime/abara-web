import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: { id: string };
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: ClerkUserCreatedEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(payload, headers) as ClerkUserCreatedEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const clerkUserId = event.data.id;

  // abara-api's own webhook handler creates the business row first.
  // Small delay/retry to avoid racing it — 3 attempts, 500ms apart.
  let businessId: string | null = null;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(
      `${process.env.INTERNAL_API_URL}/internal/businesses/by-clerk-id/${clerkUserId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      businessId = data.businessId;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!businessId) {
    return NextResponse.json(
      { error: "Business not found after retries" },
      { status: 404 },
    );
  }

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { businessId, profileComplete: false, phoneNumberId: null },
  });

  return NextResponse.json({ received: true });
}
