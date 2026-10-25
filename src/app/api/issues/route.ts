import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/secure-session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    const rows = user.committeeTermId
      ? await prisma.$queryRaw`
          SELECT t.id, h.house_number AS "houseNumber", t.category_line AS category,
            t.description, t.status, t.created_at AS "createdAt", t.assigned_committee_term_id AS "assignedCommitteeTermId"
          FROM helpdesk_tickets t JOIN houses h ON h.id=t.house_id
          WHERE t.society_id=${user.societyId}::uuid AND t.assigned_committee_term_id=${BigInt(user.committeeTermId)}
          ORDER BY t.created_at DESC LIMIT 100`
      : user.houseId
      ? await prisma.$queryRaw`
          SELECT t.id, h.house_number AS "houseNumber", t.category_line AS category,
            t.description, t.status, t.created_at AS "createdAt"
          FROM helpdesk_tickets t JOIN houses h ON h.id=t.house_id
          WHERE t.house_id=${BigInt(user.houseId)} AND t.raised_by=${user.id}::uuid
          ORDER BY t.created_at DESC LIMIT 100`
      : [];
    return NextResponse.json({ issues: rows });
  } catch {
    return NextResponse.json({ error: "Issue service unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!user.houseId || !user.societyId) return NextResponse.json({ error: "An active house membership is required" }, { status: 403 });
    const houseId = BigInt(user.houseId);
    const body = await req.json();
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const key = req.headers.get("idempotency-key") || (typeof body.idempotencyKey === "string" ? body.idempotencyKey : "");
    if (!category || category.length > 120 || description.length < 5 || description.length > 5000 || !/^[a-zA-Z0-9._:-]{8,128}$/.test(key)) {
      return NextResponse.json({ error: "Valid category, description (5–5000 chars), and Idempotency-Key are required" }, { status: 400 });
    }
    const id = randomUUID();
    const created = await prisma.$transaction(async tx => {
      const existing = await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM helpdesk_tickets WHERE raised_by=${user.id}::uuid AND idempotency_key=${key} LIMIT 1`;
      if (existing.length) return { id: existing[0].id, duplicate: true };
      const house = await tx.$queryRaw<Array<{societyId:string;committeeTermId:bigint|null}>>`
        SELECT h.society_id AS "societyId", (
          SELECT a.committee_term_id FROM house_area_assignments a
          JOIN committee_terms c ON c.id=a.committee_term_id AND c.is_current=true
          WHERE a.house_id=h.id AND a.society_id=h.society_id
            AND a.valid_from<=CURRENT_DATE AND (a.valid_until IS NULL OR a.valid_until>=CURRENT_DATE)
          ORDER BY a.valid_from DESC LIMIT 1
        ) AS "committeeTermId"
        FROM houses h WHERE h.id=${houseId}`;
      if (!house.length || house[0].societyId !== user.societyId) throw new Error("HOUSE_SCOPE_INVALID");
      await tx.$executeRaw`
        INSERT INTO helpdesk_tickets (id, society_id, house_id, raised_by, assigned_committee_term_id, category_line, description, idempotency_key)
        VALUES (${id}::uuid, ${user.societyId}::uuid, ${houseId}, ${user.id}::uuid, ${house[0].committeeTermId}, ${category}, ${description}, ${key})`;
      await tx.$executeRaw`
        INSERT INTO helpdesk_ticket_events (ticket_id, actor_user_id, to_status, note, escalation_level)
        VALUES (${id}::uuid, ${user.id}::uuid, 'OPEN', 'Issue created', 1)`;
      return { id, duplicate: false };
    });
    return NextResponse.json(created, { status: created.duplicate ? 200 : 201 });
  } catch (e) {
    const invalid = e instanceof Error && e.message === "HOUSE_SCOPE_INVALID";
    return NextResponse.json({ error: invalid ? "House membership is invalid" : "Issue could not be saved" }, { status: invalid ? 403 : 503 });
  }
}
