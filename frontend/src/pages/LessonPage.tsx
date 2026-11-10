import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchLessonContentBySlug } from "../api/lessonContentApi";
import { fetchLessonBySlug, fetchLessonsByTrackSlug } from "../api/lessonsApi";
import LessonCompletionButton from "../components/LessonCompletionButton";
import LessonHero from "../components/LessonHero";
import LessonNavigation from "../components/LessonNavigation";
import LessonSectionRenderer from "../components/LessonSectionRenderer";
import { getLessonBySlug, getLessonNavigation } from "../data/lessons";
import { getLessonContentBySlug } from "../data/lessonContent";
import { getHeroVisualByLessonSlug } from "../data/heroVisuals";
import type { LessonPreview } from "../types/curriculum";
import type { LessonContent } from "../types/lesson";

interface SavedScrollPosition {
  anchor?: string;
  offset?: number;
  y?: number;
}

interface LessonNavigationState {
  previousLesson?: LessonPreview;
  nextLesson?: LessonPreview;
}

function getTrackNavigation(
  currentSlug: string,
  trackLessons: LessonPreview[]
): LessonNavigationState | undefined {
  const orderedLessons = [...trackLessons].sort((a, b) => a.order - b.order);
  const currentIndex = orderedLessons.findIndex(
    (candidate) => candidate.slug === currentSlug
  );

  if (currentIndex === -1) {
    return undefined;
  }

  const previousCandidate = orderedLessons[currentIndex - 1];
  const nextCandidate = orderedLessons[currentIndex + 1];

  const isAvailable = (candidate?: LessonPreview) =>
    candidate?.status === "published" && candidate.hasContent !== false;

  return {
    previousLesson: isAvailable(previousCandidate) ? previousCandidate : undefined,
    nextLesson: isAvailable(nextCandidate) ? nextCandidate : undefined,
  };
}

function LessonPage() {
  const { lessonSlug } = useParams();
  const [lesson, setLesson] = useState<LessonPreview | undefined>(undefined);
  const [lessonContent, setLessonContent] = useState<
    LessonContent | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hasRestoredScrollRef = useRef(false);
  const shouldStartAtTopRef = useRef(false);
  const navigationHandledSlugRef = useRef<string | undefined>(undefined);

  const lessonScrollStorageKey = lessonSlug
    ? `tasty-python-scroll-anchor-${lessonSlug}`
    : "tasty-python-scroll-anchor";

  const [navigation, setNavigation] = useState<LessonNavigationState>({});
  const { previousLesson, nextLesson } = navigation;

  useEffect(() => {
    async function loadLesson() {
      if (!lessonSlug) {
        setIsLoading(false);
        return;
      }

      // Consume the one-shot navigation instruction once per lesson URL.
      // The guard also keeps it intact under React StrictMode's effect replay.
      if (navigationHandledSlugRef.current !== lessonSlug) {
        navigationHandledSlugRef.current = lessonSlug;
        const nextLessonKey = "tasty-python-start-next-lesson-at-top";
        shouldStartAtTopRef.current =
          sessionStorage.getItem(nextLessonKey) === lessonSlug;
        if (shouldStartAtTopRef.current) {
          sessionStorage.removeItem(nextLessonKey);
        }
      }

      setIsLoading(true);
      setLesson(undefined);
      setLessonContent(undefined);
      setNavigation({});
      hasRestoredScrollRef.current = false;

      try {
        const lessonFromApi = await fetchLessonBySlug(lessonSlug);

        setLesson(lessonFromApi);
        setErrorMessage("");

        // Navigation follows live track data, not a potentially stale local list.
        // If the track request fails, retain the existing local fallback.
        try {
          const trackLessons = await fetchLessonsByTrackSlug(lessonFromApi.trackSlug);
          setNavigation(
            getTrackNavigation(lessonSlug, trackLessons) ??
            getLessonNavigation(lessonSlug)
          );
        } catch {
          setNavigation(getLessonNavigation(lessonSlug));
        }

        if (lessonFromApi.status === "published" && lessonFromApi.hasContent) {
          const lessonContentFromApi = await fetchLessonContentBySlug(
            lessonSlug
          );

          setLessonContent(lessonContentFromApi);
        } else {
          setLessonContent(undefined);
        }
      } catch {
        const localLesson = getLessonBySlug(lessonSlug);
        const localLessonContent = getLessonContentBySlug(lessonSlug);

        setLesson(localLesson);
        setLessonContent(localLessonContent);
        setNavigation(getLessonNavigation(lessonSlug));
        setErrorMessage(
          "Backend is not available right now. Showing local demo data."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLesson();
  }, [lessonSlug]);

  useEffect(() => {
    if (!lessonSlug) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [lessonSlug]);

  function getClosestAnchor(): SavedScrollPosition {
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lesson-scroll-anchor]")
    );

    if (anchors.length === 0) {
      return {
        y: window.scrollY,
      };
    }

    const targetTop = 130;

    let closestAnchor = anchors[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    anchors.forEach((anchor) => {
      const distance = Math.abs(
        anchor.getBoundingClientRect().top - targetTop
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestAnchor = anchor;
      }
    });

    const anchorTop =
      closestAnchor.getBoundingClientRect().top + window.scrollY;

    return {
      anchor: closestAnchor.dataset.lessonScrollAnchor,
      offset: window.scrollY - anchorTop,
      y: window.scrollY,
    };
  }

  function saveScrollPosition() {
    if (!lessonSlug || !hasRestoredScrollRef.current) {
      return;
    }

    const closestAnchor = getClosestAnchor();

    localStorage.setItem(
      lessonScrollStorageKey,
      JSON.stringify(closestAnchor)
    );
  }

  useEffect(() => {
    if (!lessonSlug) {
      return;
    }

    let animationFrameId = 0;

    function handleScroll() {
      cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        saveScrollPosition();
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        saveScrollPosition();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", saveScrollPosition);
    window.addEventListener("pagehide", saveScrollPosition);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      // Do NOT save on route cleanup: React may already have rendered
      // the destination page, which would overwrite the old reading position.

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", saveScrollPosition);
      window.removeEventListener("pagehide", saveScrollPosition);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lessonSlug, lessonScrollStorageKey]);

  useEffect(() => {
    if (
      isLoading ||
      !lessonSlug ||
      !lessonContent ||
      lesson?.slug !== lessonSlug ||
      lessonContent.slug !== lessonSlug
    ) {
      return;
    }

    if (shouldStartAtTopRef.current) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      hasRestoredScrollRef.current = true;
      return;
    }

    const rawSavedPosition = localStorage.getItem(lessonScrollStorageKey);

    if (!rawSavedPosition) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      hasRestoredScrollRef.current = true;
      return;
    }

    let savedPosition: SavedScrollPosition;

    try {
      savedPosition = JSON.parse(rawSavedPosition) as SavedScrollPosition;
    } catch {
      hasRestoredScrollRef.current = true;
      return;
    }

    function restoreScrollPosition() {
      if (savedPosition.anchor) {
        const targetAnchor = document.querySelector<HTMLElement>(
          `[data-lesson-scroll-anchor="${savedPosition.anchor}"]`
        );

        if (targetAnchor) {
          const anchorTop =
            targetAnchor.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({
            top: Math.max(0, anchorTop + (savedPosition.offset ?? 0)),
            behavior: "auto",
          });

          return;
        }
      }

      if (typeof savedPosition.y === "number") {
        window.scrollTo({
          top: Math.max(0, savedPosition.y),
          behavior: "auto",
        });
      }
    }

    const restoreTimers = [0, 100, 300, 700, 1200, 2000].map((delay) =>
      window.setTimeout(restoreScrollPosition, delay)
    );

    const unlockSavingTimer = window.setTimeout(() => {
      hasRestoredScrollRef.current = true;
      saveScrollPosition();
    }, 2100);

    return () => {
      restoreTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(unlockSavingTimer);
    };
  }, [isLoading, lessonSlug, lessonContent, lesson, lessonScrollStorageKey]);

  if (isLoading) {
    return (
      <main className="page">
        <section className="loading-box">
          <h1>Loading lesson...</h1>
          <p>Fetching lesson data from the backend API.</p>
        </section>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="page">
        <h1>Lesson not found</h1>
        <p>This lesson does not exist yet.</p>

        <Link to="/tracks" className="button button-primary">
          Back to tracks
        </Link>
      </main>
    );
  }

  if (lesson.status !== "published") {
    return (
      <main className="page">
        <section className="coming-soon-box">
          <span className={`status status-${lesson.status}`}>
            {lesson.status.replace("_", " ")}
          </span>

          <h1>{lesson.title}</h1>

          <p>{lesson.shortDescription}</p>

          {errorMessage && <p className="api-notice">{errorMessage}</p>}

          <p>
            This lesson is visible in the roadmap, but the full content is not
            published yet.
          </p>
        </section>

        <LessonNavigation
          trackSlug={lesson.trackSlug}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </main>
    );
  }

  if (!lessonContent) {
    return (
      <main className="page">
        <section className="coming-soon-box">
          <h1>{lesson.title}</h1>

          {errorMessage && <p className="api-notice">{errorMessage}</p>}

          <p>
            This lesson is marked as published, but its full content has not
            been added yet.
          </p>
        </section>

        <LessonNavigation
          trackSlug={lesson.trackSlug}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </main>
    );
  }

  return (
    <main className="page lesson-page">
      <LessonHero
        order={lesson.order}
        title={lessonContent.title}
        difficulty={lesson.difficulty}
        estimatedTime={lesson.estimatedTime}
        goal={lessonContent.goal}
        errorMessage={errorMessage}
        visual={
          lessonContent.heroVisual ?? getHeroVisualByLessonSlug(lesson.slug)
        }
        conceptLabel={lessonContent.conceptLabel}
        interviewFocus={lessonContent.interviewFocus}
      />

      {lessonContent.sections.map((section) => (
        <LessonSectionRenderer
          section={section}
          lessonSlug={lesson.slug}
          key={section.id}
        />
      ))}

      <LessonCompletionButton
        lessonSlug={lesson.slug}
        trackSlug={lesson.trackSlug}
        nextLesson={nextLesson}
        completionImageUrl={lessonContent.completionImageUrl}
        completionImageAlt={lessonContent.completionImageAlt}
        completionKicker={lessonContent.completionKicker}
        completionTitle={lessonContent.completionTitle}
        completionBody={lessonContent.completionBody}
      />
    </main>
  );
}

export default LessonPage;