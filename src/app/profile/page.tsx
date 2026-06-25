"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSession } from "@clerk/nextjs";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const { session } = useSession();
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [defaultCountry, setDefaultCountry] = useState<string | undefined>(
    "NG",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Gate: don't let the user fill out the form until the business
  // row + publicMetadata.businessId actually exist. Right after signup,
  // the Clerk webhook chain (create business -> sync metadata) can take
  // up to ~70s in the worst case (clerk-synced's own internal retry
  // loop against abara-api, which can be cold-starting on Render's
  // free tier), so this poll window must comfortably exceed that.
  const [businessReady, setBusinessReady] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      // 40 attempts x 2s = 80s budget — safely exceeds clerk-synced's
      // worst-case ~70s retry+patch chain.
      for (let i = 0; i < 40; i++) {
        try {
          const res = await fetch("/api/profile/status");
          const data = await res.json();
          if (data.ready) {
            if (!cancelled) setBusinessReady(true);
            return;
          }
        } catch {
          // ignore transient errors, keep polling
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!cancelled) setCheckFailed(true);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.country_code) {
          setDefaultCountry(data.country_code);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!adminFirstName.trim() || !adminLastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!phone || !isValidPhoneNumber(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminFirstName: adminFirstName.trim(),
          adminLastName: adminLastName.trim(),
          phone,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update profile.");
      }

      await user?.reload();
      await session?.reload();

      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkFailed) {
    return (
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-semibold mb-4">Almost there</h1>
        <p className="text-sm text-gray-600 mb-4">
          We&apos;re still setting up your account. This is taking longer than
          expected — try refreshing the page in a moment.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded bg-black text-white py-2"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (!businessReady) {
    return (
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-semibold mb-4">
          Setting up your account…
        </h1>
        <p className="text-sm text-gray-500">
          This usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-semibold mb-6">Complete your profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="adminFirstName"
            className="block text-sm font-medium mb-1"
          >
            First name
          </label>
          <input
            id="adminFirstName"
            type="text"
            value={adminFirstName}
            onChange={(e) => setAdminFirstName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="adminLastName"
            className="block text-sm font-medium mb-1"
          >
            Last name
          </label>
          <input
            id="adminLastName"
            type="text"
            value={adminLastName}
            onChange={(e) => setAdminLastName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone number
          </label>
          <PhoneInput
            id="phone"
            international
            defaultCountry={defaultCountry as never}
            value={phone}
            onChange={setPhone}
            className="phone-input-custom w-full rounded border px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            We&apos;ll use this for account contact purposes only — no
            verification code required.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
