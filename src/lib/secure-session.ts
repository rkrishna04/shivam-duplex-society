import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "__Host-shivam_session";
const SESSION_HOURS = 12;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export type SessionUser = { id: string; fullName: string; role: string; societyId: string; houseId: string | null; committeeTermId: string | null; assignedLine: string | null };

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await prisma.$executeRaw`INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (${userId}::uuid, ${digest(token)}, ${expiresAt})`;
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token || token.length < 40 || token.length > 100) return null;
  const tokenHash = digest(token);
  const rows = await prisma.$queryRaw<SessionUser[]> `
    SELECT u.id, u.full_name AS "fullName",
      CASE WHEN ct.position_title IS NOT NULL THEN ct.position_title
           WHEN hm.role = 'OWNER' THEN 'HOUSE_OWNER'
           WHEN hm.role = 'TENANT' THEN 'TENANT'
           ELSE 'RESIDENT' END AS role,
      COALESCE(ct.society_id, h.society_id)::text AS "societyId", h.id::text AS "houseId",
      ct.id::text AS "committeeTermId", ct.assigned_line AS "assignedLine"
    FROM user_sessions s
    JOIN users u ON u.id = s.user_id AND u.is_active = true
    LEFT JOIN house_memberships hm ON hm.user_id = u.id AND hm.valid_until IS NULL
    LEFT JOIN houses h ON h.id = hm.house_id
    LEFT JOIN LATERAL (
      SELECT c.* FROM committee_terms c
      WHERE c.user_id = u.id AND c.is_current = true
      ORDER BY c.row_tier, c.display_order LIMIT 1
    ) ct ON true
    WHERE s.token_hash = ${tokenHash} AND s.revoked_at IS NULL AND s.expires_at > now()
    LIMIT 1
  `;
  if (!rows.length) return null;
  await prisma.$executeRaw`UPDATE user_sessions SET last_seen_at = now() WHERE token_hash = ${tokenHash}`;
  return rows[0];
}

export async function revokeSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await prisma.$executeRaw`UPDATE user_sessions SET revoked_at = now() WHERE token_hash = ${digest(token)} AND revoked_at IS NULL`;
  jar.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(0) });
}

export function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a); const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
