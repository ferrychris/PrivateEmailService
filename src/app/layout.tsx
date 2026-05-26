import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raymail",
  description: "Personal email service.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
