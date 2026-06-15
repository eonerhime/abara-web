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
import { Alert } from "@/components/ui/alert";

const signupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().min(2, "Your name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupForm) {
    setLoading(true);
    setError("");

    try {
      // 1. Create business via proxy → abara-api
      const res = await fetch("/api/proxy/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.businessName,
          ownerName: data.ownerName,
          email: data.email,
          password: data.password,
          personalPhone: data.phone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Signup failed");
      }

      // 2. Auto sign in
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) throw new Error("Auto sign-in failed");

      // 3. Redirect to onboarding
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Create your Abara account
      </h2>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 text-red-800 text-sm">
          {error}
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            placeholder="Lagos Pharmacy"
            className="mt-1"
            {...form.register("businessName")}
          />
          {form.formState.errors.businessName && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.businessName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="ownerName">Your name</Label>
          <Input
            id="ownerName"
            placeholder="Emeka Obi"
            className="mt-1"
            {...form.register("ownerName")}
          />
          {form.formState.errors.ownerName && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.ownerName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@yourbusiness.com"
            className="mt-1"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            className="mt-1"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">WhatsApp phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+2348012345678"
            className="mt-1"
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full text-white bg-brand-green hover:bg-brand-green-light mt-2"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-green font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
