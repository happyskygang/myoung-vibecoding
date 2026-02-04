import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { calculateScore } from "@/lib/scoring";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id: challengeId } = await params;
  const userId = session.user.id;

  const participant = await prisma.participant.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (!participant) {
    return NextResponse.json({ error: "먼저 챌린지에 참가해주세요." }, { status: 403 });
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { datasets: true },
  });
  if (!challenge) {
    return NextResponse.json({ error: "챌린지를 찾을 수 없습니다." }, { status: 404 });
  }
  if (challenge.status !== "active") {
    return NextResponse.json({ error: "현재 제출할 수 없는 챌린지입니다." }, { status: 400 });
  }

  // Check daily limit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySubmissions = await prisma.submission.count({
    where: {
      challengeId,
      userId,
      createdAt: { gte: today },
    },
  });
  if (todaySubmissions >= challenge.dailySubmitLimit) {
    return NextResponse.json(
      { error: `일일 제출 제한(${challenge.dailySubmitLimit}회)을 초과했습니다.` },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "파일을 업로드해주세요." }, { status: 400 });
  }

  // Save file
  const uploadDir = path.join(process.cwd(), "uploads", challengeId);
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${userId}_${Date.now()}_${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      challengeId,
      userId,
      filePath: `uploads/${challengeId}/${fileName}`,
      fileName: file.name,
      status: "scoring",
    },
  });

  // Score
  const answerDataset = challenge.datasets.find((d) =>
    d.fileName.toLowerCase().includes("answer")
  );

  let scoreResult = { score: -1, log: "정답 파일을 찾을 수 없습니다." };
  if (answerDataset) {
    const answerPath = path.join(process.cwd(), answerDataset.filePath);
    scoreResult = calculateScore(filePath, answerPath, challenge.metric);
  }

  // Update submission
  const updatedSubmission = await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: scoreResult.score >= 0 ? "completed" : "error",
      scorePublic: scoreResult.score >= 0 ? scoreResult.score : null,
      log: scoreResult.log,
    },
  });

  // Update leaderboard
  if (scoreResult.score >= 0) {
    const isHigherBetter = ["accuracy", "f1"].includes(
      challenge.metric.toLowerCase()
    );

    const existing = await prisma.leaderboard.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });

    const shouldUpdate =
      !existing ||
      (isHigherBetter
        ? scoreResult.score > existing.bestScore
        : scoreResult.score < existing.bestScore);

    if (shouldUpdate) {
      await prisma.leaderboard.upsert({
        where: { challengeId_userId: { challengeId, userId } },
        create: { challengeId, userId, bestScore: scoreResult.score },
        update: { bestScore: scoreResult.score },
      });
    }

    // Recalculate ranks
    const entries = await prisma.leaderboard.findMany({
      where: { challengeId },
      orderBy: { bestScore: isHigherBetter ? "desc" : "asc" },
    });
    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboard.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }

    // Award XP
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: 10 } },
    });
  }

  return NextResponse.json(updatedSubmission);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const submissions = await prisma.submission.findMany({
    where: { challengeId: id, userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}
