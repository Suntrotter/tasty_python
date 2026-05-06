const INTERVIEW_STORAGE_KEY = "tasty-python-interview-progress";

export type InterviewQuestionStatus = "known" | "review";

export interface InterviewQuestionProgress {
  questionId: string;
  lessonSlug: string;
  lessonTitle: string;
  question: string;
  status: InterviewQuestionStatus;
  updatedAt: string;
}

interface InterviewQuestionProgressInput {
  questionId: string;
  lessonSlug: string;
  lessonTitle: string;
  question: string;
  status: InterviewQuestionStatus;
}

export function readInterviewProgress(): InterviewQuestionProgress[] {
  try {
    const rawProgress = localStorage.getItem(INTERVIEW_STORAGE_KEY);

    if (!rawProgress) {
      return [];
    }

    const parsedProgress = JSON.parse(rawProgress);

    if (!Array.isArray(parsedProgress)) {
      return [];
    }

    return parsedProgress;
  } catch {
    return [];
  }
}

function saveInterviewProgress(progress: InterviewQuestionProgress[]) {
  localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(progress));
}

export function getInterviewQuestionStatusMap() {
  return readInterviewProgress().reduce<Record<string, InterviewQuestionStatus>>(
    (result, item) => {
      result[item.questionId] = item.status;
      return result;
    },
    {}
  );
}

export function recordInterviewQuestionStatus(
  input: InterviewQuestionProgressInput
) {
  const previousProgress = readInterviewProgress();

  const nextProgressItem: InterviewQuestionProgress = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const nextProgress = [
    ...previousProgress.filter(
      (item) => item.questionId !== input.questionId
    ),
    nextProgressItem,
  ];

  saveInterviewProgress(nextProgress);

  return nextProgressItem;
}

export function getInterviewQuestionsToReview() {
  return readInterviewProgress().filter((item) => item.status === "review");
}

export function clearInterviewProgress() {
  localStorage.removeItem(INTERVIEW_STORAGE_KEY);
}