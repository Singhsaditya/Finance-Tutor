import os
import json
from typing import Any, Dict, List
try:
    import google.genai as genai  # preferred, newer SDK
except Exception:
    import google.generativeai as genai  # fallback to older package

def configure_from_env():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY not set in environment")
    # Older SDKs expose a `configure` helper; newer `google.genai` may not.
    if hasattr(genai, 'configure'):
        genai.configure(api_key=api_key)
    # Otherwise the API key is expected to be provided via environment or
    # the client library's own configuration mechanism.

def embed_texts(texts: List[str], model: str = None) -> List[List[float]]:
    configure_from_env()
    selected_model = model or os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
    candidates = [
        selected_model,
        "gemini-embedding-001",
        "text-embedding-004",
        "models/embedding-001",
        "embedding-001",
    ]
    deduped_candidates = []
    seen = set()
    for m in candidates:
        if m and m not in seen:
            seen.add(m)
            deduped_candidates.append(m)
    api_key = os.getenv("GEMINI_API_KEY")

    # New official SDK: google-genai
    if hasattr(genai, "Client"):
        client = genai.Client(api_key=api_key)
        last_exc = None
        for m in deduped_candidates:
            try:
                resp = client.models.embed_content(model=m, contents=texts)
                embeddings = []
                for item in getattr(resp, "embeddings", []) or []:
                    values = getattr(item, "values", None)
                    if values is None and isinstance(item, dict):
                        values = item.get("values")
                    embeddings.append(values)
                if embeddings and all(e is not None for e in embeddings):
                    return embeddings
            except Exception as exc:
                last_exc = exc
                continue
        if last_exc is not None:
            raise last_exc

    # Legacy SDK: google.generativeai
    if hasattr(genai, "embed_content"):
        last_exc = None
        for m in deduped_candidates:
            embeddings = []
            try:
                for text in texts:
                    resp = genai.embed_content(
                        model=m,
                        content=text,
                        task_type="retrieval_document",
                    )
                    if isinstance(resp, dict):
                        emb = resp.get("embedding")
                    else:
                        emb = getattr(resp, "embedding", None)
                    embeddings.append(emb)
                if embeddings and all(e is not None for e in embeddings):
                    return embeddings
            except Exception as exc:
                last_exc = exc
                continue
        if last_exc is not None:
            raise last_exc

    raise RuntimeError(
        "Installed Google GenAI package does not expose a compatible embeddings API.\n"
        "Install/update `google-genai` (`pip install -U google-genai`) or use a supported `google.generativeai` version."
    )

def generate_text(prompt: str, model: str = None, temperature: float = 0.0) -> str:
    configure_from_env()
    model = model or os.getenv("LLM_MODEL", "gemini-2.5-flash")
    api_key = os.getenv("GEMINI_API_KEY")

    # New official SDK: google-genai
    if hasattr(genai, "Client"):
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(
            model=model,
            contents=prompt,
            config={"temperature": temperature},
        )
        text = getattr(resp, "text", None)
        if text:
            return text

    # Legacy SDK: google.generativeai
    if hasattr(genai, "GenerativeModel"):
        mdl = genai.GenerativeModel(model)
        resp = mdl.generate_content(
            prompt,
            generation_config={"temperature": temperature},
        )
        text = getattr(resp, "text", None)
        if text:
            return text
        if hasattr(resp, "candidates") and resp.candidates:
            parts = getattr(resp.candidates[0].content, "parts", None)
            if parts:
                return "".join(getattr(p, "text", "") for p in parts if hasattr(p, "text"))

    # Last-resort fallback for any dict-like response shapes.
    resp = None
    if hasattr(genai, "generate"):
        resp = genai.generate(model=model, prompt=prompt, temperature=temperature)
    if isinstance(resp, dict):
        if "content" in resp:
            return resp["content"]
        if "candidates" in resp and resp["candidates"]:
            c0 = resp["candidates"][0]
            if isinstance(c0, dict):
                return c0.get("content", str(resp))
    return str(resp)
