import React, { useState } from "react";
import { generateQuiz } from "../lib/api";

const TOPICS = [
  "Diversification",
  "Risk Management",
  "Asset Allocation",
  "Valuation",
  "Bonds",
  "Derivatives",
  "Macroeconomics",
  "Portfolio Theory",
  "Custom Topic",
];

export default function Quiz() {
  const [selectedTopic, setSelectedTopic] = useState("Diversification");
  const [customTopic, setCustomTopic] = useState("");
  const [topK, setTopK] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [evaluatedAnswers, setEvaluatedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    const topic = selectedTopic === "Custom Topic" ? customTopic : selectedTopic;
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await generateQuiz(topic.trim(), Number(topK) || 5);
      setQuiz(data);
      setSelectedAnswers({});
      setEvaluatedAnswers({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mcqs = Array.isArray(quiz?.mcqs) ? quiz.mcqs : [];

  const handleSelectOption = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
    setEvaluatedAnswers((prev) => ({
      ...prev,
      [questionIndex]: false,
    }));
  };

  const handleEvaluate = (questionIndex) => {
    if (selectedAnswers[questionIndex] === undefined) return;
    setEvaluatedAnswers((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));
  };

  return (
    <section className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur-sm sm:p-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Quiz Generator</h2>
        <p className="mt-1 text-sm text-slate-600">Generate interview-style finance quizzes from your knowledge base.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none ring-cyan-300 focus:ring"
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={10}
          value={topK}
          onChange={(e) => setTopK(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none ring-cyan-300 focus:ring"
        />
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {selectedTopic === "Custom Topic" ? (
        <input
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none ring-cyan-300 focus:ring"
          placeholder="Enter custom finance topic"
        />
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

      {quiz ? (
        <div className="mt-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">MCQs</h3>
            <div className="mt-3 space-y-3">
              {mcqs.length === 0 ? <p className="text-sm text-slate-500">No MCQs returned.</p> : null}
              {mcqs.map((item, idx) => {
                const selectedOption = selectedAnswers[idx];
                const isEvaluated = Boolean(evaluatedAnswers[idx]);
                const parsedAnswerIndex = Number(item.answer_index);
                const correctIndex = Number.isFinite(parsedAnswerIndex) ? parsedAnswerIndex : -1;
                const isCorrect = selectedOption === correctIndex;

                return (
                  <div key={item.id || idx} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-800">{item.question}</p>
                    <ul className="mt-2 space-y-2">
                      {(item.options || []).map((option, optIdx) => {
                        const isSelected = selectedOption === optIdx;
                        return (
                          <li key={`${idx}-${optIdx}`}>
                            <button
                              type="button"
                              onClick={() => handleSelectOption(idx, optIdx)}
                              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                                isSelected
                                  ? "border-cyan-500 bg-cyan-50 text-slate-900"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300"
                              }`}
                            >
                              <span className="font-semibold">{String.fromCharCode(65 + optIdx)}.</span> {option}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleEvaluate(idx)}
                      disabled={selectedOption === undefined}
                      className="mt-3 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Evaluate Answer
                    </button>
                    {isEvaluated ? (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                        <p className={`text-xs font-semibold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </p>
                        <p className="mt-1 text-xs text-slate-700">
                          <span className="font-semibold">Explanation:</span>{" "}
                          {item.explanation ||
                            (correctIndex >= 0
                              ? `The correct answer is ${String.fromCharCode(65 + correctIndex)}.`
                              : "Correct answer unavailable.")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
