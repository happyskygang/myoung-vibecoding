import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.participant.findUnique({
    where: { challengeId_userId: { challengeId: id, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "이미 참가 중입니다." }, { status: 400 });
  }

  const participant = await prisma.participant.create({
    data: { challengeId: id, userId: session.user.id },
  });

  return NextResponse.json(participant, { status: 201 });
}
