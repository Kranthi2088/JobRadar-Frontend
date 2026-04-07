import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@jobradar/db";

const SALT_ROUNDS = 12;
const MIN_PASSWORD = 8;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : email.split("@")[0] || "User";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters.` },
      { status: 400 }
    );
  }

  if (password.length > 128) {
    return NextResponse.json({ error: "Password is too long." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (existing) {
    if (existing.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email already exists. Sign in instead." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error:
          "This email is already registered with Google or GitHub. Sign in with that provider, or contact support to add a password.",
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerified: null,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database error";
    console.error("[register]", e);
    if (message.includes("Unique constraint") || message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Could not create account. Check DATABASE_URL and that the database is migrated." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
