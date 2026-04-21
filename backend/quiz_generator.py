import os
import json
import sys
import re
from typing import List
sys.path.append(os.path.dirname(__file__))
from _gemini_client import generate_text


def build_quiz_prompt(topic: str, contexts: List[str], difficulty: str = "medium") -> str:
    diff = (difficulty or "medium").strip().lower()
    if diff not in {"easy", "medium", "hard"}:
        diff = "medium"

    difficulty_instruction = {
        "easy": "Use basic conceptual questions, simple wording, and obvious distractors.",
        "medium": "Use applied finance questions with moderate reasoning and plausible distractors.",
        "hard": "Use advanced and nuanced finance questions that require deeper reasoning and close options.",
    }[diff]

    prompt = (
        f"Using ONLY the provided finance context, generate a JSON object for a quiz on the topic '{topic}'.\n"
        f"Difficulty level: {diff}. {difficulty_instruction}\n"
        "Include: 'mcqs' (list of {id, question, options (4), answer_index}), 'short_answer' (list of {id, question, reference_answer}).\n"
        "Return valid JSON only. Context follows:\n\n" + "\n---\n".join(contexts)
    )
    return prompt


def _strip_code_fences(text: str) -> str:
    return re.sub(r"```(?:json)?|```", "", text, flags=re.IGNORECASE).strip()


def _extract_json_object(text: str) -> str:
    start = text.find("{")
    if start == -1:
        return ""
    depth = 0
    for i in range(start, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    return ""


def _coerce_quiz_shape(topic: str, payload: dict, num_mcq: int) -> dict:
    mcqs = payload.get("mcqs")
    if not isinstance(mcqs, list):
        mcqs = []

    cleaned = []
    for i, item in enumerate(mcqs):
        if not isinstance(item, dict):
            continue
        options = item.get("options")
        if not isinstance(options, list):
            options = []
        options = [str(opt) for opt in options[:4]]
        while len(options) < 4:
            options.append(f"Option {len(options) + 1}")

        answer_index = item.get("answer_index", 0)
        if not isinstance(answer_index, int) or answer_index < 0 or answer_index > 3:
            answer_index = 0

        cleaned.append(
            {
                "id": str(item.get("id", f"q_{i+1}")),
                "question": str(item.get("question", f"Question {i+1} on {topic}?")),
                "options": options,
                "answer_index": answer_index,
                "explanation": str(item.get("explanation", "")),
            }
        )

    return {
        "mcqs": cleaned[: max(1, num_mcq)],
        "short_answer": payload.get("short_answer", []),
    }


def _fallback_quiz(
    topic: str,
    contexts: List[str],
    num_mcq: int,
    difficulty: str = "medium",
    error: str = "",
) -> dict:
    context_hint = contexts[0][:140] if contexts else f"{topic} basics"
    diff = (difficulty or "medium").strip().lower()
    wrong_options = {
        "easy": [
            f"It means avoiding all finance decisions about {topic}",
            f"It guarantees returns with no risk",
            f"It has no use in investing",
        ],
        "medium": [
            f"It ignores risk-return tradeoffs in {topic}",
            f"It guarantees fixed positive alpha",
            f"It removes all market risk",
        ],
        "hard": [
            f"It fully eliminates systematic risk under CAPM assumptions",
            f"It ensures arbitrage-free excess return in all regimes",
            f"It makes valuation multiples invariant to macro factors",
        ],
    }
    distractors = wrong_options.get(diff, wrong_options["medium"])

    mcqs = []
    for i in range(max(1, num_mcq)):
        mcqs.append(
            {
                "id": f"q_{i+1}",
                "question": f"Which statement is most accurate about {topic}?",
                "options": [
                    f"It is related to: {context_hint}",
                    distractors[0],
                    distractors[1],
                    distractors[2],
                ],
                "answer_index": 0,
                "explanation": "This option aligns with the retrieved finance context.",
            }
        )
    result = {"mcqs": mcqs, "short_answer": []}
    if error:
        result["error"] = error
    return result


def generate_quiz(
    topic: str,
    contexts: List[str],
    num_mcq: int = 3,
    difficulty: str = "medium",
) -> dict:
    prompt = build_quiz_prompt(topic, contexts, difficulty=difficulty)
    try:
        resp_text = generate_text(prompt, temperature=0.2)
    except Exception as exc:
        return _fallback_quiz(
            topic,
            contexts,
            num_mcq,
            difficulty=difficulty,
            error=f"LLM error: {exc}",
        )

    candidate = _strip_code_fences(resp_text)
    try:
        raw = json.loads(candidate)
        if isinstance(raw, dict):
            return _coerce_quiz_shape(topic, raw, num_mcq)
    except Exception:
        pass

    # Try extracting the first balanced JSON object from mixed text.
    extracted = _extract_json_object(candidate)
    if extracted:
        try:
            raw = json.loads(extracted)
            if isinstance(raw, dict):
                return _coerce_quiz_shape(topic, raw, num_mcq)
        except Exception:
            pass

    return _fallback_quiz(
        topic,
        contexts,
        num_mcq,
        difficulty=difficulty,
        error="LLM did not return parseable JSON",
    )


if __name__ == '__main__':
    # example usage
    sample_ctx = ["Diversification reduces unsystematic risk by spreading investments."]
    print(generate_quiz('Diversification', sample_ctx))
