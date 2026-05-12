import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHomeSummary, type HomeSummaryResponse } from "../api/homeSummaryApi";
import { useAuth } from "../features/auth/AuthContext";

const guestHomeSummary: HomeSummaryResponse = {
  userId: 0,
  hasProgress: false,
  completedLessonsCount: 0,
  totalLessonsCount: 0,
  allLessonsCompleted: false,
  nextLesson: {
    id: "guest-first-lesson",
    slug: "variables-and-assignment",
    title: "Variables are labels",
    lessonNumber: 1,
    level: "beginner",
    duration: "15–20 min",
    summary:
      "A name can point to a value. Reassignment moves the label. Simple, visual, memorable.",
  },
  heroBite: {
    kicker: "Your first bite",
    title: "Variables are labels",
    lines: ['flavor = "mango"', 'flavor = "chocolate"'],
    description:
      "A name can point to a value. Reassignment moves the label. Simple, visual, memorable.",
  },
  primaryCta: {
    label: "Start learning",
    to: "/lessons/variables-and-assignment",
  },
  secondaryCta: {
    label: "See how it works",
    to: "/#how-it-works",
  },
};

function renderCtaLink(
  cta: HomeSummaryResponse["primaryCta"],
  className: string
) {
  if (cta.to.startsWith("/#")) {
    return (
      <a href={cta.to.replace("/", "")} className={className}>
        {cta.label}
      </a>
    );
  }

  return (
    <Link to={cta.to} className={className}>
      {cta.label}
    </Link>
  );
}

function HomePage() {
  const { currentUser, isAuthLoading, getIdToken } = useAuth();

  const [homeSummary, setHomeSummary] =
    useState<HomeSummaryResponse>(guestHomeSummary);
  const [isHomeSummaryLoading, setIsHomeSummaryLoading] = useState(false);

  useEffect(() => {
    async function loadHomeSummary() {
      if (isAuthLoading) {
        return;
      }

      if (!currentUser) {
        setHomeSummary(guestHomeSummary);
        return;
      }

      setIsHomeSummaryLoading(true);

      try {
        const idToken = await getIdToken();

        if (!idToken) {
          throw new Error("Missing Firebase ID token");
        }

        const summary = await fetchHomeSummary(idToken);
        setHomeSummary(summary);
      } catch {
        setHomeSummary(guestHomeSummary);
      } finally {
        setIsHomeSummaryLoading(false);
      }
    }

    loadHomeSummary();
  }, [currentUser, getIdToken, isAuthLoading]);

  const progressLine = useMemo(() => {
    if (!currentUser) {
      return "Start your Python Core path and save your progress when you sign in.";
    }

    if (homeSummary.allLessonsCompleted) {
      return "You completed every published lesson. Tiny chef hat earned.";
    }

    return `${homeSummary.completedLessonsCount}/${homeSummary.totalLessonsCount} published lessons completed.`;
  }, [currentUser, homeSummary]);

  return (
    <main className="page home-page">
      <section className="hero home-hero">
        <div className="home-hero-content">
          <p className="eyebrow">Junior Python interview prep</p>

          <h1>Learn Python one tasty concept at a time.</h1>

          <p className="hero-text">
            Tasty Python helps you understand Python through short lessons,
            cozy metaphors, instant practice feedback, a real code runner, and
            interview-style explanations.
          </p>

          {currentUser && (
            <p className="home-progress-note">
              {isHomeSummaryLoading ? "Checking your progress..." : progressLine}
            </p>
          )}

          <div className="hero-actions">
            {renderCtaLink(homeSummary.primaryCta, "button button-primary")}
            {renderCtaLink(homeSummary.secondaryCta, "button button-secondary")}
          </div>
        </div>

        <div className="home-hero-card" aria-label="Tasty Python preview">
          <div className="home-hero-card-top">
            <span />
            <span />
            <span />
          </div>

          <div className="home-hero-card-body">
            <p className="home-card-kicker">{homeSummary.heroBite.kicker}</p>
            <h2>{homeSummary.heroBite.title}</h2>

            {homeSummary.heroBite.lines.length > 0 && (
              <div className="home-code-preview">
                {homeSummary.heroBite.lines.map((line) => (
                  <code key={line}>{line}</code>
                ))}
              </div>
            )}

            <p>{homeSummary.heroBite.description}</p>
          </div>
        </div>
      </section>

      <section className="section home-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Small bites. Real progress.</h2>
          <p>
            Each lesson gives you one clear idea, then helps you test it,
            explain it, and remember it.
          </p>
        </div>

        <div className="feature-grid home-feature-grid">
          <article className="feature-card home-feature-card">
            <span className="feature-icon">🥣</span>
            <h3>Tasty metaphors</h3>
            <p>
              Understand abstract ideas through cozy visual examples: bowls,
              labels, recipes, and tiny Python kitchen logic.
            </p>
          </article>

          <article className="feature-card home-feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Instant practice</h3>
            <p>
              Answer small questions after each concept and get feedback while
              the idea is still fresh.
            </p>
          </article>

          <article className="feature-card home-feature-card">
            <span className="feature-icon">👩‍💻</span>
            <h3>Run real Python code</h3>
            <p>
              Write code inside the lesson, run it instantly, and see what
              Python actually returns.
            </p>
          </article>

          <article className="feature-card home-feature-card">
            <span className="feature-icon">🎙️</span>
            <h3>Interview mode</h3>
            <p>
              Practice explaining concepts clearly, then reveal a suggested
              answer when you are ready.
            </p>
          </article>
        </div>
      </section>

      <section className="home-learning-path">
        <div>
          <p className="eyebrow">
            {homeSummary.hasProgress ? "Continue here" : "Start here"}
          </p>

          <h2>Python Core</h2>

          <p>
            Begin with variables and assignment, then move step by step through
            the foundations every junior developer should explain with
            confidence.
          </p>
        </div>

        <Link
          to={
            homeSummary.nextLesson
              ? `/lessons/${homeSummary.nextLesson.slug}`
              : "/dashboard"
          }
          className="button button-primary"
        >
          {homeSummary.nextLesson
            ? homeSummary.hasProgress
              ? "Continue Python Core"
              : "Start Python Core"
            : "Review Python Core"}
        </Link>
      </section>

      <section className="home-about">
        <div>
          <p className="eyebrow">About the project</p>
          <h2>Built for clear, cozy Python learning.</h2>

          <p>
            Tasty Python is built for junior Python interview preparation. It
            turns core Python topics into short lessons with visual metaphors,
            real code practice, instant feedback, and interview-style
            explanations.
          </p>

          <p>
            It is also a portfolio project that brings together frontend
            development, backend content management, learning design, and a
            little cozy kitchen magic.
          </p>
        </div>

        <div className="home-about-actions">
          <Link to="/about-tasty-python" className="button button-primary">
            About Tasty Python
          </Link>

          <Link to="/about-author" className="button button-secondary">
            About the author
          </Link>
        </div>
      </section>

      <section className="home-final-cta">
        <h2>Ready for the next bite?</h2>

        <p>
          Learn a concept, test it, explain it, and keep going. Python gets much
          friendlier when every idea has a picture, a practice task, and a clear
          explanation.
        </p>

        <div className="hero-actions">
          {renderCtaLink(homeSummary.primaryCta, "button button-primary")}

          <Link to="/dashboard" className="button button-secondary">
            See progress
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;