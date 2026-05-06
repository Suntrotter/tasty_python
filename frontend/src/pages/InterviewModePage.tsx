import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CodeBlock from "../components/CodeBlock";
import { fetchLessonContentBySlug } from "../api/lessonContentApi";
import { fetchLessons } from "../api/lessonsApi";
import { fetchTracks } from "../api/tracksApi";
import {
  getInterviewQuestionStatusMap,
  recordInterviewQuestionStatus,
  type InterviewQuestionStatus,
} from "../features/interview/interviewProgress";
import { lessons as localLessons } from "../data/lessons";
import { tracks as localTracks } from "../data/tracks";
import { getLessonContentBySlug } from "../data/lessonContent";
import type { LessonPreview, Track } from "../types/curriculum";
import type { LessonContent, LessonTextItem } from "../types/lesson";

interface InterviewQuestionViewModel {
  id: string;
  trackSlug: string;
  trackTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  sectionTitle: string;
  question: string;
  answer: string;
  code?: string;
  output?: string;
}

function createTrackTitleMap(tracks: Track[]) {
  return tracks.reduce<Record<string, string>>((result, track) => {
    result[track.slug] = track.title;
    return result;
  }, {});
}

function getQuestionTitle(item: LessonTextItem, index: number) {
  return item.title || `Question ${index + 1}`;
}

function getQuestionAnswer(item: LessonTextItem) {
  return item.content || "No suggested answer yet.";
}

function extractInterviewQuestionsFromLesson(
  lesson: LessonPreview,
  lessonContent: LessonContent,
  trackTitleMap: Record<string, string>
): InterviewQuestionViewModel[] {
  const interviewSections = lessonContent.sections.filter(
    (section) => section.type === "interview" && section.items?.length
  );

  return interviewSections.flatMap((section) =>
    (section.items ?? []).map((item, index) => ({
      id: `${lesson.slug}-${section.id}-${item.id ?? index}`,
      trackSlug: lesson.trackSlug,
      trackTitle: trackTitleMap[lesson.trackSlug] ?? lesson.trackSlug,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      sectionTitle: section.title,
      question: getQuestionTitle(item, index),
      answer: getQuestionAnswer(item),
      code: item.code,
      output: item.output,
    }))
  );
}

async function loadInterviewQuestionsFromApi() {
  const [lessonsFromApi, tracksFromApi] = await Promise.all([
    fetchLessons(),
    fetchTracks(),
  ]);

  const trackTitleMap = createTrackTitleMap(tracksFromApi);

  const publishedLessonsWithContent = lessonsFromApi.filter(
    (lesson) => lesson.status === "published" && lesson.hasContent
  );

  const lessonContents = await Promise.all(
    publishedLessonsWithContent.map(async (lesson) => {
      const content = await fetchLessonContentBySlug(lesson.slug);

      return {
        lesson,
        content,
      };
    })
  );

  return lessonContents.flatMap(({ lesson, content }) =>
    extractInterviewQuestionsFromLesson(lesson, content, trackTitleMap)
  );
}

function loadInterviewQuestionsFromLocalData() {
  const trackTitleMap = createTrackTitleMap(localTracks);

  const publishedLessons = localLessons.filter(
    (lesson) => lesson.status === "published"
  );

  return publishedLessons.flatMap((lesson) => {
    const content = getLessonContentBySlug(lesson.slug);

    if (!content) {
      return [];
    }

    return extractInterviewQuestionsFromLesson(lesson, content, trackTitleMap);
  });
}

function getStatusLabel(status?: InterviewQuestionStatus) {
  if (status === "known") {
    return "Known";
  }

  if (status === "review") {
    return "Review later";
  }

  return "Not marked";
}

function InterviewModePage() {
  const [questions, setQuestions] = useState<InterviewQuestionViewModel[]>([]);
  const [selectedTrackSlug, setSelectedTrackSlug] = useState("all");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [questionStatuses, setQuestionStatuses] = useState<
    Record<string, InterviewQuestionStatus>
  >(() => getInterviewQuestionStatusMap());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const questionsFromApi = await loadInterviewQuestionsFromApi();

        setQuestions(questionsFromApi);
        setErrorMessage("");
      } catch {
        const localQuestions = loadInterviewQuestionsFromLocalData();

        setQuestions(localQuestions);
        setErrorMessage(
          "Backend is not available right now. Showing local demo questions."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const trackFilters = useMemo(() => {
    const uniqueTracks = Array.from(
      new Map(
        questions.map((question) => [
          question.trackSlug,
          {
            slug: question.trackSlug,
            title: question.trackTitle,
          },
        ])
      ).values()
    );

    return [
      {
        slug: "all",
        title: "All",
      },
      ...uniqueTracks,
    ];
  }, [questions]);

  const filteredQuestions =
    selectedTrackSlug === "all"
      ? questions
      : questions.filter((question) => question.trackSlug === selectedTrackSlug);

  const knownQuestionsCount = filteredQuestions.filter(
    (question) => questionStatuses[question.id] === "known"
  ).length;

  const reviewQuestionsCount = filteredQuestions.filter(
    (question) => questionStatuses[question.id] === "review"
  ).length;

  function toggleQuestion(questionId: string) {
    setOpenQuestionId((currentId) =>
      currentId === questionId ? null : questionId
    );
  }

  function handleMarkQuestion(
    question: InterviewQuestionViewModel,
    status: InterviewQuestionStatus
  ) {
    recordInterviewQuestionStatus({
      questionId: question.id,
      lessonSlug: question.lessonSlug,
      lessonTitle: question.lessonTitle,
      question: question.question,
      status,
    });

    setQuestionStatuses(getInterviewQuestionStatusMap());
  }

  return (
    <main className="page interview-page">
      <section className="page-intro interview-intro">
        <p className="eyebrow">Interview mode</p>
        <h1>Practice explaining Python clearly.</h1>

        <p>
          Pick a question, answer it aloud first, then reveal the suggested
          answer. The goal is not to memorize perfect phrases — the goal is to
          explain the idea calmly and correctly.
        </p>

        {errorMessage && <p className="api-notice">{errorMessage}</p>}
      </section>

      {isLoading ? (
        <section className="loading-box">
          <h2>Loading interview questions...</h2>
          <p>Collecting questions from published lessons.</p>
        </section>
      ) : (
        <>
          <section
            className="interview-topic-filter"
            aria-label="Interview topics"
          >
            {trackFilters.map((track) => (
              <button
                type="button"
                key={track.slug}
                className={`topic-button ${
                  selectedTrackSlug === track.slug ? "topic-button-active" : ""
                }`}
                onClick={() => {
                  setSelectedTrackSlug(track.slug);
                  setOpenQuestionId(null);
                }}
              >
                {track.title}
              </button>
            ))}
          </section>

          <section className="interview-summary-card">
            <div>
              <p className="progress-card-kicker">Question bank</p>
              <h2>{filteredQuestions.length}</h2>
              <p>
                Question{filteredQuestions.length === 1 ? "" : "s"} available
                for this filter.
              </p>
            </div>

            <div>
              <p className="progress-card-kicker">Known</p>
              <h2>{knownQuestionsCount}</h2>
              <p>Questions you marked as clear.</p>
            </div>

            <div>
              <p className="progress-card-kicker">Review later</p>
              <h2>{reviewQuestionsCount}</h2>
              <p>Questions you want to return to.</p>
            </div>
          </section>

          {filteredQuestions.length > 0 ? (
            <section className="interview-list">
              {filteredQuestions.map((question) => {
                const isOpen = openQuestionId === question.id;
                const currentStatus = questionStatuses[question.id];

                return (
                  <article
                    className={`interview-card ${
                      currentStatus
                        ? `interview-card-${currentStatus}`
                        : ""
                    }`}
                    key={question.id}
                  >
                    <div className="interview-card-header">
                      <div className="interview-card-meta">
                        <span className="status status-published">
                          {question.trackTitle}
                        </span>

                        <span>{question.lessonTitle}</span>

                        <span
                          className={`interview-status-pill ${
                            currentStatus
                              ? `interview-status-pill-${currentStatus}`
                              : ""
                          }`}
                        >
                          {getStatusLabel(currentStatus)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="interview-toggle"
                        onClick={() => toggleQuestion(question.id)}
                      >
                        {isOpen ? "Hide answer" : "Reveal answer"}
                      </button>
                    </div>

                    <p className="interview-section-label">
                      {question.sectionTitle}
                    </p>

                    <h2>{question.question}</h2>

                    {isOpen && (
                      <div className="interview-answer">
                        <div className="interview-answer-block">
                          <h3>Suggested answer</h3>
                          <p>{question.answer}</p>
                        </div>

                        {question.code && (
                          <CodeBlock
                            code={question.code}
                            language="python"
                            title="Python"
                          />
                        )}

                        {question.output && (
                          <CodeBlock
                            code={question.output}
                            language="plaintext"
                            title="Output"
                            variant="output"
                          />
                        )}

                        <div className="interview-self-check">
                          <p>How did it feel?</p>

                          <div>
                            <button
                              type="button"
                              className={`interview-self-check-button ${
                                currentStatus === "known"
                                  ? "interview-self-check-button-known"
                                  : ""
                              }`}
                              onClick={() =>
                                handleMarkQuestion(question, "known")
                              }
                            >
                              I knew this
                            </button>

                            <button
                              type="button"
                              className={`interview-self-check-button ${
                                currentStatus === "review"
                                  ? "interview-self-check-button-review"
                                  : ""
                              }`}
                              onClick={() =>
                                handleMarkQuestion(question, "review")
                              }
                            >
                              Review later
                            </button>
                          </div>
                        </div>

                        <div className="interview-actions">
                          <Link
                            to={`/lessons/${question.lessonSlug}`}
                            className="button button-secondary"
                          >
                            Open related lesson
                          </Link>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="empty-progress-card">
              <h2>No interview questions yet.</h2>
              <p>
                Add an interview section with question items to a published
                lesson, and the questions will appear here.
              </p>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default InterviewModePage;