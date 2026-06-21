import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your business, the smart way
        </p>
      </div>

      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-none p-0 w-full",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            footerAction: "hidden",
            formButtonPrimary:
              "bg-brand-green hover:bg-brand-green-light text-white h-11 text-sm font-medium",
            formFieldInput: "h-11",
            socialButtonsBlockButton: "h-11",
          },
        }}
      />

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
