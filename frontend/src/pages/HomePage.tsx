import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  fetchHomeSummary,
  type HomeSummary,
  type HomeSummaryCta,
} from "../api/homeSummaryApi";
import { useAuth } from "../features/auth/AuthContext";

const guestHomeSummary: HomeSummary = {
  hasProgress: false,
  completedLessonsCount: 0,
  totalLessonsCount: 0,
  allLessonsCompleted: false,
  nextLesson: {
    id: "variables-and-assignment",
    slug: "variables-and-assignment",
    title: "Variables and Assignment",
    lessonNumber: 1,
    level: "beginner",
    duration: "10–15 min",
    summary: "Start with the idea that variables are names pointing to values.",
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
    to: "#how-it-works",
  },
};

interface HomeButtonLinkProps {
  to: string;
  className: string;
  children: ReactNode;
}

function HomeButtonLink({ to, className, children }: HomeButtonLinkProps) {
  const normalizedTo = to === "/#how-it-works" ? "#how-it-works" : to;

  if (normalizedTo.startsWith("#")) {
    return (
      <a href={normalizedTo} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={normalizedTo} className={className}>
      {children}
    </Link>
  );
}

function getLearningPathCta(summary: HomeSummary): HomeSummaryCta {
  if (summary.allLessonsCompleted) {
    return {
      label: "Review progress",
      to: "/dashboard",
    };
  }

  if (summary.nextLesson?.slug) {
    return {
      label: summary.hasProgress ? "Continue lesson" : "Start Python Core",
      to: `/lessons/${summary.nextLesson.slug}`,
    };
  }

  return {
    label: "View tracks",
    to: "/tracks",
  };
}

function getLearningPathText(summary: HomeSummary) {
  if (summary.allLessonsCompleted) {
    return {
      eyebrow: "Course complete",
      title: "Review Python Core",
      description:
        "You have completed the available lessons. Use your dashboard to review progress or practice interview answers.",
    };
  }

  if (summary.hasProgress && summary.nextLesson) {
    return {
      eyebrow: "Continue here",
      title: "Continue Python Core",
      description: `Your next lesson is ${summary.nextLesson.title}. Keep going while the idea is still warm.`,
    };
  }

  return {
    eyebrow: "Start here",
    title: "Python Core",
    description:
      "Begin with variables and assignment, then move step by step through the foundations every junior developer should explain with confidence.",
  };
}

function HomePage() {
  const { currentUser, isAuthLoading } = useAuth();
  const [homeSummary, setHomeSummary] =
    useState<HomeSummary>(guestHomeSummary);
  const [isHomeSummaryLoading, setIsHomeSummaryLoading] = useState(false);

  useEffect(() => {
    let shouldIgnore = false;

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
        const idToken = await currentUser.getIdToken();
        const summary = await fetchHomeSummary(idToken);

        if (!shouldIgnore) {
          setHomeSummary(summary);
        }
      } catch (error) {
        console.error("Failed to load homepage summary:", error);

        if (!shouldIgnore) {
          setHomeSummary(guestHomeSummary);
        }
      } finally {
        if (!shouldIgnore) {
          setIsHomeSummaryLoading(false);
        }
      }
    }

    loadHomeSummary();

    return () => {
      shouldIgnore = true;
    };
  }, [currentUser, isAuthLoading]);

  const heroLines =
    homeSummary.heroBite.lines.length > 0
      ? homeSummary.heroBite.lines
      : guestHomeSummary.heroBite.lines;

  const learningPath = getLearningPathText(homeSummary);
  const learningPathCta = getLearningPathCta(homeSummary);

  return (
    <main
      className="page home-page"
      aria-busy={isHomeSummaryLoading ? "true" : "false"}
    >
      <section className="hero home-hero">
        <div className="home-hero-content">
          <p className="eyebrow">Junior Python interview prep</p>

          <h1>Learn Python one tasty concept at a time.</h1>

          <p className="hero-text">
            Tasty Python helps you understand Python through short lessons,
            cozy metaphors, instant practice feedback, a real code runner, and
            interview-style explanations.
          </p>

          <div className="hero-actions">
            <HomeButtonLink
              to={homeSummary.primaryCta.to}
              className="button button-primary"
            >
              {homeSummary.primaryCta.label}
            </HomeButtonLink>

            <HomeButtonLink
              to={homeSummary.secondaryCta.to}
              className="button button-secondary"
            >
              {homeSummary.secondaryCta.label}
            </HomeButtonLink>
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

            <div className="home-code-preview">
              {heroLines.slice(0, 3).map((line, index) => (
                <code key={`${line}-${index}`}>{line}</code>
              ))}
            </div>

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
          <p className="eyebrow">{learningPath.eyebrow}</p>
          <h2>{learningPath.title}</h2>

          <p>{learningPath.description}</p>
        </div>

        <HomeButtonLink
          to={learningPathCta.to}
          className="button button-primary"
        >
          {learningPathCta.label}
        </HomeButtonLink>
      </section>

      <section className="home-about">
        <div>
          <p className="eyebrow">About the project</p>
          <h2>Built for junior Python interview prep.</h2>

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
          <Link to="/tracks" className="button button-primary">
            View tracks
          </Link>

          <Link to="/dashboard" className="button button-secondary">
            See progress
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;