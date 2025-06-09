import json
from sentence_transformers import SentenceTransformer

# Ruta al archivo de entrada
json_path = 'documento_ocr_spacy_data.json'

# Ruta de salida del JSON con embeddings
output_json_path = 'documento_embeddings_por_pagina.json'

# Diccionario para almacenar embeddings por página
page_embeddings = {}

# Modelo preentrenado
model = SentenceTransformer('hiiamsid/sentence_similarity_spanish_es')

try:
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("Extrayendo y embebiendo 'cleaned_text_for_search' por página...\n")

    for page in data.get("pages", []):
        page_number = str(page.get("page_number", "Desconocido"))
        cleaned_text = page.get("processed_text", {}).get("cleaned_text_for_search", "")

        if cleaned_text.strip():
            embedding = model.encode(cleaned_text)
            page_embeddings[page_number] = embedding.tolist()  # Convertimos a lista para JSON
            print(f"[✓] Página {page_number} embebida.")
        else:
            print(f"[!] Página {page_number} vacía, se omite embedding.")

    # Guardar en un nuevo archivo JSON
    with open(output_json_path, 'w', encoding='utf-8') as out_file:
        json.dump(page_embeddings, out_file, ensure_ascii=False, indent=2)

    print(f"\n✅ Embeddings guardados exitosamente en '{output_json_path}'.")

except FileNotFoundError:
    print(f"❌ No se encontró el archivo JSON: {json_path}")
except json.JSONDecodeError:
    print("❌ Error al decodificar el archivo JSON. Asegúrate de que el formato sea válido.")
except Exception as e:
    print(f"❌ Ocurrió un error inesperado: {e}")