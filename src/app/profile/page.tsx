"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function ProfilePage() {
  const router = useRouter();
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [defaultCountry, setDefaultCountry] = useState<string | undefined>(
    "NG",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // IP-based geolocation to default the country code.
  // Falls back to NG silently if the lookup fails or is rate-limited.
  useEffect(() => {
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.country_code) {
          setDefaultCountry(data.country_code);
        }
      })
      .catch(() => {
        // Silent fallback — NG stays as default
      });
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
          phone, // already in E.164 format, e.g. +2349060005429
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update profile.");
      }

      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
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
