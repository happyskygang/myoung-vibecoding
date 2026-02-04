import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DownloadButton from "./DownloadButton";

export default async function DataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { datasets: true },
  });

  if (!challenge) return null;

  let isParticipant = false;
  if (session?.user?.id) {
    const p = await prisma.participant.findUnique({
      where: { challengeId_userId: { challengeId: id, userId: session.user.id } },
    });
    isParticipant = !!p;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">데이터셋</h2>

      {!isParticipant && (
        <p className="text-muted-foreground mb-4">
          데이터를 다운로드하려면 챌린지에 먼저 참가해주세요.
        </p>
      )}

      {challenge.datasets.length === 0 ? (
        <p className="text-muted-foreground">등록된 데이터셋이 없습니다.</p>
      ) : (
        <div className="grid gap-4">
          {challenge.datasets.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{d.fileName}</CardTitle>
              </CardHeader>
              <CardContent>
                {d.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {d.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {d.license && <span>라이선스: {d.license}</span>}
                  <span>버전: {d.version}</span>
                </div>
                {isParticipant && (
                  <DownloadButton challengeId={id} datasetId={d.id} fileName={d.fileName} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
