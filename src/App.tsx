import { useState } from "react";
import { challenges, type Challenge } from "./challenges";

type Screen = "start" | "quiz" | "results";
type ResultsView = "summary" | "review";
type ReviewFilter = "all" | "incorrect" | "correct";

const reviewFilters: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "incorrect", label: "Incorrect only" },
  { id: "correct", label: "Correct only" },
];

function scoreMessage(score: number): string {
  if (score <= 3) return "Review the cheat sheet";
  if (score <= 6) return "Solid";
  return "Pattern pro";
}


function ReviewCard({
  challenge,
  userAnswer,
}: {
  challenge: Challenge;
  userAnswer?: string;
}) {
  const correct = userAnswer === challenge.correctOptionId;
  const chosenIndex = challenge.options.findIndex(
    (option) => option.id === userAnswer,
  );
  const chosenOption =
    chosenIndex >= 0 ? challenge.options[chosenIndex] : undefined;
  const correctIndex = challenge.options.findIndex(
    (option) => option.id === challenge.correctOptionId,
  );
  const correctOption = challenge.options[correctIndex];

  return (
    <article
      className={`review-card ${
        correct ? "review-card-correct" : "review-card-wrong"
      }`}
    >
      <div className="review-card-top">
        <span className="category-badge">{challenge.patternCategory}</span>
        <span
          className={`review-status ${
            correct ? "review-status-correct" : "review-status-wrong"
          }`}
        >
          {correct ? "Correct" : "Incorrect"}
        </span>
      </div>

      <h2 className="review-card-title">{challenge.title}</h2>
      <p className="review-card-number">Challenge {challenge.id}</p>
      <p className="review-card-scenario">{challenge.scenario}</p>
      <p className="review-card-question">{challenge.question}</p>

      {chosenOption ? (
        <div
          className={`review-answer ${
            correct ? "review-answer-correct" : "review-answer-wrong"
          }`}
        >
          <h3 className="review-answer-heading">Your answer</h3>
          <div className="review-answer-option">
            <span className="review-letter" aria-hidden="true">
              {String.fromCharCode(65 + chosenIndex)}
            </span>
            <span className="review-option-label">{chosenOption.label}</span>
          </div>
          {chosenOption.code && (
            <pre className="code-block review-option-code">
              <code>{chosenOption.code}</code>
            </pre>
          )}
        </div>
      ) : (
        <p className="review-no-answer">No answer recorded</p>
      )}

      {!correct && correctOption && (
        <div className="review-answer review-answer-correct">
          <h3 className="review-answer-heading">Correct answer</h3>
          <div className="review-answer-option">
            <span className="review-letter" aria-hidden="true">
              {String.fromCharCode(65 + correctIndex)}
            </span>
            <span className="review-option-label">{correctOption.label}</span>
          </div>
          {correctOption.code && (
            <pre className="code-block review-option-code">
              <code>{correctOption.code}</code>
            </pre>
          )}
        </div>
      )}

      {correct && (
        <p className="review-correct-note">You chose the correct answer.</p>
      )}

      <div className="review-why">
        <h3>Why</h3>
        <p>{challenge.explanation}</p>
      </div>
    </article>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [answered, setAnswered] = useState(false);
  const [resultsView, setResultsView] = useState<ResultsView>("summary");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");

  const challenge = challenges[currentIndex];
  const total = challenges.length;
  const chosenOptionId = userAnswers[challenge.id];
  const score = challenges.filter(
    (item) => userAnswers[item.id] === item.correctOptionId,
  ).length;
  const filteredChallenges = challenges.filter((item) => {
    const correct = userAnswers[item.id] === item.correctOptionId;
    if (reviewFilter === "correct") return correct;
    if (reviewFilter === "incorrect") return !correct;
    return true;
  });

  function startExercise() {
    setCurrentIndex(0);
    setUserAnswers({});
    setAnswered(false);
    setScreen("quiz");
  }

  function selectOption(optionId: string) {
    if (answered) return;
    setUserAnswers((current) => ({ ...current, [challenge.id]: optionId }));
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
    setCurrentIndex(0);
    setUserAnswers({});
    setAnswered(false);
    setResultsView("summary");
    setReviewFilter("all");
    setScreen("start");
  }

  function openReview() {
    setResultsView("review");
    setReviewFilter("all");
    window.scrollTo(0, 0);
  }

  function backToSummary() {
    setResultsView("summary");
    window.scrollTo(0, 0);
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <span className="header-title">Design Patterns Exercise</span>
          <span className="header-session">Knowledge Transfer Session</span>
        </div>
      </header>

      <main className="app-shell">
        <div className="container">
          {screen === "start" && (
            <section className="card start-card">
              <h1>Design Patterns Exercise</h1>
              <p className="start-subtitle">
                Test your knowledge of GoF design patterns in a realistic
                payment system.
              </p>
              <ul className="start-list">
                <li>8 challenges</li>
                <li>About 10 minutes</li>
                <li>Choose the best answer</li>
              </ul>
              <button
                className="primary-button start-button"
                type="button"
                onClick={startExercise}
              >
                Start
              </button>
            </section>
          )}

          {screen === "quiz" && (
            <section className="card quiz">
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

              <span className="category-badge">
                {challenge.patternCategory}
              </span>

              <h2 className="challenge-title">{challenge.title}</h2>
              <p className="scenario">{challenge.scenario}</p>

              <pre className="code-block">
                <code>{challenge.badCode}</code>
              </pre>

              <h3 className="question">{challenge.question}</h3>

              <div className="options">
                {challenge.options.map((option, index) => {
                  const isChosen = option.id === chosenOptionId;
                  const isCorrectOption =
                    option.id === challenge.correctOptionId;
                  let stateClass = "";
                  if (answered && isCorrectOption)
                    stateClass = " option-correct";
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
                      <span className="option-letter" aria-hidden="true">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-content">
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
                          <span className="option-tag wrong-tag">
                            Your answer
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="explanation" aria-live="polite">
                  <h3>Why</h3>
                  <p>{challenge.explanation}</p>
                  <button
                    className="primary-button next-button"
                    type="button"
                    onClick={goNext}
                  >
                    {currentIndex === total - 1 ? "See results" : "Next"}
                  </button>
                </div>
              )}
            </section>
          )}

          {screen === "results" && resultsView === "summary" && (
            <section className="card results-card">
              <h1 className="results-heading">Results</h1>
              <p className="score">
                {score} / {total}
              </p>
              <p className="score-message">{scoreMessage(score)}</p>

              <ul className="results-list">
                {challenges.map((item) => {
                  const correct =
                    userAnswers[item.id] === item.correctOptionId;
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

              <div className="results-actions">
                <button
                  className="primary-button review-button"
                  type="button"
                  onClick={openReview}
                >
                  Review my answers
                </button>
                <button
                  className="outlined-button"
                  type="button"
                  onClick={tryAgain}
                >
                  Try again
                </button>
              </div>
            </section>
          )}

          {screen === "results" && resultsView === "review" && (
            <section className="review-view">
              <div className="review-header">
                <h1 className="review-heading">Answer review</h1>
                <button
                  className="outlined-button"
                  type="button"
                  onClick={backToSummary}
                >
                  Back to score
                </button>
              </div>

              <p className="review-summary-line">
                You answered {score} of {total} correctly.
              </p>

              <div
                className="review-filters"
                role="group"
                aria-label="Filter answers"
              >
                {reviewFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`filter-button${
                      reviewFilter === filter.id ? " filter-button-active" : ""
                    }`}
                    type="button"
                    aria-pressed={reviewFilter === filter.id}
                    onClick={() => setReviewFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {filteredChallenges.length === 0 ? (
                <p className="review-empty">Nothing to show here.</p>
              ) : (
                <div className="review-list">
                  {filteredChallenges.map((item) => (
                    <ReviewCard
                      key={item.id}
                      challenge={item}
                      userAnswer={userAnswers[item.id]}
                    />
                  ))}
                </div>
              )}

              <div className="review-actions">
                <button
                  className="outlined-button"
                  type="button"
                  onClick={backToSummary}
                >
                  Back to score
                </button>
                <button
                  className="outlined-button"
                  type="button"
                  onClick={tryAgain}
                >
                  Try again
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
