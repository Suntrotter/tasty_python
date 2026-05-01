export interface InterviewQuestion {
  id: string;
  topic: string;
  question: string;
  shortAnswer: string;
  strongAnswer: string;
  commonMistake: string;
  lessonSlug?: string;
}