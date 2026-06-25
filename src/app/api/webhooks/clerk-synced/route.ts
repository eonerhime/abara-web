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
  // Retry with backoff to survive Render cold starts, which can take
  // 30-60s on free/starter tier when the service has been idle.
  // Total window: ~70s, well within Vercel's 5-minute function limit.
  let businessId: string | null = null;
  const delays = [
    500, 1000, 2000, 3000, 5000, 8000, 10000, 10000, 10000, 10000,
  ];

  for (let i = 0; i < delays.length; i++) {
    try {
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
        if (data.businessId) {
          businessId = data.businessId;
          break;
        }
        // 200 but no businessId yet — business not created, keep retrying
      }
    } catch {
      // network error during cold start (e.g. connection refused) — keep retrying
    }
    await new Promise((r) => setTimeout(r, delays[i]));
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
