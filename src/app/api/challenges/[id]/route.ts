import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      datasets: true,
      _count: { select: { participants: true, submissions: true } },
    },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(challenge);
}
