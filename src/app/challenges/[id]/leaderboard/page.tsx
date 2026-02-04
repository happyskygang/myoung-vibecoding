"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardEntry {
  id: string;
  rank: number;
  bestScore: number;
  updatedAt: string;
  user: { nickname: string; tier: string };
}

export default function LeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch(`/api/challenges/${id}/leaderboard`)
      .then((r) => r.json())
      .then(setEntries);
  }, [id]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">리더보드</h2>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">아직 제출된 결과가 없습니다.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">순위</TableHead>
              <TableHead>닉네임</TableHead>
              <TableHead>티어</TableHead>
              <TableHead className="text-right">점수</TableHead>
              <TableHead className="text-right">최종 제출</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-bold">
                  {e.rank <= 3 ? ["🥇", "🥈", "🥉"][e.rank - 1] : `#${e.rank}`}
                </TableCell>
                <TableCell className="font-medium">
                  {e.user.nickname}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {e.user.tier}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {e.bestScore.toFixed(5)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {new Date(e.updatedAt).toLocaleString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
