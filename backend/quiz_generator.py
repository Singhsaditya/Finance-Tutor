import os
import json
import sys
from typing import List
sys.path.append(os.path.dirname(__file__))
from _gemini_client import generate_text


def build_quiz_prompt(topic: str, contexts: List[str]) -> str:
    prompt = (
        f"Using ONLY the provided finance context, generate a JSON object for a quiz on the topic '{topic}'.\n"
        "Include: 'mcqs' (list of {id, question, options (4), answer_index}), 'short_answer' (list of {id, question, reference_answer}).\n"
        "Return valid JSON only. Context follows:\n\n" + "\n---\n".join(contexts)
    )
    return prompt


def generate_quiz(topic: str, contexts: List[str], num_mcq: int = 3) -> dict:
    prompt = build_quiz_prompt(topic, contexts)
    resp_text = generate_text(prompt, temperature=0.2)
    try:
        quiz = json.loads(resp_text)
    except Exception:
        # wrap in fallback: try to extract JSON substring
        import re
        m = re.search(r"\{.*\}", resp_text, re.S)
        if m:
            quiz = json.loads(m.group(0))
        else:
            quiz = {"error": "LLM did not return valid JSON", "raw": resp_text}
    return quiz


if __name__ == '__main__':
    # example usage
    sample_ctx = ["Diversification reduces unsystematic risk by spreading investments."]
    print(generate_quiz('Diversification', sample_ctx))
