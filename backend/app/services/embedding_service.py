import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import os

model = SentenceTransformer('multi-qa-mpnet-base-dot-v1')

def generate_embeddings(input_json_path: str, output_json_path: str = None) -> str:

    try:
        with open(input_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        embbedded_data = []

        for item in tqdm(data, desc="Generating embeddings"):
            text = item.get("processed_text", "").strip()

            if text:
                embedding = model.encode(text, normalize_embeddings=True).tolist()
                embbedded_data.append({
                    "book_id": item.get("book_id"),
                    "page": item.get("page"),
                    "paragraph_id": item.get("paragraph_id"),
                    "embedding": embedding,
                    "original_text": item.get("original_text", ""),
                    "format": item.get("format", ""),
                    "file_size_mb": item.get("file_size_mb", 0),
                    "modified_date": item.get("modified_date", "")
                })

        os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
        with open(output_json_path, 'w', encoding='utf-8') as out_file:
            json.dump(embbedded_data, out_file, ensure_ascii=False, indent=2)

        return output_json_path
    
    except FileNotFoundError:
        raise FileNotFoundError(f"File not found: {input_json_path}")
    except json.JSONDecodeError:
        raise json.JSONDecodeError("Error decoding JSON file. Check its format.")
    except Exception as e:
        raise Exception(f"Unexpected error: {e}")

# import json
# from sentence_transformers import SentenceTransformer
# from tqdm import tqdm

# # Rutas
# input_json_path = 'datos_planos_por_parrafo.json'
# output_json_path = 'embeddings_por_parrafo.json'

# # Modelo de embeddings
# model = SentenceTransformer('multi-qa-mpnet-base-dot-v1')

# try:
#     # Cargar datos planos
#     with open(input_json_path, 'r', encoding='utf-8') as f:
#         data = json.load(f)

#     print(f"📄 Total de párrafos a procesar: {len(data)}")

#     # Lista para almacenar los resultados
#     embedded_data = []

#     for item in tqdm(data, desc="Generando embeddings"):
#         texto = item.get("texto_procesado", "").strip()

#         if texto:
#             embedding = model.encode(texto, normalize_embeddings=True).tolist()

#             embedded_data.append({
#                 "libro_id": item.get("libro_id"),
#                 "pagina": item.get("pagina"),
#                 "parrafo_id": item.get("parrafo_id"),
#                 "embedding": embedding,
#                 "texto_original": item.get("texto_original", "")
#             })
#         else:
#             print(f"[!] Párrafo vacío en libro: {item.get('libro_id')}, página: {item.get('pagina')}, párrafo: {item.get('parrafo_id')}")

#     # Guardar embeddings
#     with open(output_json_path, 'w', encoding='utf-8') as out_file:
#         json.dump(embedded_data, out_file, ensure_ascii=False, indent=2)

#     print(f"\n✅ Embeddings guardados exitosamente en '{output_json_path}'.")

# except FileNotFoundError:
#     print(f"❌ Archivo no encontrado: {input_json_path}")
# except json.JSONDecodeError:
#     print("❌ Error al decodificar el archivo JSON. Verifica su formato.")
# except Exception as e:
#     print(f"❌ Error inesperado: {e}")
