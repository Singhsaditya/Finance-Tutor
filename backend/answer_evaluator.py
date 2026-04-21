import os
import json
import re
import sys
sys.path.append(os.path.dirname(__file__))
from _gemini_client import generate_text


def build_evaluator_prompt(question: str, user_answer: str, reference: str, level: str = "intermediate") -> str:
    lvl = (level or "intermediate").strip().lower()
    if lvl not in {"beginner", "intermediate", "advanced"}:
        lvl = "intermediate"

    level_instruction = {
        "beginner": "Use beginner-friendly expectations and plain-language feedback.",
        "intermediate": "Use moderate conceptual and applied expectations.",
        "advanced": "Use strict, advanced expectations with technical precision.",
    }[lvl]

    prompt = (
        "You are an expert finance tutor. Evaluate the student answer against the reference knowledge.\n"
        f"Student level: {lvl}. {level_instruction}\n"
        "Return a JSON object with keys: score (0-10), correctness (true/false), explanation, improvement_tip.\n"
        "Use the reference to judge correctness. Reference:\n" + reference + "\n\n"
        f"QUESTION: {question}\nUSER_ANSWER: {user_answer}\n"
    )
    return prompt


def _parse_eval_json(resp: str) -> dict:
    text = re.sub(r"```(?:json)?|```", "", (resp or ""), flags=re.IGNORECASE).strip()
    if not text:
        return {}
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    start = text.find("{")
    if start == -1:
        return {}
    depth = 0
    for i in range(start, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    parsed = json.loads(text[start : i + 1])
                    if isinstance(parsed, dict):
                        return parsed
                except Exception:
                    return {}
                break
    return {}


def evaluate_answer(question: str, user_answer: str, reference: str, level: str = "intermediate") -> dict:
    prompt = build_evaluator_prompt(question, user_answer, reference, level=level)
    try:
        resp = generate_text(prompt, temperature=0.0)
    except Exception as exc:
        return {
            "score": 0,
            "correctness": False,
            "explanation": f"Evaluation failed: {exc}",
            "improvement_tip": "Retry after checking backend model/API configuration.",
        }

    out = _parse_eval_json(resp)
    if not out:
        return {
            "score": 0,
            "correctness": False,
            "explanation": str(resp).strip() or "No JSON returned",
            "improvement_tip": "",
        }

    score_raw = out.get("score", 0)
    try:
        score = int(round(float(score_raw)))
    except Exception:
        score = 0
    score = max(0, min(10, score))

    return {
        "score": score,
        "correctness": bool(out.get("correctness", score >= 6)),
        "explanation": str(out.get("explanation", "")).strip(),
        "improvement_tip": str(out.get("improvement_tip", "")).strip(),
    }


if __name__ == '__main__':
    ref = 'Diversification reduces unsystematic risk by spreading investments across assets.'
    print(evaluate_answer('What is diversification?', 'Spreading investments reduces risk.', ref))
