import type { HeroVisual } from "../types/heroVisual";

type LessonHeroProps = {
  order: number;
  title: string;
  difficulty: string;
  estimatedTime: string;
  goal: string;
  errorMessage?: string;
  visual?: HeroVisual;
  conceptLabel?: string;
  interviewFocus?: string;
};

const defaultHeroVisual: HeroVisual = {
  variant: "recipe-card",
  tone: "warm",
  kicker: "Today's recipe",
  title: "Label board",
  lines: ['flavor = "mango"', "level = 1", 'flavor = "berry"'],
  chips: ["names", "values", "reassignment"],
};

function getDifficultyClassName(difficulty: string) {
  const normalizedDifficulty = difficulty.trim().toLowerCase();

  if (normalizedDifficulty === "foundation") {
    return "lesson-meta-pill-foundation";
  }

  if (normalizedDifficulty === "core") {
    return "lesson-meta-pill-core";
  }

  if (normalizedDifficulty === "applied") {
    return "lesson-meta-pill-applied";
  }

  if (normalizedDifficulty === "challenge") {
    return "lesson-meta-pill-challenge";
  }

  return "";
}

function LessonHero({
  order,
  title,
  difficulty,
  estimatedTime,
  goal,
  errorMessage,
  visual = defaultHeroVisual,
  conceptLabel = "interview mental model",
  interviewFocus = "What really happens when a variable is reassigned?",
}: LessonHeroProps) {
  const visualTone = visual.tone ?? "warm";

  return (
    <section className="lesson-hero">
      <div className="lesson-hero__content">
        <div className="lesson-hero__main">
          <p className="eyebrow">Lesson {order}</p>

          <h1>{title}</h1>

          <div className="lesson-hero__meta-list">
            <span
              className={`lesson-meta-pill ${getDifficultyClassName(
                difficulty
              )}`}
            >
              {difficulty}
            </span>

            <span className="lesson-meta-pill">{estimatedTime}</span>

            <span className="lesson-meta-pill">{conceptLabel}</span>
          </div>

          <p className="lesson-hero__goal">{goal}</p>

          <div className="lesson-hero__focus" aria-label="Interview focus">
            <span className="lesson-hero__focus-label">Interview focus</span>
            <p>{interviewFocus}</p>
          </div>

          <div className="lesson-hero__actions">
            <a className="lesson-hero__button lesson-hero__button--primary" href="#lesson-start">
              Start lesson
            </a>

            <a className="lesson-hero__button lesson-hero__button--ghost" href="#lesson-practice">
              Jump to practice
            </a>
          </div>

          {errorMessage && <p className="api-notice">{errorMessage}</p>}
        </div>

        <aside
          className={`lesson-hero__visual lesson-hero__visual--${visual.variant} lesson-hero__visual--${visualTone}`}
          aria-label="Lesson visual summary"
        >
          <div className="lesson-hero__visual-top" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="lesson-hero__visual-body">
            <p className="lesson-hero__visual-kicker">{visual.kicker}</p>

            <h2>{visual.title}</h2>

            <HeroVisualContent visual={visual} />
          </div>
        </aside>
      </div>
    </section>
  );
}

type HeroVisualContentProps = {
  visual: HeroVisual;
};

function HeroVisualContent({ visual }: HeroVisualContentProps) {
  if (visual.variant === "recipe-card") {
    return (
      <>
        <div className="lesson-hero__recipe-card">
          {visual.lines.map((line, index) => (
            <div
              className={`lesson-hero__recipe-row ${
                index === visual.lines.length - 1
                  ? "lesson-hero__recipe-row--active"
                  : ""
              }`}
              key={`${line}-${index}`}
            >
              <span>{index + 1}</span>
              <code>{line}</code>
            </div>
          ))}
        </div>

        <HeroChips chips={visual.chips} />
      </>
    );
  }

  if (visual.variant === "ingredient-board") {
    return (
      <>
        <div className="lesson-hero__ingredient-board">
          {visual.lines.map((line, index) => (
            <div
              className="lesson-hero__ingredient-note"
              key={`${line}-${index}`}
            >
              {line}
            </div>
          ))}
        </div>

        <HeroChips chips={visual.chips} />
      </>
    );
  }

  if (visual.variant === "terminal-card") {
    return (
      <>
        <div className="lesson-hero__terminal-card">
          {visual.lines.map((line, index) => (
            <code key={`${line}-${index}`}>
              <span>&gt;&gt;&gt;</span> {line}
            </code>
          ))}
        </div>

        <HeroChips chips={visual.chips} />
      </>
    );
  }

  return (
    <>
      <div className="lesson-hero__code-card">
        {visual.lines.map((line, index) => (
          <code
            className={`lesson-hero__code-line ${
              index === visual.lines.length - 1
                ? "lesson-hero__code-line--active"
                : ""
            }`}
            key={`${line}-${index}`}
          >
            {line}
          </code>
        ))}
      </div>

      <HeroChips chips={visual.chips} />
    </>
  );
}

type HeroChipsProps = {
  chips: string[];
};

function HeroChips({ chips }: HeroChipsProps) {
  return (
    <div className="lesson-hero__chips">
      {chips.map((chip, index) => (
        <span
          key={`${chip}-${index}`}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

export default LessonHero;