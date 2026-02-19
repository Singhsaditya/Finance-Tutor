import os
import sys
import glob
import json
import pickle
from typing import List
import numpy as np
import faiss
from dotenv import load_dotenv

# ensure backend directory on path when running from repo root
sys.path.append(os.path.dirname(__file__))
from _gemini_client import embed_texts

load_dotenv()

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
DATA_DIR = os.path.normpath(DATA_DIR)
PERSIST_DIR = os.getenv('PERSIST_DIR', os.path.join(os.path.dirname(__file__), '..', 'vector_db'))
PERSIST_DIR = os.path.normpath(PERSIST_DIR)
INDEX_PATH = os.getenv('PERSIST_INDEX_PATH', os.path.join(PERSIST_DIR, 'faiss_index.idx'))
METADATA_PATH = os.getenv('METADATA_PATH', os.path.join(PERSIST_DIR, 'metadata.json'))

CHUNK_SIZE = 1200  # approx chars per chunk


def read_files(data_dir: str) -> List[str]:
    files = glob.glob(os.path.join(data_dir, '*.txt'))
    docs = []
    for f in files:
        with open(f, 'r', encoding='utf-8') as fh:
            docs.append(fh.read())
    return docs


def chunk_text(text: str, size: int = CHUNK_SIZE) -> List[str]:
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks = []
    for p in paragraphs:
        if len(p) <= size:
            chunks.append(p)
        else:
            # split larger paragraphs into size-limited chunks
            for i in range(0, len(p), size):
                chunks.append(p[i:i+size])
    return chunks


def ingest():
    os.makedirs(PERSIST_DIR, exist_ok=True)
    docs = read_files(DATA_DIR)
    all_chunks = []
    metadata = []
    for i, doc in enumerate(docs):
        chunks = chunk_text(doc)
        for j, c in enumerate(chunks):
            all_chunks.append(c)
            metadata.append({
                'doc_id': i,
                'chunk_id': j,
                'text': c[:1000]
            })

    if not all_chunks:
        print('No chunks found in data directory.')
        return

    print(f'Generating embeddings for {len(all_chunks)} chunks...')
    embeddings = embed_texts(all_chunks)
    vecs = np.array(embeddings).astype('float32')
    dim = vecs.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(vecs)

    # persist index
    faiss.write_index(index, INDEX_PATH)
    with open(METADATA_PATH, 'w', encoding='utf-8') as fh:
        json.dump(metadata, fh, ensure_ascii=False, indent=2)

    print('Ingestion complete. Index saved to', INDEX_PATH)


if __name__ == '__main__':
    ingest()
