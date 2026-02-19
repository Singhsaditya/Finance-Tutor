import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

sys.path.append(os.path.dirname(__file__))
load_dotenv()

from rag_engine import answer_question
from retrieval import retrieve
from quiz_generator import generate_quiz
from answer_evaluator import evaluate_answer
from teaching_engine import teach

app = FastAPI(title='Finance Tutor API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskIn(BaseModel):
    question: str


class QuizIn(BaseModel):
    topic: str
    top_k: int = 5


class EvalIn(BaseModel):
    question: str
    user_answer: str
    reference: str = None


class TeachIn(BaseModel):
    concept: str
    reference: str


@app.post('/ask')
def ask(in_data: AskIn):
    res = answer_question(in_data.question)
    return res


@app.post('/quiz')
def quiz(in_data: QuizIn):
    contexts = retrieve(in_data.topic, top_k=in_data.top_k)
    quiz = generate_quiz(in_data.topic, contexts)
    return quiz


@app.post('/evaluate')
def evaluate(in_data: EvalIn):
    reference = in_data.reference
    if not reference:
        # try to retrieve reference context
        ctxs = retrieve(in_data.question, top_k=3)
        reference = '\n'.join(ctxs)
    out = evaluate_answer(in_data.question, in_data.user_answer, reference)
    return out


@app.post('/teach')
def teach_route(in_data: TeachIn):
    out = teach(in_data.concept, in_data.reference)
    return out


@app.get('/status')
def status():
    return {'status': 'ok'}
