import { useState } from "react";
import { Link } from "react-router-dom";
import { interviewQuestions } from "../data/interviewQuestions";

function InterviewModePage() {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

  const topics = [
    "All",
    ...Array.from(
      new Set(interviewQuestions.map((question) => question.topic))
    ),
  ];

  const filteredQuestions =
    selectedTopic === "All"
      ? interviewQuestions
      : interviewQuestions.filter((question) => question.topic === selectedTopic);

  function toggleQuestion(questionId: string) {
    setOpenQuestionId((currentId) =>
      currentId === questionId ? null : questionId
    );
  }

  return (
    <main className="page">
      <section className="page-intro">
        <p className="eyebrow">Interview mode</p>
        <h1>Practice Python answers</h1>
        <p>
          Train short, clear explanations for junior Python interviews. Reveal
          the answer, compare your explanation, and notice common mistakes.
        </p>
      </section>

      <section className="interview-topic-filter" aria-label="Interview topics">
        {topics.map((topic) => (
          <button
            type="button"
            key={topic}
            className={`topic-button ${
              selectedTopic === topic ? "topic-button-active" : ""
            }`}
            onClick={() => setSelectedTopic(topic)}
          >
            {topic}
          </button>
        ))}
      </section>

      <section className="interview-list">
        {filteredQuestions.map((question) => {
          const isOpen = openQuestionId === question.id;

          return (
            <article className="interview-card" key={question.id}>
              <div className="interview-card-header">
                <span className="status status-coming_soon">
                  {question.topic}
                </span>

                <button
                  type="button"
                  className="interview-toggle"
                  onClick={() => toggleQuestion(question.id)}
                >
                  {isOpen ? "Hide answer" : "Reveal answer"}
                </button>
              </div>

              <h2>{question.question}</h2>

              {isOpen && (
                <div className="interview-answer">
                  <div>
                    <h3>Short answer</h3>
                    <p>{question.shortAnswer}</p>
                  </div>

                  <div>
                    <h3>Stronger interview answer</h3>
                    <p>{question.strongAnswer}</p>
                  </div>

                  <div className="mistake-box">
                    <h3>Common mistake</h3>
                    <p>{question.commonMistake}</p>
                  </div>

                  {question.lessonSlug && (
                    <Link
                      to={`/lessons/${question.lessonSlug}`}
                      className="button button-secondary"
                    >
                      Open related lesson
                    </Link>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default InterviewModePage;