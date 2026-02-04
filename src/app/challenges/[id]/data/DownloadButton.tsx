"use client";

import { Button } from "@/components/ui/button";

export default function DownloadButton({
  challengeId,
  datasetId,
  fileName,
}: {
  challengeId: string;
  datasetId: string;
  fileName: string;
}) {
  async function handleDownload() {
    const res = await fetch(
      `/api/challenges/${challengeId}/data?datasetId=${datasetId}`
    );
    if (!res.ok) {
      alert("다운로드에 실패했습니다.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      다운로드
    </Button>
  );
}
