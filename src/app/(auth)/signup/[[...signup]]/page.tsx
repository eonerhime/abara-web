import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create your Abara account
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign up with your email to get started
        </p>
      </div>

      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/login"
        forceRedirectUrl="/profile"
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

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-brand-green font-medium hover:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
