"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  title: string;
  body: string;
  boardType: string;
  createdAt: string;
  author: { nickname: string; tier: string };
}

const boardTypeLabel: Record<string, string> = {
  discussion: "질문",
  announcement: "공지",
  tip: "팁",
};

export default function DiscussionPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [boardType, setBoardType] = useState("discussion");

  useEffect(() => {
    fetchPosts();
  }, [id]);

  async function fetchPosts() {
    const res = await fetch(`/api/challenges/${id}/discussions`);
    if (res.ok) setPosts(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/challenges/${id}/discussions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, boardType }),
    });
    if (res.ok) {
      setTitle("");
      setBody("");
      setShowForm(false);
      fetchPosts();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">토론</h2>
        {session?.user && (
          <Button
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "취소" : "글 작성"}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="discussion">질문</option>
                  <option value="tip">팁</option>
                  <option value="announcement">공지</option>
                </select>
                <Input
                  placeholder="제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <Textarea
                placeholder="내용을 입력하세요"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                required
              />
              <Button type="submit">게시</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 ? (
        <p className="text-muted-foreground">아직 게시글이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{boardTypeLabel[p.boardType]}</Badge>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap mb-3">{p.body}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{p.author.nickname}</span>
                  <span>{new Date(p.createdAt).toLocaleString("ko-KR")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
