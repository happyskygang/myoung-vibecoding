import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleChallenges, sampleUsers } from "@/lib/sample-data";

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

async function getChallenges() {
  if (process.env.GITHUB_PAGES === "true") return sampleChallenges;
  const { prisma } = await import("@/lib/prisma");
  return prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { _count: { select: { participants: true, submissions: true } } },
  });
}

async function getTopUsers() {
  if (process.env.GITHUB_PAGES === "true") return sampleUsers;
  const { prisma } = await import("@/lib/prisma");
  return prisma.user.findMany({ orderBy: { xp: "desc" }, take: 5 });
}

export default async function HomePage() {
  const challenges = await getChallenges();
  const topUsers = await getTopUsers();

  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Code Challenge Platform</h1>
        <p className="text-lg text-muted-foreground mb-6">
          AI/ML 문제를 풀고, 실력을 키우고, 커뮤니티와 함께 성장하세요.
        </p>
        <Link href="/challenges">
          <Button size="lg">챌린지 둘러보기</Button>
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">챌린지</h2>
          <Link href="/challenges" className="text-sm underline">
            전체보기
          </Link>
        </div>
        {challenges.length === 0 ? (
          <p className="text-muted-foreground">등록된 챌린지가 없습니다.</p>
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
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>참가자 {c._count.participants}</span>
                      <span>제출 {c._count.submissions}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {topUsers.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">상위 랭커</h2>
          <div className="grid gap-3 md:grid-cols-5">
            {topUsers.map((u, i) => (
              <Card key={u.id}>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold mb-1">#{i + 1}</div>
                  <div className="font-medium">{u.nickname}</div>
                  <div className="text-sm text-muted-foreground">
                    {u.xp} XP · {u.tier}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
