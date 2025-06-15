import faiss
import json
import numpy as np
from tqdm import tqdm

with open("embeddings_por_parrafo.json", "r", encoding="utf-8") as f:
    data = json.load(f)

vectors = []
metadata = []

for item in tqdm(data, desc="📦 Indexando"):
    vec = np.array(item["embedding"], dtype=np.float32)
    if np.linalg.norm(vec) == 0: continue
    vectors.append(vec)
    metadata.append({
        "libro_id": item["libro_id"],
        "pagina": item["pagina"],
        "parrafo_id": item["parrafo_id"],
        "texto_original": item["texto_original"]
    })

vectors_np = np.vstack(vectors)
index = faiss.IndexFlatIP(vectors_np.shape[1])
index.add(vectors_np)

faiss.write_index(index, "faiss_parrafos.index")
with open("faiss_metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)
