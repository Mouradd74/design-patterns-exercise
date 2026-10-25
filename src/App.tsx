import { useState } from "react";
import { challenges } from "./challenges";

type Screen = "start" | "quiz" | "results";

function scoreMessage(score: number): string {
  if (score <= 3) return "Review the cheat sheet";
  if (score <= 6) return "Solid";
  return "Pattern pro";
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [name, setName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answered, setAnswered] = useState(false);

  const challenge = challenges[currentIndex];
  const total = challenges.length;
  const chosenOptionId = answers[challenge.id];
  const score = challenges.filter(
    (item) => answers[item.id] === item.correctOptionId,
  ).length;

  function startExercise() {
    setCurrentIndex(0);
    setAnswers({});
    setAnswered(false);
    setScreen("quiz");
  }

  function selectOption(optionId: string) {
    if (answered) return;
    setAnswers((current) => ({ ...current, [challenge.id]: optionId }));
    setAnswered(true);
  }

  function goNext() {
    if (currentIndex === total - 1) {
      setScreen("results");
      return;
    }
    setCurrentIndex((index) => index + 1);
    setAnswered(false);
  }

  function tryAgain() {
    setName("");
    setCurrentIndex(0);
    setAnswers({});
    setAnswered(false);
    setScreen("start");
  }

  return (
    <main className="app-shell">
      <div className="container">
        {screen === "start" && (
          <section className="card start-card">
            <h1>Design Patterns Exercise</h1>
            <p className="tagline">
              8 challenges - about 10 minutes - choose the best answer
            </p>
            <form
              className="start-form"
              onSubmit={(event) => {
                event.preventDefault();
                startExercise();
              }}
            >
              <label htmlFor="attendee-name">Name (optional)</label>
              <input
                id="attendee-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
              <button className="primary-button" type="submit">
                Start
              </button>
            </form>
          </section>
        )}

        {screen === "quiz" && (
          <section className="quiz">
            <div className="progress-block">
              <p className="progress-label">
                Challenge {currentIndex + 1} of {total}
              </p>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Exercise progress"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={currentIndex + 1}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            <span
              className={`category-badge badge-${challenge.patternCategory.toLowerCase()}`}
            >
              {challenge.patternCategory}
            </span>

            <h2 className="challenge-title">{challenge.title}</h2>
            <p className="scenario">{challenge.scenario}</p>

            <pre className="code-block">
              <code>{challenge.badCode}</code>
            </pre>

            <h3 className="question">{challenge.question}</h3>

            <div className="options">
              {challenge.options.map((option) => {
                const isChosen = option.id === chosenOptionId;
                const isCorrectOption =
                  option.id === challenge.correctOptionId;
                let stateClass = "";
                if (answered && isCorrectOption) stateClass = " option-correct";
                else if (answered && isChosen) stateClass = " option-wrong";

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`option-card${stateClass}`}
                    onClick={() => selectOption(option.id)}
                    disabled={answered}
                    aria-pressed={isChosen}
                  >
                    <span className="option-label">{option.label}</span>
                    {option.code && (
                      <pre className="code-block option-code">
                        <code>{option.code}</code>
                      </pre>
                    )}
                    {answered && isCorrectOption && (
                      <span className="option-tag correct-tag">
                        Correct answer
                      </span>
                    )}
                    {answered && isChosen && !isCorrectOption && (
                      <span className="option-tag wrong-tag">Your answer</span>
                    )}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="explanation" aria-live="polite">
                <h3>Explanation</h3>
                <p>{challenge.explanation}</p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={goNext}
                >
                  {currentIndex === total - 1 ? "See results" : "Next"}
                </button>
              </div>
            )}
          </section>
        )}

        {screen === "results" && (
          <section className="card results-card">
            <p className="results-label">Results</p>
            {name.trim() && (
              <p className="results-name">Attendee: {name.trim()}</p>
            )}
            <p className="score">
              {score} / {total}
            </p>
            <p className="score-message">{scoreMessage(score)}</p>

            <ul className="results-list">
              {challenges.map((item) => {
                const correct =
                  answers[item.id] === item.correctOptionId;
                return (
                  <li
                    key={item.id}
                    className={correct ? "result-correct" : "result-wrong"}
                  >
                    <span className="result-icon" aria-hidden="true">
                      {correct ? "✓" : "✗"}
                    </span>
                    <span className="sr-only">
                      {correct ? "Correct" : "Incorrect"}:{" "}
                    </span>
                    <span className="result-title">{item.title}</span>
                  </li>
                );
              })}
            </ul>

            <button
              className="primary-button"
              type="button"
              onClick={tryAgain}
            >
              Try again
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
