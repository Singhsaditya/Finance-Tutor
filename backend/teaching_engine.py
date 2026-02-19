import os
import sys
sys.path.append(os.path.dirname(__file__))
from _gemini_client import generate_text


def build_teach_prompt(concept: str, reference: str) -> str:
    prompt = (
        f"A student has misconceptions about: {concept}. Using the reference knowledge below, explain the concept in simple terms, give a short real-world example, and suggest a next topic to study.\n"
        "Return JSON with keys: explanation, example, next_topic.\n\n"
        "REFERENCE:\n" + reference
    )
    return prompt


def teach(concept: str, reference: str) -> dict:
    prompt = build_teach_prompt(concept, reference)
    resp = generate_text(prompt, temperature=0.2)
    import json, re
    try:
        out = json.loads(resp)
    except Exception:
        m = re.search(r"\{.*\}", resp, re.S)
        if m:
            out = json.loads(m.group(0))
        else:
            out = {"explanation": resp}
    return out


if __name__ == '__main__':
    ref = 'Diversification reduces unsystematic risk by spreading investments across assets.'
    print(teach('diversification', ref))
