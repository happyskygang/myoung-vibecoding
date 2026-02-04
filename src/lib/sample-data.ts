export const sampleChallenges = [
  {
    id: "1",
    title: "주택 가격 예측 챌린지",
    description:
      "주어진 주택 데이터를 기반으로 주택 가격을 예측하는 챌린지입니다.\n\n특성: 면적, 방 수, 층수, 건축연도 등\n목표: 주택 가격(price)을 정확하게 예측하세요.",
    metric: "rmse",
    status: "active",
    startAt: "2026-01-01",
    endAt: "2026-06-30",
    dailySubmitLimit: 5,
    rules: "1. 하루 최대 5회 제출 가능\n2. 외부 데이터 사용 금지\n3. 팀 최대 3명\n4. 최종 순위는 Private Score 기준",
    _count: { participants: 1, submissions: 0 },
  },
  {
    id: "2",
    title: "고객 이탈 예측",
    description:
      "통신사 고객 데이터를 분석하여 이탈 여부를 예측하는 이진 분류 챌린지입니다.\n\n특성: 가입기간, 월 요금, 서비스 유형 등\n목표: 이탈 여부(churn)를 정확하게 예측하세요.",
    metric: "f1",
    status: "active",
    startAt: "2026-02-01",
    endAt: "2026-07-31",
    dailySubmitLimit: 3,
    rules: "1. 하루 최대 3회 제출 가능\n2. F1 Score 기준 평가\n3. 개인 참가만 가능",
    _count: { participants: 0, submissions: 0 },
  },
  {
    id: "3",
    title: "이미지 분류 입문",
    description:
      "기본 이미지 분류 챌린지입니다. 10개의 카테고리로 이미지를 분류하세요.",
    metric: "accuracy",
    status: "upcoming",
    startAt: "2026-03-01",
    endAt: "2026-08-31",
    dailySubmitLimit: 5,
    rules: "1. Accuracy 기준 평가\n2. 하루 5회 제출 가능",
    _count: { participants: 0, submissions: 0 },
  },
];

export const sampleUsers = [
  { id: "1", nickname: "데이터사이언티스트", tier: "gold", xp: 500 },
  { id: "2", nickname: "테스트유저", tier: "silver", xp: 150 },
];
