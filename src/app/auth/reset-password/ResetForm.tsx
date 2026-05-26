"use client";

import { useState } from "react";
import { updatePassword } from "./actions";

export function ResetForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        setPending(true);
        const result = await updatePassword(formData);
        setPending(false);
        if (result?.error) setError(result.error);
      }}
      className="space-y-3"
    >
      <input
        type="password"
        name="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="New password (min 8 chars)"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none"
      />
      <input
        type="password"
        name="confirm"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Confirm new password"
        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-neutral-900 text-white text-sm py-2 hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
