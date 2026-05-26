"use client";

import { useState } from "react";
import { requestPasswordReset } from "./actions";

export function ForgotForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        setPending(true);
        const result = await requestPasswordReset(formData);
        setPending(false);
        if (result?.error) setError(result.error);
      }}
      className="space-y-3"
    >
      <input
        type="email"
        name="email"
        required
        autoComplete="username"
        placeholder="info@raytimedigital.com"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-neutral-900 text-white text-sm py-2 hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
