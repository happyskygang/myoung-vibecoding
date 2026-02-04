import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search };

  const challenges = await prisma.challenge.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { participants: true, submissions: true } },
    },
  });

  return NextResponse.json(challenges);
}
