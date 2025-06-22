import spacy
from pdf2image import convert_from_path
from pytesseract import image_to_string
from PIL import Image
import os
import json
import PyPDF2
import pytesseract
import uuid

# Configuración de Tesseract y Poppler
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
poppler_path = r'C:\Users\ruzul\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin'

# Carga modelo spaCy
try:
    nlp = spacy.load("es_core_news_sm")
    print("Modelo spaCy cargado.")
except OSError:
    print("Ejecuta: python -m spacy download es_core_news_sm")
    exit()

def process_text_with_spacy(text):
    if not isinstance(text, str): return ""
    doc = nlp(text.lower())
    return " ".join([
        token.lemma_ for token in doc
        if not token.is_stop and not token.is_punct and not token.is_space and not token.like_num
    ])

# Ruta al directorio de PDFs
pdf_folder = './LIBROS'
pdf_files = [os.path.join(pdf_folder, f) for f in os.listdir(pdf_folder) if f.lower().endswith('.pdf')]

# Lista para la estructura plana final
flattened_data = []

for pdf_path in pdf_files:
    if not os.path.exists(pdf_path):
        print(f"Archivo no encontrado: {pdf_path}")
        continue

    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            metadata = reader.metadata or {}
            total_pages = len(reader.pages)
    except Exception as e:
        print(f"Error leyendo PDF: {e}")
        metadata = {}
        total_pages = 0

    print(f"Procesando PDF: {os.path.basename(pdf_path)} con {total_pages} páginas.")
    pages = convert_from_path(pdf_path, dpi=300, poppler_path=poppler_path)

    for i, page in enumerate(pages):
        page_number = i + 1
        image_path = f"temp_page_{uuid.uuid4().hex}.png"
        page.save(image_path, 'PNG')

        extracted_text = image_to_string(Image.open(image_path), lang='spa')
        os.remove(image_path)

        # Dividir en párrafos por doble salto de línea
        parrafos = [p.strip() for p in extracted_text.split('\n\n') if p.strip()]
        print(f"Página {page_number} tiene {len(parrafos)} párrafos.")

        for j, parrafo in enumerate(parrafos):
            cleaned_text = process_text_with_spacy(parrafo)
            if not cleaned_text.strip():
                continue

            flattened_data.append({
                "libro_id": os.path.splitext(os.path.basename(pdf_path))[0],
                "pagina": page_number,
                "parrafo_id": j + 1,
                "texto_original": parrafo,
                "texto_procesado": cleaned_text
            })

print(f"\n📦 Total de párrafos extraídos: {len(flattened_data)}")

# Guardar resultado plano
output_filename = 'datos_planos_por_parrafo.json'
with open(output_filename, 'w', encoding='utf-8') as f:
    json.dump(flattened_data, f, ensure_ascii=False, indent=4)

print(f"\n✅ Datos por párrafo guardados en '{output_filename}'")
