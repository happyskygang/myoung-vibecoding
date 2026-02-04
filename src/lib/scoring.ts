import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";

export function calculateScore(
  submissionPath: string,
  answerPath: string,
  metric: string
): { score: number; log: string } {
  try {
    const submissionData = parse(readFileSync(submissionPath, "utf-8"), {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    const answerData = parse(readFileSync(answerPath, "utf-8"), {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    if (submissionData.length !== answerData.length) {
      return {
        score: -1,
        log: `행 수 불일치: 제출 ${submissionData.length}행, 정답 ${answerData.length}행`,
      };
    }

    const columns = Object.keys(answerData[0]);
    const targetCol = columns.find((c) => c !== "id") || columns[0];

    const predicted = submissionData.map((r) => parseFloat(r[targetCol]));
    const actual = answerData.map((r) => parseFloat(r[targetCol]));

    if (predicted.some(isNaN) || actual.some(isNaN)) {
      return { score: -1, log: `'${targetCol}' 컬럼에 유효하지 않은 값이 있습니다.` };
    }

    let score: number;
    switch (metric.toLowerCase()) {
      case "rmse":
        score = rmse(predicted, actual);
        break;
      case "accuracy":
        score = accuracy(predicted, actual);
        break;
      case "f1":
        score = f1Score(predicted, actual);
        break;
      default:
        score = rmse(predicted, actual);
    }

    return {
      score: Math.round(score * 100000) / 100000,
      log: `채점 완료: ${metric.toUpperCase()} = ${score.toFixed(5)} (${submissionData.length}행)`,
    };
  } catch (err) {
    return {
      score: -1,
      log: `채점 오류: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

function rmse(predicted: number[], actual: number[]): number {
  const sumSq = predicted.reduce(
    (sum, p, i) => sum + Math.pow(p - actual[i], 2),
    0
  );
  return Math.sqrt(sumSq / predicted.length);
}

function accuracy(predicted: number[], actual: number[]): number {
  const correct = predicted.filter(
    (p, i) => Math.round(p) === Math.round(actual[i])
  ).length;
  return correct / predicted.length;
}

function f1Score(predicted: number[], actual: number[]): number {
  const pred = predicted.map((p) => Math.round(p));
  const act = actual.map((a) => Math.round(a));

  const tp = pred.filter((p, i) => p === 1 && act[i] === 1).length;
  const fp = pred.filter((p, i) => p === 1 && act[i] === 0).length;
  const fn = pred.filter((p, i) => p === 0 && act[i] === 1).length;

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;

  return precision + recall > 0
    ? (2 * precision * recall) / (precision + recall)
    : 0;
}
