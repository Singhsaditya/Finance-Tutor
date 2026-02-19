import React, { useState } from "react";
import { askQuestion } from "../lib/api";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await askQuestion(question.trim());
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
        <h2 className="text-2xl font-bold text-slate-900">Ask Tutor</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ask a finance question and get a response grounded in indexed context.
        </p>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Example: Explain diversification and unsystematic risk in simple words."
        className="h-32 w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-800 outline-none ring-cyan-300 transition focus:ring"
      />

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submitQuestion}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Asking..." : "Ask Question"}
        </button>
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>

      {result ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-cyan-200/70 bg-cyan-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-900">AI Answer</p>
            <p className="mt-2 text-sm leading-7 text-slate-800 whitespace-pre-wrap">{result.answer}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">Retrieved Context</p>
            <ul className="mt-2 space-y-2">
              {(result.contexts || []).map((ctx, idx) => (
                <li key={`${idx}-${ctx.slice(0, 20)}`} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Chunk {idx + 1}:</span> {ctx}
                </li>
              ))}
            </ul>
          </article>
        </div>
      ) : null}
    </section>
  );
}
