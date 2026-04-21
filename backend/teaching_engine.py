import os
import sys
import json
import re
sys.path.append(os.path.dirname(__file__))
from _gemini_client import generate_text


def build_teach_prompt(concept: str, reference: str) -> str:
    prompt = (
        f"A student has misconceptions about: {concept}. Using the reference knowledge below, explain the concept in simple terms, give a short real-world example, and suggest a next topic to study.\n"
        "Return JSON with keys: explanation, example, next_topic.\n\n"
        "REFERENCE:\n" + reference
    )
    return prompt


def _parse_teach_json(resp: str) -> dict:
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


def teach(concept: str, reference: str) -> dict:
    prompt = build_teach_prompt(concept, reference)
    try:
        resp = generate_text(prompt, temperature=0.2)
    except Exception as exc:
        return {
            "explanation": f"Unable to generate lesson right now: {exc}",
            "example": "",
            "next_topic": "",
        }

    out = _parse_teach_json(resp)
    if out:
        return {
            "explanation": str(out.get("explanation", "")).strip() or str(resp).strip(),
            "example": str(out.get("example", "")).strip(),
            "next_topic": str(out.get("next_topic", "")).strip(),
        }
    return {"explanation": str(resp).strip(), "example": "", "next_topic": ""}


if __name__ == '__main__':
    ref = 'Diversification reduces unsystematic risk by spreading investments across assets.'
    print(teach('diversification', ref))
