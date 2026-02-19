import React, { useMemo, useState } from "react";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import Evaluate from "./pages/Evaluate";
import Teach from "./pages/Teach";

const NAV_ITEMS = [
  { id: "chat", label: "Ask Tutor", description: "Q&A with retrieved finance context." },
  { id: "quiz", label: "Generate Quiz", description: "Create MCQ + short answer tests." },
  { id: "evaluate", label: "Evaluate Answer", description: "Score learner answers." },
  { id: "teach", label: "Teach Concept", description: "Get step-by-step explanations." },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");

  const panel = useMemo(() => {
    if (activeTab === "chat") return <Chat />;
    if (activeTab === "quiz") return <Quiz />;
    if (activeTab === "evaluate") return <Evaluate />;
    return <Teach />;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-app">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <section className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-800/80">
                AI Finance Tutor
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Modern Learning Workspace
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-700 sm:text-base">
                Ask questions, generate quizzes, evaluate responses, and get guided teaching from your backend APIs.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-300/70 bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-800">
              Backend Ready
            </span>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`group rounded-2xl border p-4 text-left transition ${
                activeTab === item.id
                  ? "border-cyan-400 bg-cyan-500 text-white shadow-lg shadow-cyan-900/20"
                  : "border-white/40 bg-white/75 text-slate-800 hover:-translate-y-0.5 hover:bg-white"
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p
                className={`mt-1 text-xs ${
                  activeTab === item.id ? "text-cyan-50" : "text-slate-600"
                }`}
              >
                {item.description}
              </p>
            </button>
          ))}
        </section>

        <section className="mt-6">{panel}</section>
      </main>
    </div>
  );
}
