import React, { useState } from "react";
import { evaluateAnswer } from "../lib/api";

export default function Evaluate() {
  const [question, setQuestion] = useState("What is diversification?");
  const [userAnswer, setUserAnswer] = useState("");
  const [reference, setReference] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!question.trim() || !userAnswer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await evaluateAnswer(question.trim(), userAnswer.trim(), reference);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur-sm sm:p-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Answer Evaluator</h2>
        <p className="mt-1 text-sm text-slate-600">
          Score learner answers against reference context.
        </p>
      </div>

      <div className="grid gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-cyan-300 focus:ring"
          placeholder="Question"
        />
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="h-24 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-cyan-300 focus:ring"
          placeholder="Student answer"
        />
        <textarea
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="h-24 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-cyan-300 focus:ring"
          placeholder="Optional reference context (leave blank to auto-retrieve)"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Evaluating..." : "Evaluate"}
        </button>
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>

      {result ? (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="text-sm text-slate-800">
              <span className="font-semibold">Score:</span> {String(result.score ?? "N/A")} / 10
            </p>
            <p className="text-sm text-slate-800">
              <span className="font-semibold">Correct:</span> {String(result.correctness ?? "N/A")}
            </p>
          </div>
          <p className="mt-3 text-sm text-slate-800">
            <span className="font-semibold">Explanation:</span> {result.explanation || "N/A"}
          </p>
          <p className="mt-2 text-sm text-slate-800">
            <span className="font-semibold">Improvement Tip:</span> {result.improvement_tip || "N/A"}
          </p>
        </div>
      ) : null}
    </section>
  );
}

