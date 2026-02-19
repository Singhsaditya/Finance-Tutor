import os
import sys
from typing import List
from dotenv import load_dotenv

sys.path.append(os.path.dirname(__file__))
from retrieval import retrieve
from _gemini_client import generate_text

load_dotenv()


def build_prompt(question: str, contexts: List[str]) -> str:
    header = (
        "Use ONLY the provided finance context to answer the question. If the answer is not contained in the context, say you don't know.\n\n"
    )
    ctx = '\n---\n'.join(contexts)
    prompt = f"{header}CONTEXT:\n{ctx}\n\nQUESTION: {question}\n\nAnswer concisely and cite context chunk indexes if helpful."
    return prompt


def answer_question(question: str, top_k: int = 5) -> dict:
    contexts = retrieve(question, top_k=top_k)
    prompt = build_prompt(question, contexts)
    answer = generate_text(prompt, temperature=0.0)
    return {
        'question': question,
        'answer': answer,
        'contexts': contexts
    }


if __name__ == '__main__':
    print(answer_question('What is diversification?'))
