"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, sendMagicLink } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [pending, setPending] = useState<"password" | "magic" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (
    mode: "password" | "magic",
    formData: FormData,
  ) => {
    setError(null);
    setPending(mode);
    const action = mode === "password" ? signIn : sendMagicLink;
    const result = await action(formData);
    setPending(null);
    if (result?.error) setError(result.error);
  };

  return (
    <form
      action={(formData) => runAction("password", formData)}
      className="space-y-3"
    >
      <input type="hidden" name="next" value={next ?? "/"} />
      <input
        type="email"
        name="email"
        required
        autoComplete="username"
        placeholder="info@raytimedigital.com"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none"
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder="Password"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none"
      />
      <button
        type="submit"
        disabled={pending !== null}
        className="w-full rounded bg-neutral-900 text-white text-sm py-2 hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending === "password" ? "Signing in…" : "Sign in"}
      </button>

      <button
        type="submit"
        formNoValidate
        formAction={(formData) => runAction("magic", formData)}
        disabled={pending !== null}
        className="w-full rounded border border-neutral-300 bg-white text-neutral-700 text-sm py-2 hover:bg-neutral-50 disabled:opacity-50"
      >
        {pending === "magic" ? "Sending link…" : "Email me a sign-in link instead"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="text-center pt-1">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-neutral-500 hover:text-black"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
