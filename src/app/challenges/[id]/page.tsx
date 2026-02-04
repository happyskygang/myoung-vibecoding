import { prisma } from "@/lib/prisma";

export default async function ChallengeOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { id } });

  if (!challenge) return null;

  return (
    <div className="prose max-w-none">
      <h2>개요</h2>
      <p className="whitespace-pre-wrap">{challenge.description}</p>

      <h3>평가 지표</h3>
      <p>
        이 챌린지는 <strong>{challenge.metric.toUpperCase()}</strong> 기준으로
        평가됩니다.
      </p>

      <h3>일정</h3>
      <ul>
        <li>시작: {new Date(challenge.startAt).toLocaleString("ko-KR")}</li>
        <li>종료: {new Date(challenge.endAt).toLocaleString("ko-KR")}</li>
      </ul>

      <h3>제출 제한</h3>
      <p>하루 최대 {challenge.dailySubmitLimit}회 제출 가능</p>
    </div>
  );
}
