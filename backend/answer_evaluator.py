import os
import json
import sys
sys.path.append(os.path.dirname(__file__))
from _gemini_client import generate_text


def build_evaluator_prompt(question: str, user_answer: str, reference: str) -> str:
    prompt = (
        "You are an expert finance tutor. Evaluate the student answer against the reference knowledge.\n"
        "Return a JSON object with keys: score (0-10), correctness (true/false), explanation, improvement_tip.\n"
        "Use the reference to judge correctness. Reference:\n" + reference + "\n\n"
        f"QUESTION: {question}\nUSER_ANSWER: {user_answer}\n"
    )
    return prompt


def evaluate_answer(question: str, user_answer: str, reference: str) -> dict:
    prompt = build_evaluator_prompt(question, user_answer, reference)
    resp = generate_text(prompt, temperature=0.0)
    try:
        out = json.loads(resp)
    except Exception:
        import re
        m = re.search(r"\{.*\}", resp, re.S)
        if m:
            out = json.loads(m.group(0))
        else:
            out = {"error": "No JSON returned", "raw": resp}
    return out


if __name__ == '__main__':
    ref = 'Diversification reduces unsystematic risk by spreading investments across assets.'
    print(evaluate_answer('What is diversification?', 'Spreading investments reduces risk.', ref))
