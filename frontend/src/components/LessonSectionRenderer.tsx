import { useState } from "react";
import CodeBlock from "./CodeBlock";
import PythonCodeRunner from "./PythonCodeRunner";
import type { PythonRunResult } from "./PythonCodeRunner";
import {
  recordPracticeAttempt,
  type PracticeExerciseType,
} from "../features/practice/practiceProgress";
import type { LessonSection } from "../types/lesson";

interface LessonSectionRendererProps {
  section: LessonSection;
  lessonSlug?: string;
}

const sectionDecorations: Record<
  string,
  {
    label: string;
    icon: string;
  }
> = {
  metaphor: {
    label: "Tasty metaphor",
    icon: "🍓",
  },
  theory: {
    label: "Core idea",
    icon: "📚",
  },
  code_example: {
    label: "Code kitchen",
    icon: "👩‍💻",
  },
  interview: {
    label: "Interview mode",
    icon: "🎙️",
  },
  trap_zone: {
    label: "Trap zone",
    icon: "⚠️",
  },
  practice: {
    label: "Practice",
    icon: "✍️",
  },
  cheat_sheet: {
    label: "Cheat sheet",
    icon: "🧾",
  },
  answer_key: {
    label: "Answer key",
    icon: "✅",
  },
};

const lessonOneSectionVisuals: Record<
  string,
  {
    src: string;
    alt: string;
  }
> = {
  "tasty metaphor": {
    src: "/lesson-images/lesson1_jars.png",
    alt: "Cozy kitchen shelf with jars and labels showing variables as labels.",
  },
  "main code example": {
    src: "/lesson-images/lesson1_cups.png",
    alt: "Two café cups showing reassignment as a label moving from one cup to another.",
  },
};

const lessonOneCodingTaskVisual = {
  src: "/lesson-images/lesson1_receipt.png",
  alt: "Cozy café receipt scene showing drink, cups, price per cup, and total.",
};

interface MultipleChoiceOption {
  key: string;
  text: string;
}

function renderTextBlocks(text: string, baseKey: string) {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => <p key={`${baseKey}-${index}`}>{part}</p>);
}

function getItemTone(sectionType: string, itemTitle?: string) {
  const normalizedTitle = (itemTitle ?? "").toLowerCase();

  if (sectionType === "trap_zone") {
    if (normalizedTitle.includes("correct version")) {
      return "success";
    }

    return "danger";
  }

  return "default";
}

function normalizeAnswer(value?: string) {
  return value?.trim().slice(0, 1).toUpperCase() ?? "";
}

function isMultipleChoiceItem(item: NonNullable<LessonSection["items"]>[number]) {
  const correctAnswer = normalizeAnswer(item.output);
  const hasCorrectAnswer = /^[A-Z]$/.test(correctAnswer);
  const hasOptions = /(^|\n)\s*[A-Z][).]\s+/.test(item.content);

  return hasCorrectAnswer && hasOptions;
}

function parseMultipleChoiceContent(content: string) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const options: MultipleChoiceOption[] = [];
  const questionLines: string[] = [];

  for (const line of lines) {
    const optionMatch = line.match(/^([A-Z])[).]\s+(.+)$/);

    if (optionMatch) {
      options.push({
        key: optionMatch[1],
        text: optionMatch[2],
      });
    } else {
      questionLines.push(line);
    }
  }

  return {
    question: questionLines.join("\n\n"),
    options,
  };
}

function getSectionVisual(lessonSlug: string | undefined, sectionTitle: string) {
  if (lessonSlug !== "variables-and-assignment") {
    return null;
  }

  return lessonOneSectionVisuals[sectionTitle.toLowerCase()] ?? null;
}

function shouldShowCodingTaskVisual(
  lessonSlug: string | undefined,
  itemTitle?: string
) {
  if (lessonSlug !== "variables-and-assignment") {
    return false;
  }

  return (itemTitle ?? "").toLowerCase().includes("coding task");
}

function isMainCodeExampleSection(section: LessonSection) {
  return section.title.toLowerCase() === "main code example";
}

function getPracticeItemKey(
  sectionId: string,
  item: NonNullable<LessonSection["items"]>[number],
  index: number
) {
  return item.id
    ? `${sectionId}-${item.id}`
    : `${sectionId}-${index}-${item.title ?? "untitled"}`;
}

function savePracticeAttempt(params: {
  lessonSlug?: string;
  sectionId: string;
  item: NonNullable<LessonSection["items"]>[number];
  index: number;
  exerciseType: PracticeExerciseType;
  isCorrect: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
  actualOutput?: string;
  expectedOutput?: string;
  errorOutput?: string;
}) {
  if (!params.lessonSlug) {
    return;
  }

  recordPracticeAttempt({
    lessonSlug: params.lessonSlug,
    sectionId: params.sectionId,
    itemKey: getPracticeItemKey(params.sectionId, params.item, params.index),
    itemTitle: params.item.title ?? `Practice item ${params.index + 1}`,
    exerciseType: params.exerciseType,
    isCorrect: params.isCorrect,
    selectedAnswer: params.selectedAnswer,
    correctAnswer: params.correctAnswer,
    actualOutput: params.actualOutput,
    expectedOutput: params.expectedOutput,
    errorOutput: params.errorOutput,
  });
}

interface InlineLessonImageProps {
  src: string;
  alt: string;
  variant?: "section" | "coding";
}

function InlineLessonImage({
  src,
  alt,
  variant = "section",
}: InlineLessonImageProps) {
  return (
    <figure className={`lesson-inline-image lesson-inline-image-${variant}`}>
      <img src={src} alt={alt} />
    </figure>
  );
}

interface InterviewAccordionItemProps {
  sectionId: string;
  item: NonNullable<LessonSection["items"]>[number];
  index: number;
}

function InterviewAccordionItem({
  sectionId,
  item,
  index,
}: InterviewAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="lesson-accordion"
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
    >
      <summary>
        <span className="lesson-accordion-title">
          {item.title || `Question ${index + 1}`}
        </span>

        <span className="lesson-accordion-toggle">
          {isOpen ? "Hide answer" : "Reveal answer"}
        </span>
      </summary>

      <div className="lesson-accordion-content">
        <p className="lesson-accordion-answer-label">Suggested answer</p>

        {item.content
          ? renderTextBlocks(
              item.content,
              `${sectionId}-interview-answer-${index}`
            )
          : null}

        {item.code && (
          <CodeBlock code={item.code} language="python" title="Python" />
        )}

        {item.output && (
          <CodeBlock
            code={item.output}
            language="plaintext"
            title="Output"
            variant="output"
          />
        )}
      </div>
    </details>
  );
}

interface MultipleChoiceExerciseProps {
  sectionId: string;
  item: NonNullable<LessonSection["items"]>[number];
  index: number;
  lessonSlug?: string;
}

function MultipleChoiceExercise({
  sectionId,
  item,
  index,
  lessonSlug,
}: MultipleChoiceExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const correctAnswer = normalizeAnswer(item.output);
  const { question, options } = parseMultipleChoiceContent(item.content);

  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === correctAnswer;

  function handleSelectAnswer(answer: string) {
    const answerIsCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);

    savePracticeAttempt({
      lessonSlug,
      sectionId,
      item,
      index,
      exerciseType: "multiple_choice",
      isCorrect: answerIsCorrect,
      selectedAnswer: answer,
      correctAnswer,
    });
  }

  return (
    <article className="lesson-practice-exercise">
      {item.title && <h3>{item.title}</h3>}

      {question && (
        <div className="lesson-question-box">
          <p className="lesson-question-label">Question</p>
          {renderTextBlocks(question, `${sectionId}-practice-question-${index}`)}
        </div>
      )}

      {item.code && (
        <CodeBlock code={item.code} language="python" title="Python" />
      )}

      <div className="lesson-choice-list">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          const isCorrectOption = option.key === correctAnswer;

          let optionClassName = "lesson-choice-button";

          if (hasAnswered && isSelected && isCorrectOption) {
            optionClassName += " lesson-choice-button-correct";
          } else if (hasAnswered && isSelected && !isCorrectOption) {
            optionClassName += " lesson-choice-button-wrong";
          } else if (isSelected) {
            optionClassName += " lesson-choice-button-selected";
          }

          return (
            <button
              className={optionClassName}
              key={option.key}
              type="button"
              onClick={() => {
                handleSelectAnswer(option.key);
              }}
            >
              <span className="lesson-choice-key">{option.key}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <p
          className={`lesson-choice-feedback ${
            isCorrect
              ? "lesson-choice-feedback-correct"
              : "lesson-choice-feedback-wrong"
          }`}
        >
          {isCorrect
            ? "Correct. Nice — the concept landed."
            : "Not quite. Try again before checking the next one."}
        </p>
      )}
    </article>
  );
}

interface CodingTaskExerciseProps {
  sectionId: string;
  item: NonNullable<LessonSection["items"]>[number];
  index: number;
  lessonSlug?: string;
}

function CodingTaskExercise({
  sectionId,
  item,
  index,
  lessonSlug,
}: CodingTaskExerciseProps) {
  const showCodingTaskVisual = shouldShowCodingTaskVisual(
    lessonSlug,
    item.title
  );

  function handleRunComplete(result: PythonRunResult) {
    savePracticeAttempt({
      lessonSlug,
      sectionId,
      item,
      index,
      exerciseType: "coding",
      isCorrect: result.isCorrect,
      actualOutput: result.stdout,
      expectedOutput: result.expectedOutput,
      errorOutput: result.stderr,
    });
  }

  return (
    <article className="lesson-practice-exercise lesson-practice-coding-task">
      {item.title && <h3>{item.title}</h3>}

      {showCodingTaskVisual && (
        <InlineLessonImage
          src={lessonOneCodingTaskVisual.src}
          alt={lessonOneCodingTaskVisual.alt}
          variant="coding"
        />
      )}

      {item.content && (
        <div className="lesson-question-box">
          <p className="lesson-question-label">Coding task</p>
          {renderTextBlocks(item.content, `${sectionId}-coding-task-${index}`)}
        </div>
      )}

      <PythonCodeRunner
        starterCode={item.code ?? ""}
        expectedOutput={item.output ?? ""}
        onRunComplete={handleRunComplete}
      />
    </article>
  );
}

function LessonSectionRenderer({
  section,
  lessonSlug,
}: LessonSectionRendererProps) {
  const decoration = sectionDecorations[section.type] ?? {
    label: "Section",
    icon: "📄",
  };

  const sectionVisual = getSectionVisual(lessonSlug, section.title);

  const isInterviewSection = section.type === "interview";
  const isPracticeSection = section.type === "practice";
  const isMainCodeExample = isMainCodeExampleSection(section);

  return (
    <section className={`lesson-section lesson-section-${section.type}`}>
      <div className="lesson-section-header">
        <span className="lesson-section-icon">{decoration.icon}</span>

        <div>
          <p className="lesson-section-kicker">{decoration.label}</p>
          <h2>{section.title}</h2>
        </div>
      </div>

      {sectionVisual && !isMainCodeExample && (
        <InlineLessonImage src={sectionVisual.src} alt={sectionVisual.alt} />
      )}

      {isMainCodeExample && section.code && (
        <CodeBlock code={section.code} language="python" title="Python" />
      )}

      {isMainCodeExample && section.output && (
        <CodeBlock
          code={section.output}
          language="plaintext"
          title="Output"
          variant="output"
        />
      )}

      {section.paragraphs?.map((paragraph, index) => (
        <p key={`${section.id}-paragraph-${index}`}>{paragraph}</p>
      ))}

      {sectionVisual && isMainCodeExample && (
        <InlineLessonImage src={sectionVisual.src} alt={sectionVisual.alt} />
      )}

      {!isMainCodeExample && section.code && (
        <CodeBlock code={section.code} language="python" title="Python" />
      )}

      {!isMainCodeExample && section.output && (
        <CodeBlock
          code={section.output}
          language="plaintext"
          title="Output"
          variant="output"
        />
      )}

      {section.items && isInterviewSection && (
        <div className="lesson-accordion-list">
          {section.items.map((item, index) => (
            <InterviewAccordionItem
              key={`${section.id}-interview-${index}`}
              sectionId={section.id}
              item={item}
              index={index}
            />
          ))}
        </div>
      )}

      {section.items && isPracticeSection && (
        <div className="lesson-practice-list">
          {section.items.map((item, index) =>
            isMultipleChoiceItem(item) ? (
              <MultipleChoiceExercise
                key={`${section.id}-practice-${index}`}
                sectionId={section.id}
                item={item}
                index={index}
                lessonSlug={lessonSlug}
              />
            ) : (
              <CodingTaskExercise
                key={`${section.id}-coding-${index}`}
                sectionId={section.id}
                item={item}
                index={index}
                lessonSlug={lessonSlug}
              />
            )
          )}
        </div>
      )}

      {section.items && !isInterviewSection && !isPracticeSection && (
        <div className="lesson-items">
          {section.items.map((item, index) => {
            const tone = getItemTone(section.type, item.title);

            return (
              <article
                className={`lesson-item lesson-item-${tone}`}
                key={`${section.id}-${index}`}
              >
                {item.title && <h3>{item.title}</h3>}

                {item.content
                  ? renderTextBlocks(item.content, `${section.id}-item-${index}`)
                  : null}

                {item.code && (
                  <CodeBlock
                    code={item.code}
                    language="python"
                    title="Python"
                  />
                )}

                {item.output && (
                  <CodeBlock
                    code={item.output}
                    language="plaintext"
                    title="Output"
                    variant="output"
                  />
                )}
              </article>
            );
          })}
        </div>
      )}

      {section.table && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {section.table.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {section.table.rows.map((row, rowIndex) => (
                <tr key={`${section.id}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${section.id}-cell-${rowIndex}-${cellIndex}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default LessonSectionRenderer;