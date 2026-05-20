export interface ProductAiUserUsageResponse {
  userKeycloakId: string;
  userEmail: string;
  questionCount: number;
  todayQuestionCount: number;
  remainingQuestionsToday: number | null;
  lastAskedAt: string;
}
