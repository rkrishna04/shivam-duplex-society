import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/secure-session";
export const runtime = "nodejs";
const statusValues = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
type Status = typeof statusValues[number];
const leadership = new Set(["Pramukh", "Mantri", "Khanjanji", "Upmantri", "Area Committee Member"]);
export async function PATCH(req: NextRequest, context: { params: Promise<{id:string}> }) {
  try {
    const origin = req.headers.get("origin");
    if (!origin || new URL(origin).origin !== new URL(req.url).origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!user.committeeTermId || !leadership.has(user.role)) return NextResponse.json({ error: "Committee permission required" }, { status: 403 });
    const { id } = await context.params;
    const body = await req.json();
    const toStatus = body.status as Status;
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const escalate = body.escalate === true;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !statusValues.includes(toStatus) || note.length < 1 || note.length > 2000) {
      return NextResponse.json({ error: "Valid status and note are required" }, { status: 400 });
    }
    const changed = await prisma.$transaction(async tx => {
      const tickets = await tx.$queryRaw<Array<{id:string;houseId:bigint;societyId:string;status:Status;assignedId:bigint|null}>>`
        SELECT id, house_id AS "houseId", society_id AS "societyId", status, assigned_committee_term_id AS "assignedId"
        FROM helpdesk_tickets WHERE id=${id}::uuid FOR UPDATE`;
      const ticket = tickets[0];
      if (!ticket || ticket.societyId !== user.societyId) throw new Error("NOT_FOUND");
      const authorized = user.role === "Pramukh" || user.role === "Mantri" || user.role === "Upmantri" || (user.role === "Area Committee Member" && ticket.assignedId?.toString() === user.committeeTermId);
      if (!authorized) throw new Error("FORBIDDEN");
      const level = escalate ? (user.role === "Area Committee Member" ? 2 : user.role === "Mantri" || user.role === "Upmantri" ? 3 : 4) : 1;
      await tx.$executeRaw`UPDATE helpdesk_tickets SET status=${toStatus}::ticket_status, updated_at=now() WHERE id=${id}::uuid`;
      await tx.$executeRaw`INSERT INTO helpdesk_ticket_events(ticket_id,actor_user_id,from_status,to_status,note,escalation_level)
        VALUES (${id}::uuid,${user.id}::uuid,${ticket.status}::ticket_status,${toStatus}::ticket_status,${note},${level})`;
      return { id, status: toStatus, escalationLevel: level };
    });
    return NextResponse.json(changed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "You are not authorized to update this issue" }, { status: 403 });
    return NextResponse.json({ error: "Issue update failed" }, { status: 503 });
  }
}
