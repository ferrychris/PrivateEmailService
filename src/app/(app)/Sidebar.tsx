"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

type Props = { unreadCount: number };

export function Sidebar({ unreadCount }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/email/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkClass = (href: string) =>
    `flex items-center justify-between rounded px-3 py-2 text-sm ${
      isActive(href)
        ? "bg-neutral-200 text-neutral-900 font-medium"
        : "text-neutral-700 hover:bg-neutral-100"
    }`;

  return (
    <aside className="w-60 shrink-0 border-r border-neutral-200 bg-neutral-50 flex flex-col">
      <div className="px-4 py-4" suppressHydrationWarning>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Raymail
        </Link>
      </div>

      <div className="px-3 pb-3" suppressHydrationWarning>
        <Link
          href="/compose"
          className={`flex items-center justify-center w-full rounded-md px-3 py-2 text-sm font-medium ${
            pathname === "/compose"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          }`}
        >
          Compose
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        <Link href="/" className={linkClass("/")}>
          <span>Inbox</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-neutral-900 text-white text-xs px-2 py-0.5 min-w-[1.25rem] text-center">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/sent" className={linkClass("/sent")}>
          <span>Sent</span>
        </Link>
      </nav>

      <div className="mt-auto px-3 py-3 border-t border-neutral-200" suppressHydrationWarning>
        <form action={signOut}>
          <button className="w-full text-left rounded px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
