import React, { useState } from "react";
import { teachConcept } from "../lib/api";

export default function Teach() {
  const [concept, setConcept] = useState("Diversification");
  const [reference, setReference] = useState(
    "Diversification reduces unsystematic risk by spreading investments across different assets."
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!concept.trim() || !reference.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await teachConcept(concept.trim(), reference.trim());
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
        <h2 className="text-2xl font-bold text-slate-900">Teaching Assistant</h2>
        <p className="mt-1 text-sm text-slate-600">Generate clear explanation, example, and next topic.</p>
      </div>

      <div className="grid gap-3">
        <input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-cyan-300 focus:ring"
          placeholder="Concept"
        />
        <textarea
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="h-28 rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none ring-cyan-300 focus:ring"
          placeholder="Reference knowledge"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Teach Me"}
        </button>
        {error ? <span className="text-sm text-rose-600">{error}</span> : null}
      </div>

      {result ? (
        <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4">
          <p className="text-sm text-slate-800">
            <span className="font-semibold">Explanation:</span> {result.explanation || "N/A"}
          </p>
          <p className="mt-3 text-sm text-slate-800">
            <span className="font-semibold">Example:</span> {result.example || "N/A"}
          </p>
          <p className="mt-3 text-sm text-slate-800">
            <span className="font-semibold">Next Topic:</span> {result.next_topic || "N/A"}
          </p>
        </div>
      ) : null}
    </section>
  );
}

