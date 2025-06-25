import faiss
import json
import numpy as np
import os
from tqdm import tqdm

def index_embeddings(embedding_json_path: str, output_name: str = "faiss_paragraphs"):
    output_dir = "data/index"
    metadata_dir = "data/metadata"
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(metadata_dir, exist_ok=True)

    with open(embedding_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    vectors = []
    metadata = []

    for item in tqdm(data, desc="📦 Indexing"):
        vec = np.array(item["embedding"], dtype=np.float32)
        if np.linalg.norm(vec) == 0: continue
        vectors.append(vec)
        metadata.append({
            "book_id": item["book_id"],
            "page": item["page"],
            "paragraph_id": item["paragraph_id"],
            "original_text": item["original_text"],
            "format": item.get("format", ""),
            "file_size_mb": item.get("file_size_mb", 0), 
            "modified_date": item.get("modified_date", "")
        })

    vectors_np = np.vstack(vectors)

    index = faiss.IndexFlatIP(vectors_np.shape[1])
    index.add(vectors_np)

    index_path = os.path.join(output_dir, f"{output_name}.index")
    metadata_path = os.path.join(metadata_dir, f"{output_name}_metadata.json")  

    faiss.write_index(index, index_path)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)





# import faiss
# import json
# import numpy as np
# from tqdm import tqdm

# with open("embeddings_por_parrafo.json", "r", encoding="utf-8") as f:
#     data = json.load(f)

# vectors = []
# metadata = []

# for item in tqdm(data, desc="📦 Indexando"):
#     vec = np.array(item["embedding"], dtype=np.float32)
#     if np.linalg.norm(vec) == 0: continue
#     vectors.append(vec)
#     metadata.append({
#         "libro_id": item["libro_id"],
#         "pagina": item["pagina"],
#         "parrafo_id": item["parrafo_id"],
#         "texto_original": item["texto_original"]
#     })

# vectors_np = np.vstack(vectors)
# index = faiss.IndexFlatIP(vectors_np.shape[1])
# index.add(vectors_np)

# faiss.write_index(index, "faiss_parrafos.index")
# with open("faiss_metadata.json", "w", encoding="utf-8") as f:
#     json.dump(metadata, f, ensure_ascii=False, indent=2)
