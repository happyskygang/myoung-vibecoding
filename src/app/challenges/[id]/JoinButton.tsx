"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function JoinButton({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    const res = await fetch(`/api/challenges/${challengeId}/join`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button onClick={handleJoin} disabled={loading}>
      {loading ? "참가 중..." : "챌린지 참가"}
    </Button>
  );
}
