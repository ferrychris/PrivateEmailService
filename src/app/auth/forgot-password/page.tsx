import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Reset your password</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {sent === "1" ? (
          <div className="space-y-4">
            <p className="rounded bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
              If that email is allowed, a reset link is on its way. Check your inbox.
            </p>
            <Link
              href="/login"
              className="block text-center text-sm text-neutral-600 hover:text-black"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <ForgotForm />
            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-neutral-500 hover:text-black">
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
