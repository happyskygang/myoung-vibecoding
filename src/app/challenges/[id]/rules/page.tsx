import { prisma } from "@/lib/prisma";

export default async function RulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { id } });

  if (!challenge) return null;

  return (
    <div className="prose max-w-none">
      <h2>규칙</h2>
      {challenge.rules ? (
        <div className="whitespace-pre-wrap">{challenge.rules}</div>
      ) : (
        <p className="text-muted-foreground">등록된 규칙이 없습니다.</p>
      )}
    </div>
  );
}
