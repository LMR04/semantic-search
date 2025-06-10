import spacy
from pdf2image import convert_from_path
from pytesseract import image_to_string
import pytesseract
from PIL import Image
import os
import json
import PyPDF2

# --- 0. Configuración inicial de spaCy ---
try:
    nlp = spacy.load("es_core_news_sm")
    print("Modelo de spaCy 'es_core_news_sm' cargado exitosamente.")
except OSError:
    print("El modelo de spaCy 'es_core_news_sm' no se encontró. Por favor, ejecute:")
    print("python -m spacy download es_core_news_sm")
    exit()

# --- Definición de la función de procesamiento con spaCy ---
def process_text_with_spacy(text):
    if not isinstance(text, str):
        return {
            "tokens": [],
            "lemmas": [],
            "pos_tags": [],
            "entities": [],
            "cleaned_text": "",
            "cleaned_sentences": []
        }

    doc = nlp(text.lower())

    tokens = []
    lemmas = []
    pos_tags = []
    cleaned_tokens = []

    for token in doc:
        tokens.append(token.text)
        lemmas.append(token.lemma_)
        pos_tags.append({"text": token.text, "pos": token.pos_})
        if not token.is_stop and not token.is_punct and not token.is_space and not token.like_num:
            cleaned_tokens.append(token.lemma_)

    entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]

    cleaned_sentences = []
    for sent in doc.sents:
        filtered = [
            token.lemma_ for token in sent
            if not token.is_stop and not token.is_punct and not token.is_space and not token.like_num
        ]
        if filtered:
            cleaned_sentences.append(" ".join(filtered))

    return {
        "tokens": tokens,
        "lemmas": lemmas,
        "pos_tags": pos_tags,
        "entities": entities,
        "cleaned_text": " ".join(cleaned_tokens),
        "cleaned_sentences": cleaned_sentences
    }

# --- Configura la ruta de Tesseract y Poppler ---
pytesseract.pytesseract.tesseract_cmd = r'D:/Tesseract/tesseract.exe'
poppler_path = r'D:/Downloads/Release-24.08.0-0/poppler-24.08.0/Library/bin'

# Ruta al PDF de entrada
pdf_path = 'test.pdf'

# --- 1. Extraer Metadata del PDF ---
pdf_metadata = {}
try:
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        info = reader.metadata
        if info:
            for key, value in info.items():
                pdf_metadata[key] = str(value)
        pdf_metadata['total_pages'] = len(reader.pages)
        print(f"Metadata del PDF extraída: {pdf_metadata}")
except Exception as e:
    print(f"No se pudo extraer la metadata del PDF: {e}")
    pdf_metadata['total_pages'] = 0

# Convertir PDF a imágenes (una por página)
print(f"Convirtiendo '{pdf_path}' a imágenes...")
pages = convert_from_path(pdf_path, dpi=300, poppler_path=poppler_path)

if pdf_metadata['total_pages'] == 0:
    pdf_metadata['total_pages'] = len(pages)

print(f"PDF convertido. Se encontraron {len(pages)} páginas.")

# Lista para almacenar los datos de cada página
ocr_data_por_pagina = []

# Extraer texto usando OCR, página por página
for i, page in enumerate(pages):
    page_number = i + 1
    print(f"Procesando Página {page_number}...")

    image_path = f"page_{page_number}.png"
    page.save(image_path, 'PNG')

    extracted_text = image_to_string(Image.open(image_path), lang='spa')

    # --- NUEVO BLOQUE DE LIMPIEZA ---
    text_sin_saltos = extracted_text.replace('\n', ' ')

    # --- Análisis con spaCy usando texto limpio ---
    spacy_analysis = process_text_with_spacy(text_sin_saltos)

    page_data = {
        "page_number": page_number,
        "processed_text": {
            "tokens": spacy_analysis["tokens"],
            "lemmas": spacy_analysis["lemmas"],
            "pos_tags": spacy_analysis["pos_tags"],
            "entities": spacy_analysis["entities"],
            "cleaned_text_for_search": spacy_analysis["cleaned_text"],
            "cleaned_sentences": spacy_analysis["cleaned_sentences"]
        }
    }

    ocr_data_por_pagina.append(page_data)
    os.remove(image_path)
    print(f"Página {page_number} procesada.")

# --- 2. Preparar el Diccionario Final para JSON ---
final_json_output = {
    "file_path": os.path.abspath(pdf_path),
    "document_name": os.path.basename(pdf_path),
    "pdf_metadata": pdf_metadata,
    "pages": ocr_data_por_pagina
}

# --- 3. Guardar en un Archivo JSON ---
output_json_filename = 'documento_ocr_spacy_data.json'

try:
    with open(output_json_filename, 'w', encoding='utf-8') as f:
        json.dump(final_json_output, f, ensure_ascii=False, indent=4)
    print(f"\n¡Los datos de OCR y análisis de spaCy se han guardado exitosamente en '{output_json_filename}'!")
except IOError as e:
    print(f"Error al guardar el archivo JSON '{output_json_filename}': {e}")
except Exception as e:
    print(f"Ocurrió un error inesperado al escribir el JSON: {e}")
