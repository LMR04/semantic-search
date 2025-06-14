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

# import faiss
# import json
# import numpy as np
# from tqdm import tqdm

# # === Rutas de entrada/salida ===
# embedding_json_path = 'embeddings_por_parrafo.json'
# faiss_index_path = 'faiss_parrafos.index'
# metadata_path = 'faiss_metadata.json'

# # === Cargar embeddings desde JSON ===
# with open(embedding_json_path, 'r', encoding='utf-8') as f:
#     data = json.load(f)

# embeddings = []
# metadatos = []

# print(f"📥 Cargando {len(data)} vectores para indexar...")

# # Cargar los vectores (embeddings) y sus metadatos
# for item in tqdm(data):
#     vector = item.get("embedding")

#     # Validación básica
#     if not vector or len(vector) != 768:
#         print(f"❌ Vector inválido en libro: {item.get('libro_id')}, pág: {item.get('pagina')}, párrafo: {item.get('parrafo_id')}")
#         continue

#     vec_np = np.array(vector, dtype=np.float32)

#     # === Normalización (para usar similaridad coseno con FAISS IndexFlatIP) ===
#     norm = np.linalg.norm(vec_np)
#     if norm == 0:
#         continue  # Saltar vectores nulos

#     embeddings.append(vec_np)
#     metadatos.append(item)  # Guardamos también los metadatos del documento

# # Convertimos la lista de embeddings en un array de NumPy
# embeddings = np.array(embeddings)

# # === FAISS: Configuración del índice IndexIVFPQ ===
# d = embeddings.shape[1]  # Dimensionalidad de los vectores (debe ser 768)
# nlist = 50  # Número de celdas (clusters)
# m = 8  # Número de sub-vectores para PQ (debe ser un divisor de d)
# nbits = 8  # Número de bits por sub-vector

# # Paso 1: Crear el cuantizador IVF
# quantizer = faiss.IndexFlatL2(d)  # Usamos L2 para distancia Euclidiana

# # Paso 2: Crear el índice IVFPQ
# index = faiss.IndexIVFPQ(quantizer, d, nlist, m, nbits)

# # Paso 3: Entrenar el índice (con una muestra representativa de los datos)
# print("🚀 Entrenando el índice...")

# # Para entrenar, necesitamos una muestra de vectores (puede ser una fracción de los datos)
# # Usaremos los primeros 10000 vectores para entrenar el índice
# index.train(embeddings[:10000])

# # Paso 4: Añadir los vectores al índice entrenado
# print(f"📦 Añadiendo {embeddings.shape[0]} vectores al índice...")
# index.add(embeddings)

# # Paso 5: Guardar el índice FAISS
# faiss.write_index(index, faiss_index_path)
# print(f"🗂 Índice guardado en {faiss_index_path}")

# # === Guardar metadatos (si es necesario) ===
# with open(metadata_path, 'w', encoding='utf-8') as f:
#     json.dump(metadatos, f, ensure_ascii=False, indent=4)
# print(f"📝 Metadatos guardados en {metadata_path}")