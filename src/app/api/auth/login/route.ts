import { createHash, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/secure-session";
const scrypt = promisify(scryptCallback);
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
function passwordMatches(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, expected] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !expected || password.length > 256) return Promise.resolve(false);
  return scrypt(password, salt, 64).then((actual) => {
    const a = Buffer.from(actual as Buffer); const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^\+?[1-9]\d{7,14}$/.test(identifier) || password.length < 1 || password.length > 256) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }
    const identifierHash = hash(identifier);
    const counts = await prisma.$queryRaw<Array<{count:bigint}>>`
      SELECT count(*) FROM login_attempts WHERE identifier_hash=${identifierHash} AND attempted_at > now() - interval '15 minutes' AND succeeded=false`;
    if (Number(counts[0]?.count ?? 0) >= 8) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    const users = await prisma.$queryRaw<Array<{id:string;passwordHash:string|null}>>`
      SELECT id, password_hash AS "passwordHash" FROM users
      WHERE phone_e164=${identifier} AND is_active=true LIMIT 1`;
    const valid = !!users[0]?.passwordHash && await passwordMatches(password, users[0].passwordHash);
    await prisma.$executeRaw`INSERT INTO login_attempts(identifier_hash,succeeded) VALUES (${identifierHash},${valid})`;
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    await createSession(users[0].id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
  }
}
