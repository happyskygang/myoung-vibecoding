import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleChallenges } from "@/lib/sample-data";

const statusLabel: Record<string, string> = {
  active: "진행중",
  upcoming: "예정",
  ended: "종료",
};

const statusColor: Record<string, string> = {
  active: "bg-green-500",
  upcoming: "bg-blue-500",
  ended: "bg-gray-500",
};

async function getChallenges(status?: string) {
  if (process.env.GITHUB_PAGES === "true") {
    return status
      ? sampleChallenges.filter((c) => c.status === status)
      : sampleChallenges;
  }
  const { prisma } = await import("@/lib/prisma");
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  return prisma.challenge.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true, submissions: true } } },
  });
}

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const challenges = await getChallenges(status);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">챌린지</h1>

      <div className="flex gap-2 mb-6">
        <Link href="/challenges">
          <Badge variant={!status ? "default" : "outline"}>전체</Badge>
        </Link>
        {["active", "upcoming", "ended"].map((s) => (
          <Link key={s} href={`/challenges?status=${s}`}>
            <Badge variant={status === s ? "default" : "outline"}>
              {statusLabel[s]}
            </Badge>
          </Link>
        ))}
      </div>

      {challenges.length === 0 ? (
        <p className="text-muted-foreground">챌린지가 없습니다.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <Link key={c.id} href={`/challenges/${c.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={statusColor[c.status]}>
                      {statusLabel[c.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {c.metric.toUpperCase()}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {c.description}
                  </p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>참가자 {c._count.participants}</span>
                    <span>제출 {c._count.submissions}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(c.startAt).toLocaleDateString("ko-KR")} ~{" "}
                    {new Date(c.endAt).toLocaleDateString("ko-KR")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
