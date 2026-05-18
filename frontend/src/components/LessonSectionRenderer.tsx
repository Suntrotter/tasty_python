import { useState } from "react";
import CodeBlock from "./CodeBlock";
import PythonCodeRunner from "./PythonCodeRunner";
import type { PythonRunResult } from "./PythonCodeRunner";
import {
  recordPracticeAttempt,
  type PracticeExerciseType,
} from "../features/practice/practiceProgress";
import type { LessonSection } from "../types/lesson";
import LessonBlockRenderer from "./LessonBlockRenderer";

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

const lessonOneSectionFallbackImages: Record<
  string,
  {
    src: string;
    alt: string;
    position?: "top" | "after_code" | "bottom";
  }
> = {
  "tasty metaphor": {
    src: "/lesson-images/lesson1_jars.png",
    alt: "Cozy kitchen shelf with jars and labels showing variables as labels.",
    position: "top",
  },
  "main code example": {
    src: "/lesson-images/lesson1_cups.png",
    alt: "Two café cups showing reassignment as a label moving from one cup to another.",
    position: "after_code",
  },
};

const lessonOneCodingTaskFallbackImage = {
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

function parseCorrectAnswerKeys(value?: string) {
  const rawValue = value?.trim().toUpperCase() ?? "";

  if (!rawValue) {
    return [];
  }

  if (/^[A-Z](\s*,\s*[A-Z])+$/.test(rawValue)) {
    return rawValue
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);
  }

  if (/^[A-Z]{2,}$/.test(rawValue)) {
    return rawValue.split("");
  }

  if (/^[A-Z]$/.test(rawValue)) {
    return [rawValue];
  }

  return [];
}

function normalizeAnswerList(values: string[]) {
  return [...values].map((value) => value.toUpperCase()).sort();
}

function areAnswerListsEqual(firstList: string[], secondList: string[]) {
  const first = normalizeAnswerList(firstList);
  const second = normalizeAnswerList(secondList);

  return (
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}

function hasMultipleChoiceOptions(content: string) {
  return /(^|\n)\s*[A-Z][).]\s+/.test(content);
}

function isMultipleChoiceItem(item: NonNullable<LessonSection["items"]>[number]) {
  const correctAnswerKeys = parseCorrectAnswerKeys(item.output);

  return (
    correctAnswerKeys.length === 1 && hasMultipleChoiceOptions(item.content)
  );
}

function isMultiSelectItem(item: NonNullable<LessonSection["items"]>[number]) {
  const correctAnswerKeys = parseCorrectAnswerKeys(item.output);

  return correctAnswerKeys.length > 1 && hasMultipleChoiceOptions(item.content);
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

function isMainCodeExampleSection(section: LessonSection) {
  return section.title.toLowerCase() === "main code example";
}

function getLessonSectionDomId(section: LessonSection) {
  if (section.type === "metaphor") {
    return "lesson-start";
  }

  if (section.type === "practice") {
    return "lesson-practice";
  }

  return `lesson-section-${section.id}`;
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

function getSectionImage(section: LessonSection, lessonSlug?: string) {
  if (section.imageUrl) {
    return {
      src: section.imageUrl,
      alt: section.imageAlt || section.title,
      position: section.imagePosition ?? "top",
    };
  }

  if (lessonSlug === "variables-and-assignment") {
    const fallback =
      lessonOneSectionFallbackImages[section.title.toLowerCase()];

    if (fallback) {
      return fallback;
    }
  }

  return null;
}

function getItemImage(
  item: NonNullable<LessonSection["items"]>[number],
  lessonSlug?: string
) {
  if (item.imageUrl) {
    return {
      src: item.imageUrl,
      alt: item.imageAlt || item.title || "Lesson illustration",
    };
  }

  if (
    lessonSlug === "variables-and-assignment" &&
    (item.title ?? "").toLowerCase().includes("coding task")
  ) {
    return lessonOneCodingTaskFallbackImage;
  }

  return null;
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
  const itemImage = getItemImage(item);

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

        {itemImage && (
          <InlineLessonImage
            src={itemImage.src}
            alt={itemImage.alt}
            variant="coding"
          />
        )}

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

        {item.afterText
          ? renderTextBlocks(
              item.afterText,
              `${sectionId}-interview-after-text-${index}`
            )
          : null}
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
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const correctAnswer = parseCorrectAnswerKeys(item.output)[0] ?? "";
  const { question, options } = parseMultipleChoiceContent(item.content);
  const itemImage = getItemImage(item, lessonSlug);

  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === correctAnswer;

  function handleSelectAnswer(answer: string) {
    const answerIsCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);
    setIsExplanationOpen(false);

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

      {itemImage && (
        <InlineLessonImage
          src={itemImage.src}
          alt={itemImage.alt}
          variant="coding"
        />
      )}

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

      {hasAnswered && item.afterText && (
        <div className="lesson-explanation-control">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setIsExplanationOpen((currentValue) => !currentValue);
            }}
          >
            {isExplanationOpen ? "Hide explanation" : "Explain why"}
          </button>

          {isExplanationOpen && (
            <div className="lesson-explanation-box">
              {renderTextBlocks(
                item.afterText,
                `${sectionId}-practice-after-text-${index}`
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

interface MultiSelectExerciseProps {
  sectionId: string;
  item: NonNullable<LessonSection["items"]>[number];
  index: number;
  lessonSlug?: string;
}

function MultiSelectExercise({
  sectionId,
  item,
  index,
  lessonSlug,
}: MultiSelectExerciseProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(
    null
  );
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const correctAnswers = parseCorrectAnswerKeys(item.output);
  const { question, options } = parseMultipleChoiceContent(item.content);
  const itemImage = getItemImage(item, lessonSlug);

  function handleToggleAnswer(answer: string) {
    setSelectedAnswers((currentAnswers) => {
      if (currentAnswers.includes(answer)) {
        return currentAnswers.filter(
          (currentAnswer) => currentAnswer !== answer
        );
      }

      return [...currentAnswers, answer];
    });

    setHasSubmitted(false);
    setLastResultCorrect(null);
    setIsExplanationOpen(false);
  }

  function handleSubmitAnswer() {
    const answerIsCorrect = areAnswerListsEqual(
      selectedAnswers,
      correctAnswers
    );

    setHasSubmitted(true);
    setLastResultCorrect(answerIsCorrect);
    setIsExplanationOpen(false);

    savePracticeAttempt({
      lessonSlug,
      sectionId,
      item,
      index,
      exerciseType: "multi_select",
      isCorrect: answerIsCorrect,
      selectedAnswer: normalizeAnswerList(selectedAnswers).join(","),
      correctAnswer: normalizeAnswerList(correctAnswers).join(","),
    });
  }

  return (
    <article className="lesson-practice-exercise">
      {item.title && <h3>{item.title}</h3>}

      {itemImage && (
        <InlineLessonImage
          src={itemImage.src}
          alt={itemImage.alt}
          variant="coding"
        />
      )}

      {question && (
        <div className="lesson-question-box">
          <p className="lesson-question-label">Question</p>
          {renderTextBlocks(question, `${sectionId}-multi-question-${index}`)}
        </div>
      )}

      {item.code && (
        <CodeBlock code={item.code} language="python" title="Python" />
      )}

      <div className="lesson-choice-list">
        {options.map((option) => {
          const isSelected = selectedAnswers.includes(option.key);
          const isCorrectOption = correctAnswers.includes(option.key);

          let optionClassName = "lesson-choice-button";

          if (hasSubmitted && isSelected && isCorrectOption) {
            optionClassName += " lesson-choice-button-correct";
          } else if (hasSubmitted && isSelected && !isCorrectOption) {
            optionClassName += " lesson-choice-button-wrong";
          } else if (hasSubmitted && !isSelected && isCorrectOption) {
            optionClassName += " lesson-choice-button-correct";
          } else if (isSelected) {
            optionClassName += " lesson-choice-button-selected";
          }

          return (
            <button
              className={optionClassName}
              key={option.key}
              type="button"
              onClick={() => {
                handleToggleAnswer(option.key);
              }}
            >
              <span className="lesson-choice-key">{option.key}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="button button-primary"
        disabled={selectedAnswers.length === 0}
        onClick={handleSubmitAnswer}
      >
        Check answers
      </button>

      {hasSubmitted && (
        <p
          className={`lesson-choice-feedback ${
            lastResultCorrect
              ? "lesson-choice-feedback-correct"
              : "lesson-choice-feedback-wrong"
          }`}
        >
          {lastResultCorrect
            ? "Correct. All the right ingredients are in the bowl."
            : `Not quite. Correct answers: ${normalizeAnswerList(
                correctAnswers
              ).join(", ")}.`}
        </p>
      )}

      {hasSubmitted && item.afterText && (
        <div className="lesson-explanation-control">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setIsExplanationOpen((currentValue) => !currentValue);
            }}
          >
            {isExplanationOpen ? "Hide explanation" : "Explain why"}
          </button>

          {isExplanationOpen && (
            <div className="lesson-explanation-box">
              {renderTextBlocks(
                item.afterText,
                `${sectionId}-multi-after-text-${index}`
              )}
            </div>
          )}
        </div>
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
  const itemImage = getItemImage(item, lessonSlug);

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

      {itemImage && (
        <InlineLessonImage
          src={itemImage.src}
          alt={itemImage.alt}
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

      {item.afterText
        ? renderTextBlocks(
            item.afterText,
            `${sectionId}-coding-after-text-${index}`
          )
        : null}
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

  const sectionImage = getSectionImage(section, lessonSlug);
  const sectionImagePosition = sectionImage?.position ?? "top";

  const isInterviewSection = section.type === "interview";
  const isPracticeSection = section.type === "practice";
  const isMainCodeExample = isMainCodeExampleSection(section);
  const hasBlocks = Boolean(section.blocks && section.blocks.length > 0);

  return (
    <section
      className={`lesson-section lesson-section-${section.type}`}
      id={getLessonSectionDomId(section)}
      data-lesson-scroll-anchor={`section-${section.id}`}
    >
      <div className="lesson-section-header">
        <span className="lesson-section-icon">{decoration.icon}</span>

        <div>
          <p className="lesson-section-kicker">{decoration.label}</p>
          <h2>{section.title}</h2>
        </div>
      </div>

      {sectionImage && sectionImagePosition === "top" && (
        <InlineLessonImage src={sectionImage.src} alt={sectionImage.alt} />
      )}

      {hasBlocks ? (
        <>
          <div className="lesson-block-list">
            {section.blocks
              ?.slice()
              .sort((firstBlock, secondBlock) => firstBlock.order - secondBlock.order)
              .map((block, index) => {
                const blockAnchor = `block-${block.id ?? block.key}`;

                const blockAnchorClassName = [
                  "lesson-block-anchor",
                  `lesson-block-anchor-${block.type}`,
                  `lesson-block-anchor-position-${index + 1}`,
                ].join(" ");

                return (
                  <div
                    className={blockAnchorClassName}
                    id={`lesson-${blockAnchor}`}
                    data-lesson-scroll-anchor={blockAnchor}
                    data-lesson-block-type={block.type}
                    data-lesson-block-position={index + 1}
                    key={block.id ?? block.key}
                  >
                    <LessonBlockRenderer block={block} />
                  </div>
                );
              })}
          </div>

          {sectionImage && sectionImagePosition === "bottom" && (
            <InlineLessonImage src={sectionImage.src} alt={sectionImage.alt} />
          )}
        </>
      ) : (
        <>
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

          {sectionImage && sectionImagePosition === "after_code" && (
            <InlineLessonImage src={sectionImage.src} alt={sectionImage.alt} />
          )}

          {section.paragraphs?.map((paragraph, index) => (
            <p key={`${section.id}-paragraph-${index}`}>{paragraph}</p>
          ))}

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
              {section.items.map((item, index) => {
                if (isMultiSelectItem(item)) {
                  return (
                    <MultiSelectExercise
                      key={`${section.id}-multi-${index}`}
                      sectionId={section.id}
                      item={item}
                      index={index}
                      lessonSlug={lessonSlug}
                    />
                  );
                }

                if (isMultipleChoiceItem(item)) {
                  return (
                    <MultipleChoiceExercise
                      key={`${section.id}-practice-${index}`}
                      sectionId={section.id}
                      item={item}
                      index={index}
                      lessonSlug={lessonSlug}
                    />
                  );
                }

                return (
                  <CodingTaskExercise
                    key={`${section.id}-coding-${index}`}
                    sectionId={section.id}
                    item={item}
                    index={index}
                    lessonSlug={lessonSlug}
                  />
                );
              })}
            </div>
          )}

          {section.items && !isInterviewSection && !isPracticeSection && (
            <div className="lesson-items">
              {section.items.map((item, index) => {
                const tone = getItemTone(section.type, item.title);
                const itemImage = getItemImage(item, lessonSlug);

                return (
                  <article
                    className={`lesson-item lesson-item-${tone}`}
                    key={`${section.id}-${index}`}
                  >
                    {item.title && <h3>{item.title}</h3>}

                    {itemImage && (
                      <InlineLessonImage
                        src={itemImage.src}
                        alt={itemImage.alt}
                        variant="coding"
                      />
                    )}

                    {item.content
                      ? renderTextBlocks(
                          item.content,
                          `${section.id}-item-${index}`
                        )
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

                    {item.afterText
                      ? renderTextBlocks(
                          item.afterText,
                          `${section.id}-after-text-${index}`
                        )
                      : null}
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

          {sectionImage && sectionImagePosition === "bottom" && (
            <InlineLessonImage src={sectionImage.src} alt={sectionImage.alt} />
          )}
        </>
      )}
    </section>
  );
}

export default LessonSectionRenderer;