import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green via-[#0d6b35] to-brand-slate flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 md:gap-16">
        {/* Left col — Brand */}
        <div className="flex-1 text-center md:text-left py-6 md:py-0">
          <Image
            src="/abara-wordmark-plain.png"
            alt="Abara Wordmark"
            width={560}
            height={160}
            quality={75}
            className="h-auto w-auto shrink-0 "
          />

          <p className="text-green-100 mt-3 text-base md:text-lg font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
            The smart business companion for African SMEs
          </p>
          <div className="hidden md:block mt-10 space-y-3 text-green-200 text-sm">
            <p>✅ Record sales and expenses via WhatsApp</p>
            <p>✅ Track stock levels across your business</p>
            <p>✅ Get low-stock and expiry alerts automatically</p>
            <p>✅ View reports and export to CSV anytime</p>
          </div>
          <p className="hidden md:block text-green-300 text-xs mt-10">
            Powered by AfricaOS · Secure · Built for Africa
          </p>
        </div>

        {/* Right col — Form card */}
        <div className="w-full md:w-[420px] flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-2xl p-8">{children}</div>
          <p className="md:hidden text-center text-green-200 text-xs mt-6">
            Powered by AfricaOS · Secure · Built for Africa
          </p>
        </div>
      </div>
    </div>
  );
}
