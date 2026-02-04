import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function seed() {
  const password = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      password,
      nickname: "테스트유저",
      tier: "silver",
      xp: 150,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      password,
      nickname: "데이터사이언티스트",
      tier: "gold",
      xp: 500,
    },
  });

  const challenge1 = await prisma.challenge.create({
    data: {
      title: "주택 가격 예측 챌린지",
      description:
        "주어진 주택 데이터를 기반으로 주택 가격을 예측하는 챌린지입니다.\n\n특성: 면적, 방 수, 층수, 건축연도 등\n목표: 주택 가격(price)을 정확하게 예측하세요.",
      metric: "rmse",
      status: "active",
      startAt: new Date("2026-01-01"),
      endAt: new Date("2026-06-30"),
      dailySubmitLimit: 5,
      rules: "1. 하루 최대 5회 제출 가능\n2. 외부 데이터 사용 금지\n3. 팀 최대 3명\n4. 최종 순위는 Private Score 기준",
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      title: "고객 이탈 예측",
      description:
        "통신사 고객 데이터를 분석하여 이탈 여부를 예측하는 이진 분류 챌린지입니다.\n\n특성: 가입기간, 월 요금, 서비스 유형 등\n목표: 이탈 여부(churn)를 정확하게 예측하세요.",
      metric: "f1",
      status: "active",
      startAt: new Date("2026-02-01"),
      endAt: new Date("2026-07-31"),
      dailySubmitLimit: 3,
      rules: "1. 하루 최대 3회 제출 가능\n2. F1 Score 기준 평가\n3. 개인 참가만 가능",
    },
  });

  await prisma.challenge.create({
    data: {
      title: "이미지 분류 입문",
      description: "기본 이미지 분류 챌린지입니다. 10개의 카테고리로 이미지를 분류하세요.",
      metric: "accuracy",
      status: "upcoming",
      startAt: new Date("2026-03-01"),
      endAt: new Date("2026-08-31"),
      dailySubmitLimit: 5,
      rules: "1. Accuracy 기준 평가\n2. 하루 5회 제출 가능",
    },
  });

  const dataDir1 = path.join(process.cwd(), "datasets", challenge1.id);
  mkdirSync(dataDir1, { recursive: true });

  writeFileSync(path.join(dataDir1, "train.csv"), "id,area,rooms,floor,year,price\n1,85,3,5,2010,350000\n2,120,4,10,2015,520000\n3,60,2,3,2005,280000\n4,95,3,7,2018,410000\n5,150,5,15,2020,680000\n");
  writeFileSync(path.join(dataDir1, "answer.csv"), "id,price\n1,355000\n2,515000\n3,275000\n4,415000\n5,675000\n");
  writeFileSync(path.join(dataDir1, "sample_submission.csv"), "id,price\n1,0\n2,0\n3,0\n4,0\n5,0\n");

  await prisma.dataset.createMany({
    data: [
      { challengeId: challenge1.id, filePath: `datasets/${challenge1.id}/train.csv`, fileName: "train.csv", description: "학습용 데이터", license: "CC BY-SA 4.0" },
      { challengeId: challenge1.id, filePath: `datasets/${challenge1.id}/sample_submission.csv`, fileName: "sample_submission.csv", description: "제출 양식 샘플", license: "CC BY-SA 4.0" },
      { challengeId: challenge1.id, filePath: `datasets/${challenge1.id}/answer.csv`, fileName: "answer.csv", description: "정답 파일 (채점용)", license: "Internal" },
    ],
  });

  const dataDir2 = path.join(process.cwd(), "datasets", challenge2.id);
  mkdirSync(dataDir2, { recursive: true });
  writeFileSync(path.join(dataDir2, "answer.csv"), "id,churn\n1,1\n2,0\n3,1\n4,0\n5,1\n");

  await prisma.dataset.create({
    data: { challengeId: challenge2.id, filePath: `datasets/${challenge2.id}/answer.csv`, fileName: "answer.csv", description: "정답 파일 (채점용)", license: "Internal" },
  });

  await prisma.participant.create({
    data: { challengeId: challenge1.id, userId: user2.id },
  });

  await prisma.post.create({
    data: {
      challengeId: challenge1.id,
      authorId: user2.id,
      boardType: "tip",
      title: "베이스라인 공유: 선형 회귀 모델",
      body: "간단한 선형 회귀 모델로 RMSE 25000 정도 나옵니다.\n\n특성 엔지니어링을 하면 더 좋은 결과를 얻을 수 있을 것 같습니다.",
    },
  });

  console.log("Seed 완료!");
  console.log("테스트 계정: test@example.com / password123");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
