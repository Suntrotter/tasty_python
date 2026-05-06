import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { loadPyodide, version as pyodideVersion } from "pyodide";

export interface PythonRunResult {
  isCorrect: boolean;
  stdout: string;
  stderr: string;
  expectedOutput: string;
}

interface PythonCodeRunnerProps {
  starterCode: string;
  expectedOutput?: string;
  onRunComplete?: (result: PythonRunResult) => void;
}

type RunState = "idle" | "loading" | "success" | "wrong" | "error";

let pyodidePromise: ReturnType<typeof loadPyodide> | null = null;

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
    });
  }

  return pyodidePromise;
}

function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function PythonCodeRunner({
  starterCode,
  expectedOutput = "",
  onRunComplete,
}: PythonCodeRunnerProps) {
  const [code, setCode] = useState(starterCode);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [runState, setRunState] = useState<RunState>("idle");

  const preparedExpectedOutput = expectedOutput.trim();

  const editorHeight = useMemo(() => {
    const lineCount = code.split("\n").length;
    const calculatedHeight = lineCount * 26 + 70;

    return Math.min(Math.max(calculatedHeight, 190), 460);
  }, [code]);

  const hasExpectedOutput = preparedExpectedOutput.length > 0;

  async function handleRunCode() {
    setRunState("loading");
    setStdout("");
    setStderr("");

    try {
      const pyodide = await getPyodide();

      pyodide.globals.set("__tasty_user_code", code);

      await pyodide.runPythonAsync(`
import sys
import io
import traceback

__tasty_stdout = io.StringIO()
__tasty_stderr = io.StringIO()

__tasty_old_stdout = sys.stdout
__tasty_old_stderr = sys.stderr

sys.stdout = __tasty_stdout
sys.stderr = __tasty_stderr

try:
    exec(__tasty_user_code, {})
except Exception:
    traceback.print_exc(file=__tasty_stderr)
finally:
    sys.stdout = __tasty_old_stdout
    sys.stderr = __tasty_old_stderr

__tasty_stdout_value = __tasty_stdout.getvalue()
__tasty_stderr_value = __tasty_stderr.getvalue()
`);

      const nextStdout = String(
        pyodide.globals.get("__tasty_stdout_value") ?? ""
      );
      const nextStderr = String(
        pyodide.globals.get("__tasty_stderr_value") ?? ""
      );

      setStdout(nextStdout);
      setStderr(nextStderr);

      if (nextStderr.trim()) {
        setRunState("error");

        onRunComplete?.({
          isCorrect: false,
          stdout: nextStdout,
          stderr: nextStderr,
          expectedOutput: preparedExpectedOutput,
        });

        return;
      }

      if (!hasExpectedOutput) {
        setRunState("success");

        onRunComplete?.({
          isCorrect: true,
          stdout: nextStdout,
          stderr: nextStderr,
          expectedOutput: preparedExpectedOutput,
        });

        return;
      }

      const actual = normalizeOutput(nextStdout);
      const expected = normalizeOutput(preparedExpectedOutput);
      const isCorrect = actual === expected;

      setRunState(isCorrect ? "success" : "wrong");

      onRunComplete?.({
        isCorrect,
        stdout: nextStdout,
        stderr: nextStderr,
        expectedOutput: preparedExpectedOutput,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown runner error";

      setStderr(errorMessage);
      setRunState("error");

      onRunComplete?.({
        isCorrect: false,
        stdout: "",
        stderr: errorMessage,
        expectedOutput: preparedExpectedOutput,
      });
    }
  }

  function handleReset() {
    setCode(starterCode);
    setStdout("");
    setStderr("");
    setRunState("idle");
  }

  return (
    <div className="python-runner">
      <div className="python-runner-header">
        <div>
          <p className="python-runner-kicker">Interactive Python</p>
          <h4>Run your solution</h4>
        </div>

        <div className="python-runner-actions">
          <button type="button" onClick={handleReset}>
            Reset
          </button>

          <button
            className="python-runner-run-button"
            type="button"
            onClick={handleRunCode}
            disabled={runState === "loading"}
          >
            {runState === "loading" ? "Loading Python..." : "Run code"}
          </button>
        </div>
      </div>

      <div className="python-runner-editor">
        <Editor
          height={editorHeight}
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => {
            setCode(value ?? "");
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            fontFamily:
              "Cascadia Code, Consolas, Monaco, 'Courier New', monospace",
            lineHeight: 26,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on",
            tabSize: 4,
          }}
        />
      </div>

      <div className="python-runner-output-grid">
        <div className="python-runner-output-card">
          <p className="python-runner-output-label">Your output</p>

          <pre>
            {stderr.trim()
              ? stderr.trim()
              : stdout.trim()
              ? stdout.trim()
              : "Run your code to see the output here."}
          </pre>
        </div>

        {hasExpectedOutput && (
          <div className="python-runner-output-card python-runner-expected-card">
            <p className="python-runner-output-label">Expected output</p>

            <pre>{preparedExpectedOutput}</pre>
          </div>
        )}
      </div>

      {runState === "success" && (
        <p className="python-runner-feedback python-runner-feedback-success">
          Correct. Beautiful — the café order is ready.
        </p>
      )}

      {runState === "wrong" && (
        <p className="python-runner-feedback python-runner-feedback-wrong">
          Not quite yet. Check the printed text and spacing, then run it again.
        </p>
      )}

      {runState === "error" && (
        <p className="python-runner-feedback python-runner-feedback-error">
          Python found an error. Read the message above and fix the code.
        </p>
      )}

      {runState === "loading" && (
        <p className="python-runner-feedback python-runner-feedback-loading">
          Loading Pyodide. First run may take a few seconds.
        </p>
      )}
    </div>
  );
}

export default PythonCodeRunner;