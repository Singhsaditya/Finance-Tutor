import os
import sys
import json
import numpy as np
import faiss
from dotenv import load_dotenv

sys.path.append(os.path.dirname(__file__))
from _gemini_client import embed_texts

load_dotenv()

PERSIST_DIR = os.getenv('PERSIST_DIR', os.path.join(os.path.dirname(__file__), '..', 'vector_db'))
PERSIST_DIR = os.path.normpath(PERSIST_DIR)
INDEX_PATH = os.getenv('PERSIST_INDEX_PATH', os.path.join(PERSIST_DIR, 'faiss_index.idx'))
METADATA_PATH = os.getenv('METADATA_PATH', os.path.join(PERSIST_DIR, 'metadata.json'))


def load_index():
    if not os.path.exists(INDEX_PATH):
        raise FileNotFoundError('Index not found. Run ingestion first.')
    index = faiss.read_index(INDEX_PATH)
    with open(METADATA_PATH, 'r', encoding='utf-8') as fh:
        metadata = json.load(fh)
    return index, metadata


def retrieve(query: str, top_k: int = 5):
    index, metadata = load_index()
    q_emb = embed_texts([query])[0]
    q_vec = np.array([q_emb]).astype('float32')
    D, I = index.search(q_vec, top_k)
    results = []
    for idx in I[0]:
        if idx < len(metadata):
            results.append(metadata[idx]['text'])
    return results


if __name__ == '__main__':
    # quick smoke test
    print(retrieve('What is diversification?', top_k=3))
