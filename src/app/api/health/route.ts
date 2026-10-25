import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(){const started=Date.now();const checks:Record<string,"ok"|"not_configured"|"failed">={application:"ok",database:"not_configured"};let status=200;if(process.env.DATABASE_URL){try{await prisma.$queryRawUnsafe("SELECT 1");checks.database="ok"}catch{checks.database="failed";status=503}}return NextResponse.json({status:status===200?"ok":"degraded",checks,duration_ms:Date.now()-started,timestamp:new Date().toISOString()},{status,headers:{"Cache-Control":"no-store"}})}
