import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  variant?: "code" | "output";
}

function CodeBlock({
  code,
  language = "python",
  title = "Python",
  variant = "code",
}: CodeBlockProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const preparedCode = code.trimEnd();
  const isCopyable = variant === "code";

  const lineCount = useMemo(() => {
    return preparedCode.split(/\r?\n/).length;
  }, [preparedCode]);

  const isCompact = lineCount <= 2;

  const editorHeight = useMemo(() => {
    const lineHeight = 24;
    const verticalPadding = isCompact ? 34 : 56;
    const minHeight = isCompact ? 64 : 110;
    const maxHeight = 420;

    const calculatedHeight = lineCount * lineHeight + verticalPadding;

    return Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
  }, [lineCount, isCompact]);

  async function handleCopy() {
    if (!isCopyable) {
      return;
    }

    try {
      await navigator.clipboard.writeText(preparedCode);
      setHasCopied(true);

      window.setTimeout(() => {
        setHasCopied(false);
      }, 1200);
    } catch {
      setHasCopied(false);
    }
  }

  if (!preparedCode) {
    return null;
  }

  return (
    <div
      className={`lesson-code-card lesson-code-card-${variant} ${
        isCompact ? "lesson-code-card-compact" : ""
      }`}
    >
      <div className="lesson-code-toolbar">
        <div className="lesson-code-toolbar-left">
          <span className="lesson-code-dot lesson-code-dot-red" />
          <span className="lesson-code-dot lesson-code-dot-yellow" />
          <span className="lesson-code-dot lesson-code-dot-green" />
          <span className="lesson-code-title">{title}</span>
        </div>

        {isCopyable ? (
          <button className="lesson-code-copy" type="button" onClick={handleCopy}>
            {hasCopied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>

      <div className="lesson-code-editor">
        <Editor
          height={editorHeight}
          language={language}
          theme="vs-dark"
          value={preparedCode}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            fontSize: 15,
            fontFamily:
              "Cascadia Code, Consolas, Monaco, 'Courier New', monospace",
            lineHeight: 24,
            lineNumbers: variant === "output" ? "off" : "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            renderLineHighlight: "none",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            glyphMargin: false,
            folding: false,
            scrollbar: {
              vertical: "hidden",
              horizontal: "auto",
              handleMouseWheel: false,
            },
          }}
        />
      </div>
    </div>
  );
}

export default CodeBlock;