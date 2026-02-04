import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const participant = await prisma.participant.findUnique({
    where: { challengeId_userId: { challengeId: id, userId: session.user.id } },
  });

  if (!participant) {
    return NextResponse.json({ error: "먼저 챌린지에 참가해주세요." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const datasetId = searchParams.get("datasetId");
  if (!datasetId) {
    return NextResponse.json({ error: "datasetId가 필요합니다." }, { status: 400 });
  }

  const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
  if (!dataset || dataset.challengeId !== id) {
    return NextResponse.json({ error: "데이터셋을 찾을 수 없습니다." }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), dataset.filePath);
  const fileBuffer = await readFile(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${dataset.fileName}"`,
      "Content-Type": "application/octet-stream",
    },
  });
}
