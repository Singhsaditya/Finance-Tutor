import os
import sys
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from dotenv import load_dotenv

sys.path.append(os.path.dirname(__file__))
load_dotenv()

from rag_engine import answer_question
from retrieval import retrieve
from quiz_generator import generate_quiz
from answer_evaluator import evaluate_answer
from teaching_engine import teach
from auth import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user_optional,
    get_current_user_required,
    get_dashboard_data,
    record_activity,
)

app = FastAPI(title='Finance Tutor API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://16.171.44.185:3000"],  # exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskIn(BaseModel):
    question: Optional[str] = None
    query: Optional[str] = None
    top_k: int = 5
    session_id: Optional[str] = None


class QuizIn(BaseModel):
    topic: str
    top_k: int = 5
    count: Optional[int] = None
    difficulty: Optional[str] = None


class EvalIn(BaseModel):
    question: Optional[str] = None
    question_id: Optional[str] = None
    user_answer: Optional[str] = None
    student_answer: Optional[str] = None
    reference: Optional[str] = None
    expected_answer: Optional[str] = None
    level: Optional[str] = None


class TeachIn(BaseModel):
    concept: Optional[str] = None
    reference: Optional[str] = None
    topic: Optional[str] = None
    level: Optional[str] = None
    objectives: Optional[List[str]] = None


class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


@app.post('/api/auth/signup')
def auth_signup(in_data: SignupIn):
    user = create_user(in_data.name, in_data.email, in_data.password)
    token = create_access_token(user)
    return {"access_token": token, "user": user}


@app.post('/api/auth/login')
def auth_login(in_data: LoginIn):
    user = authenticate_user(in_data.email, in_data.password)
    token = create_access_token(user)
    return {"access_token": token, "user": user}


@app.get('/api/auth/me')
def auth_me(current_user=Depends(get_current_user_required)):
    return {"user": current_user}


@app.get('/api/dashboard')
def dashboard(current_user=Depends(get_current_user_required)):
    return get_dashboard_data(current_user["id"])


@app.post('/ask')
@app.post('/api/ask')
def ask(in_data: AskIn, current_user=Depends(get_current_user_optional)):
    question = (in_data.question or in_data.query or '').strip()
    if not question:
        raise HTTPException(status_code=400, detail='Missing question/query')
    res = answer_question(question)
    if current_user:
        record_activity(current_user["id"], "ask", question)
    return res


@app.post('/quiz')
@app.post('/api/quiz')
def quiz(in_data: QuizIn, current_user=Depends(get_current_user_optional)):
    contexts = retrieve(in_data.topic, top_k=in_data.top_k)
    num_mcq = in_data.count if in_data.count and in_data.count > 0 else 3
    difficulty = (in_data.difficulty or "medium").strip().lower()
    quiz = generate_quiz(
        in_data.topic,
        contexts,
        num_mcq=num_mcq,
        difficulty=difficulty,
    )
    if current_user:
        record_activity(
            current_user["id"],
            "quiz",
            f"Quiz: {in_data.topic}",
            metadata={"difficulty": difficulty},
        )
    return quiz


@app.post('/evaluate')
@app.post('/api/evaluate')
def evaluate(in_data: EvalIn, current_user=Depends(get_current_user_optional)):
    question = (in_data.question or in_data.question_id or '').strip()
    user_answer = (in_data.user_answer or in_data.student_answer or '').strip()
    if not question or not user_answer:
        raise HTTPException(status_code=400, detail='Missing question or answer')

    reference = in_data.reference or in_data.expected_answer
    if not reference:
        # try to retrieve reference context
        ctxs = retrieve(question, top_k=3)
        reference = '\n'.join(ctxs)
    level = (in_data.level or "intermediate").strip().lower()
    out = evaluate_answer(question, user_answer, reference, level=level)
    if current_user:
        score = out.get("score", 0)
        max_score = out.get("max_score", 10) or 10
        pct = 0
        try:
            pct = round((float(score) / float(max_score)) * 100, 2)
        except Exception:
            pct = 0
        record_activity(
            current_user["id"],
            "evaluate",
            f"Evaluate: {question[:120]}",
            metadata={"score_percent": pct, "level": level},
        )
    return out


@app.post('/teach')
@app.post('/api/teach')
def teach_route(in_data: TeachIn, current_user=Depends(get_current_user_optional)):
    concept = (in_data.concept or in_data.topic or '').strip()
    if not concept:
        raise HTTPException(status_code=400, detail='Missing concept/topic')

    reference = in_data.reference
    if not reference:
        objectives_text = '\n'.join(in_data.objectives or [])
        level = (in_data.level or 'beginner').strip()
        reference = objectives_text or f'Teach {concept} for a {level} student.'

    out = teach(concept, reference)
    if current_user:
        record_activity(current_user["id"], "teach", f"Learn: {concept}")
    return out


@app.get('/status')
@app.get('/api/status')
def status():
    return {'status': 'ok'}
