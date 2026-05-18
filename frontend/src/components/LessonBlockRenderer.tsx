import { useState } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import PythonCodeRunner from "./PythonCodeRunner";
import type { PythonRunResult } from "./PythonCodeRunner";
import type {
  AccordionBlockData,
  CalloutBlockData,
  CodeBlockData,
  ImageBlockData,
  LessonBlock,
  PracticeCodeBlockData,
  PracticeMultiBlockData,
  PracticeOption,
  PracticeSingleBlockData,
  RichTextBlockData,
  TableBlockData,
} from "../types/lessonBlock";

interface LessonBlockRendererProps {
  block: LessonBlock;
}

function getBlockData<T>(block: LessonBlock): T {
  return block.data as T;
}

function normalizeText(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function MarkdownContent({ markdown }: { markdown?: string }) {
  if (!markdown?.trim()) {
    return null;
  }

  return (
    <div className="lesson-markdown">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

function RichTextBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<RichTextBlockData>(block);

  return (
    <article className="lesson-block lesson-block-rich-text">
      <MarkdownContent markdown={data.markdown} />
    </article>
  );
}

function CodeLessonBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<CodeBlockData>(block);
  const language = data.language || "python";

  if (!data.code?.trim()) {
    return null;
  }

  return (
    <article className="lesson-block lesson-block-code">
      <CodeBlock
        code={data.code}
        language={language}
        title={data.title || language.toUpperCase()}
      />
    </article>
  );
}

function CalloutBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<CalloutBlockData>(block);
  const tone = data.tone || "info";
  const codeLanguage = data.codeLanguage || "python";
  const codeTitle = data.codeTitle || codeLanguage.toUpperCase();

  const normalizedTitle = normalizeText(data.title);
  const normalizedMarkdown = normalizeText(data.markdown);

  const isMemoryHook = normalizedTitle === "memory hook";

  const isMetaphorHook =
    !isMemoryHook &&
    (normalizedTitle === "metaphor hook" ||
      normalizedTitle === "visual hook" ||
      normalizedMarkdown.includes("imagine a kitchen full of jars"));

  const calloutClassName = [
    "lesson-block",
    "lesson-callout",
    `lesson-callout-${tone}`,
    isMemoryHook ? "lesson-callout-memory-hook" : "",
    isMetaphorHook ? "lesson-callout-metaphor-hook" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={calloutClassName}>
      {data.title && (
        <h3 className="lesson-callout-title">
          {isMemoryHook && (
            <span className="lesson-callout-icon" aria-hidden="true">
              💡
            </span>
          )}

          <span>{data.title}</span>
        </h3>
      )}

      <MarkdownContent markdown={data.markdown} />

      {data.code?.trim() && (
        <CodeBlock
          code={data.code}
          language={codeLanguage}
          title={codeTitle}
        />
      )}

      <MarkdownContent markdown={data.afterMarkdown} />
    </aside>
  );
}

function ImageLessonBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<ImageBlockData>(block);

  if (!data.imageUrl?.trim()) {
    return null;
  }

  return (
    <figure className="lesson-block lesson-block-image lesson-inline-image">
      <img src={data.imageUrl} alt={data.imageAlt || "Lesson illustration"} />

      {data.caption && (
        <figcaption>
          <MarkdownContent markdown={data.caption} />
        </figcaption>
      )}
    </figure>
  );
}

function TableLessonBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<TableBlockData>(block);
  const headers = data.headers ?? [];
  const rows = data.rows ?? [];

  if (headers.length === 0 || rows.length === 0) {
    return null;
  }

  return (
    <div className="lesson-block table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`block-table-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`block-table-cell-${rowIndex}-${cellIndex}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccordionBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<AccordionBlockData>(block);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="lesson-block lesson-accordion"
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
    >
      <summary>
        <span className="lesson-accordion-title">
          {data.title || "Open note"}
        </span>

        <span className="lesson-accordion-toggle">
          {isOpen ? "Hide" : "Reveal"}
        </span>
      </summary>

      <div className="lesson-accordion-content">
        <MarkdownContent markdown={data.markdown} />
      </div>
    </details>
  );
}

function PracticeOptions({
  options,
  selectedAnswers,
  correctAnswers,
  hasSubmitted,
  onToggle,
}: {
  options: PracticeOption[];
  selectedAnswers: string[];
  correctAnswers: string[];
  hasSubmitted: boolean;
  onToggle: (answer: string) => void;
}) {
  return (
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
            onClick={() => onToggle(option.key)}
          >
            <span className="lesson-choice-key">{option.key}</span>
            <span>{option.text}</span>
          </button>
        );
      })}
    </div>
  );
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

function PracticeSingleBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<PracticeSingleBlockData>(block);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const correctAnswer = data.correctAnswer?.toUpperCase() ?? "";
  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === correctAnswer;

  function handleSelectAnswer(answer: string) {
    setSelectedAnswer(answer);
    setIsExplanationOpen(false);
  }

  return (
    <article className="lesson-block lesson-practice-exercise">
      <div className="lesson-question-box">
        <p className="lesson-question-label">Question</p>
        <MarkdownContent markdown={data.question} />
      </div>

      {data.code && (
        <CodeBlock code={data.code} language="python" title="Python" />
      )}

      <PracticeOptions
        options={data.options ?? []}
        selectedAnswers={selectedAnswer ? [selectedAnswer] : []}
        correctAnswers={correctAnswer ? [correctAnswer] : []}
        hasSubmitted={hasAnswered}
        onToggle={handleSelectAnswer}
      />

      {hasAnswered && (
        <p
          className={`lesson-choice-feedback ${
            isCorrect
              ? "lesson-choice-feedback-correct"
              : "lesson-choice-feedback-wrong"
          }`}
        >
          {isCorrect ? "Correct." : "Not quite. Try again."}
        </p>
      )}

      {hasAnswered && data.explanation && (
        <div className="lesson-explanation-control">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setIsExplanationOpen((current) => !current)}
          >
            {isExplanationOpen ? "Hide explanation" : "Explain why"}
          </button>

          {isExplanationOpen && (
            <div className="lesson-explanation-box">
              <MarkdownContent markdown={data.explanation} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function PracticeMultiBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<PracticeMultiBlockData>(block);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const correctAnswers = normalizeAnswerList(data.correctAnswers ?? []);
  const isCorrect = areAnswerListsEqual(selectedAnswers, correctAnswers);

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
    setIsExplanationOpen(false);
  }

  return (
    <article className="lesson-block lesson-practice-exercise">
      <div className="lesson-question-box">
        <p className="lesson-question-label">Question</p>
        <MarkdownContent markdown={data.question} />
      </div>

      {data.code && (
        <CodeBlock code={data.code} language="python" title="Python" />
      )}

      <PracticeOptions
        options={data.options ?? []}
        selectedAnswers={selectedAnswers}
        correctAnswers={correctAnswers}
        hasSubmitted={hasSubmitted}
        onToggle={handleToggleAnswer}
      />

      <button
        type="button"
        className="button button-primary"
        disabled={selectedAnswers.length === 0}
        onClick={() => {
          setHasSubmitted(true);
          setIsExplanationOpen(false);
        }}
      >
        Check answers
      </button>

      {hasSubmitted && (
        <p
          className={`lesson-choice-feedback ${
            isCorrect
              ? "lesson-choice-feedback-correct"
              : "lesson-choice-feedback-wrong"
          }`}
        >
          {isCorrect
            ? "Correct."
            : `Not quite. Correct answers: ${correctAnswers.join(", ")}.`}
        </p>
      )}

      {hasSubmitted && data.explanation && (
        <div className="lesson-explanation-control">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setIsExplanationOpen((current) => !current)}
          >
            {isExplanationOpen ? "Hide explanation" : "Explain why"}
          </button>

          {isExplanationOpen && (
            <div className="lesson-explanation-box">
              <MarkdownContent markdown={data.explanation} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function PracticeCodeBlock({ block }: LessonBlockRendererProps) {
  const data = getBlockData<PracticeCodeBlockData>(block);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  function handleRunComplete(_result: PythonRunResult) {
    setHasRun(true);
    setIsExplanationOpen(false);
  }

  return (
    <article className="lesson-block lesson-practice-exercise lesson-practice-coding-task">
      <div className="lesson-question-box">
        <p className="lesson-question-label">Coding task</p>
        <MarkdownContent markdown={data.task} />
      </div>

      <PythonCodeRunner
        starterCode={data.starterCode ?? ""}
        expectedOutput={data.expectedOutput ?? ""}
        onRunComplete={handleRunComplete}
      />

      {hasRun && data.explanation && (
        <div className="lesson-explanation-control">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setIsExplanationOpen((current) => !current)}
          >
            {isExplanationOpen ? "Hide explanation" : "Explain why"}
          </button>

          {isExplanationOpen && (
            <div className="lesson-explanation-box">
              <MarkdownContent markdown={data.explanation} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function LessonBlockRenderer({ block }: LessonBlockRendererProps) {
  switch (block.type) {
    case "rich_text":
      return <RichTextBlock block={block} />;

    case "code":
      return <CodeLessonBlock block={block} />;

    case "callout":
      return <CalloutBlock block={block} />;

    case "image":
      return <ImageLessonBlock block={block} />;

    case "table":
      return <TableLessonBlock block={block} />;

    case "accordion":
      return <AccordionBlock block={block} />;

    case "practice_single":
      return <PracticeSingleBlock block={block} />;

    case "practice_multi":
      return <PracticeMultiBlock block={block} />;

    case "practice_code":
      return <PracticeCodeBlock block={block} />;

    default:
      return null;
  }
}

export default LessonBlockRenderer;