import { handleAuth } from "@workos-inc/authkit-nextjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "~/lib/db";
import { users } from "~/lib/db/schema";
import { serverEnv } from "~/lib/env";

class RegistrationClosedError extends Error {}

export const GET = handleAuth({
  returnPathname: "/",
  onSuccess: async ({ user }) => {
    // Check if already linked by workosId
    const [byWorkosId] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.workosId, user.id))
      .limit(1);

    if (byWorkosId) {
      await db
        .update(users)
        .set({
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
          image: user.profilePictureUrl ?? null,
        })
        .where(eq(users.id, byWorkosId.id));
      return;
    }

    // Check if a pre-existing user has the same email
    const [byEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (byEmail) {
      // Link existing user to their WorkOS identity
      await db
        .update(users)
        .set({
          workosId: user.id,
          image: user.profilePictureUrl ?? null,
        })
        .where(eq(users.id, byEmail.id));
      return;
    }

    throw new RegistrationClosedError("Registration is closed.");
  },
  onError: async ({ error, request }) => {
    // AuthKit saves its cookie before onSuccess. Expire it on rejection or
    // callback failure so an unlinked identity cannot retain an app session.
    const cookieStore = await cookies();
    cookieStore.set(serverEnv.WORKOS_COOKIE_NAME || "wos-session", "", {
      path: "/",
      domain: serverEnv.WORKOS_COOKIE_DOMAIN || "",
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      maxAge: 0,
    });

    if (error instanceof RegistrationClosedError) {
      return NextResponse.redirect(new URL("/registration-closed", request.url));
    }

    return NextResponse.json({
      error: {
        message: "Couldn't sign in",
        description: "Please try signing in again. If the problem persists, contact support.",
      },
    }, { status: 500 });
  },
});
