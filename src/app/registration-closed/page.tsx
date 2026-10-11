import type { Metadata } from "next";

import Link from "next/link";

import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Registration closed",
  description: "BobrChat is closed to new registrations. Existing users can still sign in.",
  robots: { index: false, follow: false },
};

export default function RegistrationClosedPage() {
  return (
    <main className={`
      flex min-h-screen flex-col items-center justify-center gap-4 px-6
      text-center
    `}
    >
      <h1 className="text-3xl font-bold">Registration is closed</h1>
      <p className="text-muted-foreground max-w-md">
        BobrChat is no longer accepting new accounts. If you already have an
        account, sign in with the email or sign-in method you used before.
      </p>
      <Button asChild>
        <Link href="/login">Sign in to an existing account</Link>
      </Button>
      <Link href="/" className="text-muted-foreground text-sm underline">Go home</Link>
    </main>
  );
}
