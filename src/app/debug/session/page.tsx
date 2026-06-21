import { auth } from "@clerk/nextjs/server";

export default async function DebugSessionPage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <h1 className="text-2xl font-semibold mb-4">Clerk Session Debug</h1>
      <pre className="rounded-lg bg-slate-900 p-4 overflow-x-auto text-sm">
        {JSON.stringify(session, null, 2)}
      </pre>
    </main>
  );
}
