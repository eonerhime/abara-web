"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const phoneSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
});

const otpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type EmailForm = z.infer<typeof emailSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"email" | "otp">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneForOtp, setPhoneForOtp] = useState("");

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  async function onEmailSubmit(data: EmailForm) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function onSendOtp(data: PhoneForm) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.phone }),
      });
      if (!res.ok) throw new Error();
      setPhoneForOtp(data.phone);
      setOtpSent(true);
      otpForm.setValue("phone", data.phone);
    } catch {
      setError("Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(data: OtpForm) {
    setLoading(true);
    setError("");
    const result = await signIn("otp", {
      phone: data.phone,
      otp: data.otp,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid or expired OTP");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your business, the smart way
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setTab("email");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            tab === "email"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("otp");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            tab === "otp"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Phone OTP
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Email tab */}
      {tab === "email" && (
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@yourbusiness.com"
              className="h-11"
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p className="text-red-500 text-xs">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
              {...emailForm.register("password")}
            />
            {emailForm.formState.errors.password && (
              <p className="text-red-500 text-xs">
                {emailForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-brand-green hover:bg-brand-green-light text-white font-medium mt-2"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}

      {/* OTP tab */}
      {tab === "otp" && !otpSent && (
        <form
          onSubmit={phoneForm.handleSubmit(onSendOtp)}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              WhatsApp phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+2348012345678"
              className="h-11"
              {...phoneForm.register("phone")}
            />
            {phoneForm.formState.errors.phone && (
              <p className="text-red-500 text-xs">
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-brand-green hover:bg-brand-green-light text-white font-medium"
            disabled={loading}
          >
            {loading ? "Sending…" : "Send OTP"}
          </Button>
        </form>
      )}

      {tab === "otp" && otpSent && (
        <form
          onSubmit={otpForm.handleSubmit(onVerifyOtp)}
          className="space-y-4"
        >
          <div className="mb-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            OTP sent to <strong>{phoneForOtp}</strong>
          </div>

          <div className="space-y-1">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
              6-digit OTP
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="h-11 text-center text-2xl tracking-widest font-mono"
              {...otpForm.register("otp")}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-red-500 text-xs">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-brand-green hover:bg-brand-green-light text-white font-medium"
            disabled={loading}
          >
            {loading ? "Verifying…" : "Verify & Sign in"}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-gray-500 hover:text-brand-green transition-colors"
            onClick={() => setOtpSent(false)}
          >
            ← Use a different number
          </button>
        </form>
      )}

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-brand-green font-semibold hover:underline"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}
