import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Rutas
input_json_path = 'datos_planos_por_parrafo.json'
output_json_path = 'embeddings_por_parrafo.json'

# Modelo de embeddings
model = SentenceTransformer('multi-qa-mpnet-base-dot-v1')

try:
    # Cargar datos planos
    with open(input_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📄 Total de párrafos a procesar: {len(data)}")

    # Lista para almacenar los resultados
    embedded_data = []

    for item in tqdm(data, desc="Generando embeddings"):
        texto = item.get("texto_procesado", "").strip()

        if texto:
            embedding = model.encode(texto, normalize_embeddings=True).tolist()

            embedded_data.append({
                "libro_id": item.get("libro_id"),
                "pagina": item.get("pagina"),
                "parrafo_id": item.get("parrafo_id"),
                "embedding": embedding,
                "texto_original": item.get("texto_original", "")
            })
        else:
            print(f"[!] Párrafo vacío en libro: {item.get('libro_id')}, página: {item.get('pagina')}, párrafo: {item.get('parrafo_id')}")

    # Guardar embeddings
    with open(output_json_path, 'w', encoding='utf-8') as out_file:
        json.dump(embedded_data, out_file, ensure_ascii=False, indent=2)

    print(f"\n✅ Embeddings guardados exitosamente en '{output_json_path}'.")

except FileNotFoundError:
    print(f"❌ Archivo no encontrado: {input_json_path}")
except json.JSONDecodeError:
    print("❌ Error al decodificar el archivo JSON. Verifica su formato.")
except Exception as e:
    print(f"❌ Error inesperado: {e}")
