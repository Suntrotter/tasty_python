import { useEffect, useMemo, useState, type CSSProperties } from "react";
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

const QUICK_SESSION_SIZE = 10;
const INITIAL_ALL_QUESTIONS_LIMIT = 20;
const ALL_QUESTIONS_STEP = 20;

type InterviewView = "practice-now" | "review-later" | "by-lesson" | "all";

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

interface InterviewLessonGroup {
  lessonSlug: string;
  lessonTitle: string;
  trackTitle: string;
  questions: InterviewQuestionViewModel[];
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

  return "Not practiced";
}

function getPracticeQueue(
  questions: InterviewQuestionViewModel[],
  questionStatuses: Record<string, InterviewQuestionStatus>
) {
  const reviewQuestions = questions.filter(
    (question) => questionStatuses[question.id] === "review"
  );

  const notPracticedQuestions = questions.filter(
    (question) => !questionStatuses[question.id]
  );

  const knownQuestions = questions.filter(
    (question) => questionStatuses[question.id] === "known"
  );

  return [...reviewQuestions, ...notPracticedQuestions, ...knownQuestions];
}

function getRotatedQuestions(
  questions: InterviewQuestionViewModel[],
  offset: number,
  limit: number
) {
  if (questions.length <= limit) {
    return questions;
  }

  const normalizedOffset = offset % questions.length;
  const rotatedQuestions = [
    ...questions.slice(normalizedOffset),
    ...questions.slice(0, normalizedOffset),
  ];

  return rotatedQuestions.slice(0, limit);
}

function groupQuestionsByLesson(
  questions: InterviewQuestionViewModel[]
): InterviewLessonGroup[] {
  const groups = new Map<string, InterviewLessonGroup>();

  questions.forEach((question) => {
    const existingGroup = groups.get(question.lessonSlug);

    if (existingGroup) {
      existingGroup.questions.push(question);
      return;
    }

    groups.set(question.lessonSlug, {
      lessonSlug: question.lessonSlug,
      lessonTitle: question.lessonTitle,
      trackTitle: question.trackTitle,
      questions: [question],
    });
  });

  return Array.from(groups.values());
}

function InterviewModePage() {
  const [questions, setQuestions] = useState<InterviewQuestionViewModel[]>([]);
  const [selectedTrackSlug, setSelectedTrackSlug] = useState("all");
  const [selectedView, setSelectedView] =
    useState<InterviewView>("practice-now");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [quickSetOffset, setQuickSetOffset] = useState(0);
  const [visibleAllQuestionsCount, setVisibleAllQuestionsCount] = useState(
    INITIAL_ALL_QUESTIONS_LIMIT
  );
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

  useEffect(() => {
    setOpenQuestionId(null);
    setQuickSetOffset(0);
    setVisibleAllQuestionsCount(INITIAL_ALL_QUESTIONS_LIMIT);
  }, [selectedTrackSlug, selectedView]);

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

  const knownQuestions = filteredQuestions.filter(
    (question) => questionStatuses[question.id] === "known"
  );

  const reviewQuestions = filteredQuestions.filter(
    (question) => questionStatuses[question.id] === "review"
  );

  const notPracticedQuestions = filteredQuestions.filter(
    (question) => !questionStatuses[question.id]
  );

  const knownQuestionsCount = knownQuestions.length;
  const reviewQuestionsCount = reviewQuestions.length;
  const notPracticedQuestionsCount = notPracticedQuestions.length;

  const knownPercent =
    filteredQuestions.length > 0
      ? Math.round((knownQuestionsCount / filteredQuestions.length) * 100)
      : 0;

  const reviewPercent =
    filteredQuestions.length > 0
      ? Math.round((reviewQuestionsCount / filteredQuestions.length) * 100)
      : 0;

  const notPracticedPercent =
    filteredQuestions.length > 0
      ? Math.max(0, 100 - knownPercent - reviewPercent)
      : 0;

  const practiceQueue = getPracticeQueue(filteredQuestions, questionStatuses);

  const practiceNowQuestions = getRotatedQuestions(
    practiceQueue,
    quickSetOffset,
    QUICK_SESSION_SIZE
  );

  const lessonGroups = groupQuestionsByLesson(filteredQuestions);

  const visibleAllQuestions = filteredQuestions.slice(
    0,
    visibleAllQuestionsCount
  );

  const hasMoreAllQuestions =
    visibleAllQuestions.length < filteredQuestions.length;

  const viewTabs: Array<{
    id: InterviewView;
    label: string;
    helper: string;
  }> = [
    {
      id: "practice-now",
      label: "Practice now",
      helper: "A small selected set for one focused session.",
    },
    {
      id: "review-later",
      label: "Review later",
      helper: "Only questions you marked as shaky.",
    },
    {
      id: "by-lesson",
      label: "By lesson",
      helper: "Open a lesson group and revise topic by topic.",
    },
    {
      id: "all",
      label: "All questions",
      helper: "Browse everything when you want a full review.",
    },
  ];

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

  function handleRefreshPracticeSet() {
    setQuickSetOffset((currentOffset) => currentOffset + QUICK_SESSION_SIZE);
    setOpenQuestionId(null);
  }

  function handleShowMoreQuestions() {
    setVisibleAllQuestionsCount(
      (currentCount) => currentCount + ALL_QUESTIONS_STEP
    );
  }

  function renderQuestionCard(question: InterviewQuestionViewModel) {
    const isOpen = openQuestionId === question.id;
    const currentStatus = questionStatuses[question.id];

    return (
      <article
        className={`interview-card ${
          currentStatus ? `interview-card-${currentStatus}` : ""
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
                currentStatus ? `interview-status-pill-${currentStatus}` : ""
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

        <p className="interview-section-label">{question.sectionTitle}</p>

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
                  onClick={() => handleMarkQuestion(question, "known")}
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
                  onClick={() => handleMarkQuestion(question, "review")}
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
  }

  return (
    <main className="page interview-page">
      <section className="page-intro interview-intro">
        <p className="eyebrow">Interview mode</p>
        <h1>Practice explaining Python clearly.</h1>

        <p>
          Pick a small set, answer aloud first, then reveal the suggested
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
                onClick={() => setSelectedTrackSlug(track.slug)}
              >
                {track.title}
              </button>
            ))}
          </section>

          <section className="interview-summary-card">
            <div>
              <p className="interview-card-kicker">Question bank</p>
              <h2>{filteredQuestions.length}</h2>
              <p>
                Question{filteredQuestions.length === 1 ? "" : "s"} available
                for this filter.
              </p>
            </div>

            <div>
              <p className="interview-card-kicker">Known</p>
              <h2>{knownQuestionsCount}</h2>
              <p>Questions you marked as clear.</p>
            </div>

            <div>
              <p className="interview-card-kicker">Review later</p>
              <h2>{reviewQuestionsCount}</h2>
              <p>Questions you want to return to.</p>
            </div>

            <div>
              <p className="interview-card-kicker">Not practiced</p>
              <h2>{notPracticedQuestionsCount}</h2>
              <p>Questions still waiting for a first pass.</p>
            </div>
          </section>

          <section
            className="interview-status-overview"
            aria-label="Interview question status overview"
          >
            <div className="interview-status-overview-copy">
              <p className="interview-card-kicker">Question status</p>
              <h2>Your interview bank at a glance</h2>
            </div>

            <div className="interview-status-bar" aria-hidden="true">
              <span
                className="interview-status-bar-known"
                style={{ width: `${knownPercent}%` }}
              />
              <span
                className="interview-status-bar-review"
                style={{ width: `${reviewPercent}%` }}
              />
              <span
                className="interview-status-bar-new"
                style={{ width: `${notPracticedPercent}%` }}
              />
            </div>

            <div className="interview-status-legend">
              <span>
                <i className="interview-dot interview-dot-known" />
                Known
              </span>
              <span>
                <i className="interview-dot interview-dot-review" />
                Review later
              </span>
              <span>
                <i className="interview-dot interview-dot-new" />
                Not practiced
              </span>
            </div>
          </section>

          <section className="interview-mode-tabs" aria-label="Practice modes">
            {viewTabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`interview-mode-tab ${
                  selectedView === tab.id ? "interview-mode-tab-active" : ""
                }`}
                onClick={() => setSelectedView(tab.id)}
              >
                <span>{tab.label}</span>
                <small>{tab.helper}</small>
              </button>
            ))}
          </section>

          {filteredQuestions.length === 0 ? (
            <section className="empty-progress-card">
              <h2>No interview questions yet.</h2>
              <p>
                Add an interview section with question items to a published
                lesson, and the questions will appear here.
              </p>
            </section>
          ) : (
            <>
              {selectedView === "practice-now" && (
                <section className="interview-view-section">
                  <div className="interview-view-header">
                    <div>
                      <p className="eyebrow">Practice now</p>
                      <h2>One focused interview drill</h2>
                      <p>
                        This set prioritizes review questions first, then fresh
                        questions, then known questions for light refresh.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="interview-small-button"
                      onClick={handleRefreshPracticeSet}
                      disabled={practiceQueue.length <= QUICK_SESSION_SIZE}
                    >
                      Refresh set
                    </button>
                  </div>

                  <div className="interview-list">
                    {practiceNowQuestions.map((question) =>
                      renderQuestionCard(question)
                    )}
                  </div>
                </section>
              )}

              {selectedView === "review-later" && (
                <section className="interview-view-section">
                  <div className="interview-view-header">
                    <div>
                      <p className="eyebrow">Review later</p>
                      <h2>Questions you marked as shaky</h2>
                      <p>
                        These are the questions that deserve another calm,
                        focused explanation round.
                      </p>
                    </div>
                  </div>

                  {reviewQuestions.length > 0 ? (
                    <div className="interview-list">
                      {reviewQuestions.map((question) =>
                        renderQuestionCard(question)
                      )}
                    </div>
                  ) : (
                    <div className="empty-progress-card empty-progress-card-success">
                      <h3>No review questions right now.</h3>
                      <p>
                        When a question feels shaky, mark it as “Review later”.
                        It will appear here.
                      </p>
                    </div>
                  )}
                </section>
              )}

              {selectedView === "by-lesson" && (
                <section className="interview-view-section">
                  <div className="interview-view-header">
                    <div>
                      <p className="eyebrow">By lesson</p>
                      <h2>Practice topic by topic</h2>
                      <p>
                        Open a lesson group when you want targeted revision
                        instead of a mixed interview drill.
                      </p>
                    </div>
                  </div>

                  <div className="interview-lesson-groups">
                    {lessonGroups.map((group) => (
                      <details
                        className="interview-lesson-group"
                        key={group.lessonSlug}
                      >
                        <summary>
                          <span>
                            <strong>{group.lessonTitle}</strong>
                            <small>{group.trackTitle}</small>
                          </span>

                          <b>
                            {group.questions.length} question
                            {group.questions.length === 1 ? "" : "s"}
                          </b>
                        </summary>

                        <div className="interview-list interview-list-compact">
                          {group.questions.map((question) =>
                            renderQuestionCard(question)
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {selectedView === "all" && (
                <section className="interview-view-section">
                  <div className="interview-view-header">
                    <div>
                      <p className="eyebrow">All questions</p>
                      <h2>Full question bank</h2>
                      <p>
                        Browse every question available for this filter. Use this view when you want
                        a full review before an interview.
                      </p>
                    </div>
                  </div>

                  <div className="interview-list">
                    {visibleAllQuestions.map((question) =>
                      renderQuestionCard(question)
                    )}
                  </div>

                  {hasMoreAllQuestions && (
                    <div className="interview-show-more">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={handleShowMoreQuestions}
                      >
                        Show more questions
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}

export default InterviewModePage;