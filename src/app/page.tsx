"use client";

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-10 space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Abara
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Business management and inventory for African SMEs
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Sign in or sign up to manage inventory, orders, and finances from a
            unified dashboard.
          </p>
        </div>

        <Show when="signed-out">
          <div className="flex flex-col gap-4 sm:flex-row">
            <SignInButton mode="redirect">
              <button className="rounded-full bg-white px-5 py-3 text-slate-950 shadow-sm transition hover:bg-slate-100">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="rounded-full border border-slate-600 bg-transparent px-5 py-3 text-white transition hover:bg-white/5">
                Sign up
              </button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-400">
                Signed in as a Clerk user.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <UserButton />
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-600 px-5 py-3 text-sm text-white transition hover:bg-white/5"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </Show>
      </div>
    </main>
  );
}
