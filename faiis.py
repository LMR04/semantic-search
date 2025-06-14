import faiss
import json
import numpy as np
from tqdm import tqdm

# === Rutas de entrada/salida ===
embedding_json_path = 'embeddings_por_parrafo.json'
faiss_index_path = 'faiss_parrafos.index'
metadata_path = 'faiss_metadata.json'

# === Cargar embeddings desde JSON ===
with open(embedding_json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

embeddings = []
metadatos = []

print(f"📥 Cargando {len(data)} vectores para indexar...")

for item in tqdm(data):
    vector = item.get("embedding")

    # Validación básica
    if not vector or len(vector) != 768:
        print(f"❌ Vector inválido en libro: {item.get('libro_id')}, pág: {item.get('pagina')}, párrafo: {item.get('parrafo_id')}")
        continue

    vec_np = np.array(vector, dtype=np.float32)

    # === Normalización (para usar similaridad coseno con FAISS IndexFlatIP) ===
    norm = np.linalg.norm(vec_np)
    if norm == 0:
        continue  # Saltar vectores nulos
    vec_np /= norm

    embeddings.append(vec_np)

    # Guardar metadata útil para los resultados de búsqueda
    metadatos.append({
        "libro_id": item.get("libro_id"),
        "pagina": item.get("pagina"),
        "parrafo_id": item.get("parrafo_id"),
        "texto_original": item.get("texto_original", "")  # Asegura que esté presente
    })

# === Convertir a matriz numpy final ===
embedding_matrix = np.vstack(embeddings)

# === Crear índice FAISS con producto interno (IP) ===
dimension = embedding_matrix.shape[1]
index = faiss.IndexFlatIP(dimension)  # Similaridad coseno si los vectores están normalizados

print("⚙️ Agregando vectores al índice FAISS...")
index.add(embedding_matrix)

# === Guardar índice y metadatos ===
faiss.write_index(index, faiss_index_path)
with open(metadata_path, 'w', encoding='utf-8') as f:
    json.dump(metadatos, f, ensure_ascii=False, indent=2)

print(f"\n✅ Índice FAISS guardado en '{faiss_index_path}'")
print(f"🧾 Metadatos guardados en '{metadata_path}' (ordenados por posición en FAISS)")