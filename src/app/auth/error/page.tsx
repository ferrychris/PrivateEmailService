import Link from "next/link";

const reasons: Record<string, string> = {
  not_allowed: "That email is not authorized to sign in to Raymail.",
  missing_code: "The sign-in link was incomplete.",
  exchange_failed: "The sign-in link has expired or was already used.",
};

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message = (reason && reasons[reason]) ?? "Sign-in failed.";

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-2">Can't sign in</h1>
        <p className="text-sm text-neutral-600 mb-6">{message}</p>
        <Link
          href="/login"
          className="inline-block rounded bg-neutral-900 text-white text-sm px-4 py-2 hover:bg-neutral-800"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
