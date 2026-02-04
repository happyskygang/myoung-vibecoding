import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import JoinButton from "./JoinButton";

const statusLabel: Record<string, string> = {
  active: "진행중",
  upcoming: "예정",
  ended: "종료",
};

const tabs = [
  { label: "개요", href: "" },
  { label: "데이터", href: "/data" },
  { label: "제출", href: "/submit" },
  { label: "리더보드", href: "/leaderboard" },
  { label: "토론", href: "/discussion" },
  { label: "규칙", href: "/rules" },
];

export default async function ChallengeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      _count: { select: { participants: true, submissions: true } },
    },
  });

  if (!challenge) {
    return <div className="text-center py-12">챌린지를 찾을 수 없습니다.</div>;
  }

  let isParticipant = false;
  if (session?.user?.id) {
    const p = await prisma.participant.findUnique({
      where: { challengeId_userId: { challengeId: id, userId: session.user.id } },
    });
    isParticipant = !!p;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge>{statusLabel[challenge.status]}</Badge>
          <span className="text-sm text-muted-foreground">
            {challenge.metric.toUpperCase()}
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>참가자 {challenge._count.participants}</span>
          <span>제출 {challenge._count.submissions}</span>
          <span>
            {new Date(challenge.startAt).toLocaleDateString("ko-KR")} ~{" "}
            {new Date(challenge.endAt).toLocaleDateString("ko-KR")}
          </span>
        </div>
        {!isParticipant && session?.user && (
          <JoinButton challengeId={id} />
        )}
        {isParticipant && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            참가중
          </Badge>
        )}
      </div>

      <nav className="flex gap-1 border-b mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={`/challenges/${id}${tab.href}`}
            className="px-4 py-2 text-sm hover:bg-muted rounded-t-md transition-colors"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
