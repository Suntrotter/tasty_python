import type { LessonSection } from "../types/lesson";

interface LessonSectionRendererProps {
  section: LessonSection;
}

function LessonSectionRenderer({ section }: LessonSectionRendererProps) {
  return (
    <section className={`lesson-section lesson-section-${section.type}`}>
      <h2>{section.title}</h2>

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {section.code && (
        <pre>
          <code>{section.code}</code>
        </pre>
      )}

      {section.output && (
        <div className="output-box">
          <p className="output-label">Output</p>
          <pre>
            <code>{section.output}</code>
          </pre>
        </div>
      )}

      {section.items && (
        <div className="lesson-items">
          {section.items.map((item, index) => (
            <article className="lesson-item" key={`${section.id}-${index}`}>
              {item.title && <h3>{item.title}</h3>}

              <p>{item.content}</p>

              {item.code && (
                <pre>
                  <code>{item.code}</code>
                </pre>
              )}

              {item.output && (
                <div className="output-box">
                  <p className="output-label">Output</p>
                  <pre>
                    <code>{item.output}</code>
                  </pre>
                </div>
              )}
            </article>
          ))}
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
              {section.table.rows.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
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