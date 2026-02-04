import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const posts = await prisma.post.findMany({
    where: { challengeId: id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { nickname: true, tier: true } },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const { title, body, boardType } = await req.json();

  if (!title || !body) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      challengeId: id,
      authorId: session.user.id,
      title,
      body,
      boardType: boardType || "discussion",
    },
    include: {
      author: { select: { nickname: true, tier: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
