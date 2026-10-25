import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/secure-session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }
}
