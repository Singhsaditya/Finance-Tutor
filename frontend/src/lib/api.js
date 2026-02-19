import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function extractErrorMessage(error, fallback) {
  if (error?.response?.data?.detail) return String(error.response.data.detail);
  if (error?.response?.data?.error) return String(error.response.data.error);
  if (error?.message) return error.message;
  return fallback;
}

export async function askQuestion(question) {
  try {
    const { data } = await api.post("/ask", { question });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to ask question."));
  }
}

export async function generateQuiz(topic, topK) {
  try {
    const { data } = await api.post("/quiz", { topic, top_k: topK });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to generate quiz."));
  }
}

export async function evaluateAnswer(question, userAnswer, reference) {
  try {
    const payload = { question, user_answer: userAnswer };
    if (reference && reference.trim()) payload.reference = reference.trim();
    const { data } = await api.post("/evaluate", payload);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to evaluate answer."));
  }
}

export async function teachConcept(concept, reference) {
  try {
    const { data } = await api.post("/teach", { concept, reference });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Failed to generate teaching output."));
  }
}

