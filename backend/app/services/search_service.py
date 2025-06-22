import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer, CrossEncoder

# === Cargar todo ===
faiss_index = faiss.read_index("faiss_parrafos.index")
with open("faiss_metadata.json", "r", encoding="utf-8") as f:
    metadata = json.load(f)

encoder = SentenceTransformer("multi-qa-mpnet-base-dot-v1")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")  # rápido y preciso

def buscar(query, top_k=10):
    query_emb = encoder.encode(query, normalize_embeddings=True).astype(np.float32).reshape(1, -1)
    D, I = faiss_index.search(query_emb, top_k)

    candidatos = []
    pares_rerank = []

    for idx in I[0]:
        meta = metadata[idx]
        texto = meta["texto_original"]
        candidatos.append(meta)
        pares_rerank.append((query, texto))

    scores = reranker.predict(pares_rerank)

    # Rerank
    rerank_result = sorted(zip(candidatos, scores), key=lambda x: x[1], reverse=True)

    return [{
        "libro_id": r[0]["libro_id"],
        "pagina": r[0]["pagina"],
        "parrafo_id": r[0]["parrafo_id"],
        "texto": r[0]["texto_original"],
        "score": round(float(r[1]), 4)
    } for r in rerank_result]

# === Ejecutar ===
if __name__ == "__main__":
    while True:
        query = input("🔎 Pregunta: ")
        resultados = buscar(query)

        print("\n📚 Párrafos más relevantes:")
        for r in resultados[:5]:
            print(f"\n➡️ Libro: {r['libro_id']}, Página: {r['pagina']}, Párrafo: {r['parrafo_id']}")
            print(f"⭐️ Score: {r['score']}")
            print(f"📝 {r['texto']}")

