"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Submission {
  id: string;
  fileName: string;
  status: string;
  scorePublic: number | null;
  log: string;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500",
  scoring: "bg-blue-500",
  completed: "bg-green-500",
  error: "bg-red-500",
};

export default function SubmitPage() {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  async function fetchSubmissions() {
    const res = await fetch(`/api/challenges/${id}/submit`);
    if (res.ok) {
      setSubmissions(await res.json());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/challenges/${id}/submit`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "제출에 실패했습니다.");
    } else {
      setMessage(`채점 완료! 점수: ${data.scorePublic ?? "N/A"}`);
      setFile(null);
      fetchSubmissions();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>제출하기</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" disabled={!file || loading}>
              {loading ? "채점 중..." : "제출"}
            </Button>
          </form>
          {message && (
            <p className="mt-3 text-sm font-medium">{message}</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-bold mb-4">제출 이력</h3>
        {submissions.length === 0 ? (
          <p className="text-muted-foreground">아직 제출 이력이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{s.fileName}</span>
                      <span className="text-xs text-muted-foreground ml-3">
                        {new Date(s.createdAt).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.scorePublic !== null && (
                        <span className="font-mono font-bold">
                          {s.scorePublic.toFixed(5)}
                        </span>
                      )}
                      <Badge className={statusBadge[s.status]}>{s.status}</Badge>
                    </div>
                  </div>
                  {s.log && (
                    <p className="text-xs text-muted-foreground mt-2">{s.log}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
