import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entries = await prisma.leaderboard.findMany({
    where: { challengeId: id },
    orderBy: { rank: "asc" },
    include: {
      user: { select: { nickname: true, tier: true } },
    },
  });

  return NextResponse.json(entries);
}
