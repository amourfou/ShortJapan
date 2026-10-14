import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/server/pin";
import { assertSameOrigin, clientIp, fail, readJson } from "@/lib/server/respond";
import { clearSessionCookie, currentUser, setSessionCookie } from "@/lib/server/session";
import { SIGNUP_ENABLED } from "@/lib/server/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ user: null, signupEnabled: SIGNUP_ENABLED }, { status: 401 });
    return NextResponse.json({ user, signupEnabled: SIGNUP_ENABLED });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson<{ name?: unknown; pin?: unknown }>(request);
    const { user, pinHash } = await verifyLogin(body.name, body.pin, clientIp(request));
    const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name } });
    setSessionCookie(response, user.id, pinHash);
    return response;
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    return fail(error);
  }
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
