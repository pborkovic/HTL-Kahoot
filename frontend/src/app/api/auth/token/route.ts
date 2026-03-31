import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { token, roles }: { token: string; roles: string[] } =
    await request.json();

  const response = NextResponse.json({ ok: true });

  response.cookies.set("auth_token", token, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  response.cookies.set("user_roles", JSON.stringify(roles), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("auth_token", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set("user_roles", "", { ...COOKIE_OPTIONS, maxAge: 0 });

  return response;
}
