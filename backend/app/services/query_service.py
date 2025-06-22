import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer

# === Rutas ===
faiss_index_path = 'faiss_parrafos.index'
metadata_path = 'faiss_metadata.json'

# === Cargar índice FAISS ===
index = faiss.read_index(faiss_index_path)

# === Cargar metadatos ===
with open(metadata_path, 'r', encoding='utf-8') as f:
    metadatos = json.load(f)

# === Cargar modelo de embeddings ===
print("🧠 Cargando modelo de SentenceTransformer...")
# model = SentenceTransformer('hiiamsid/sentence_similarity_spanish_es') # Puedes usar el que entrenaste
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')

# === Definir búsqueda ===
def buscar_parrafos(query, top_k=5):
    # Obtener embedding del query
    embedding = model.encode(query, convert_to_numpy=True).astype(np.float32)

    # Normalizar el query (para compatibilidad con FAISS IP)
    norm = np.linalg.norm(embedding)
    if norm == 0:
        print("❌ El embedding del query es nulo.")
        return []
    embedding /= norm

    # Buscar en FAISS
    D, I = index.search(embedding.reshape(1, -1), top_k)

    resultados = []
    for score, idx in zip(D[0], I[0]):
        if idx < 0 or idx >= len(metadatos):
            continue  # Seguridad ante errores

        item = metadatos[idx]
        resultados.append({
            "libro_id": item["libro_id"],
            "pagina": item["pagina"],
            "parrafo_id": item["parrafo_id"],
            "texto_original": item.get("texto_original", ""),
            "similaridad": float(score)  # Producto interno (normalizado) ≈ coseno
        })

    # Ordenar por mayor similaridad (aunque ya vienen así)
    resultados.sort(key=lambda x: x["similaridad"], reverse=True)

    return resultados

# === Ejecutar búsqueda ===
if __name__ == "__main__":
    query = input("🔎 Ingresa tu consulta: ")

    resultados = buscar_parrafos(query, top_k=5)

    if not resultados:
        print("❌ No se encontraron resultados.")
    else:
        print("\n📚 Resultados más relevantes:")
        for r in resultados:
            print(f"\n➡️ Libro: {r['libro_id']}, Página: {r['pagina']}, Párrafo: {r['parrafo_id']}")
            print(f"🔗 Similaridad: {r['similaridad']:.4f}")
            print(f"📝 Texto: {r['texto_original']}")
