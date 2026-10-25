import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/secure-session";
export const runtime = "nodejs";
export async function POST() {
  await revokeSession();
  return NextResponse.json({ ok: true });
}
