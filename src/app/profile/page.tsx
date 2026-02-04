import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      participants: {
        include: {
          challenge: { select: { title: true, status: true, metric: true } },
        },
        orderBy: { joinedAt: "desc" },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          challenge: { select: { title: true } },
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{user.nickname}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{user.tier}</div>
              <div className="text-sm text-muted-foreground">티어</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user.xp}</div>
              <div className="text-sm text-muted-foreground">XP</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {user.participants.length}
              </div>
              <div className="text-sm text-muted-foreground">참가 챌린지</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>참가 챌린지</CardTitle>
        </CardHeader>
        <CardContent>
          {user.participants.length === 0 ? (
            <p className="text-muted-foreground">참가한 챌린지가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {user.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="font-medium">{p.challenge.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{p.challenge.metric.toUpperCase()}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.joinedAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 제출</CardTitle>
        </CardHeader>
        <CardContent>
          {user.submissions.length === 0 ? (
            <p className="text-muted-foreground">제출 이력이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {user.submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <span className="font-medium">{s.challenge.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {s.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.scorePublic !== null && (
                      <span className="font-mono text-sm">
                        {s.scorePublic.toFixed(5)}
                      </span>
                    )}
                    <Badge
                      variant={s.status === "completed" ? "default" : "outline"}
                    >
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
