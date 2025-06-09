# from sentence_transformers import SentenceTransformer

# # Usar modelo en español
# model = SentenceTransformer('hiiamsid/sentence_similarity_spanish_es')

# page_embeddings = {}
# for page in pages:
#     text = page["text_processed"]  # Texto lematizado
#     embedding = model.encode(text)
#     page_embeddings[page["page_number"]] = embedding
from sentence_transformers import SentenceTransformer
sentences = ['Mi nombre es Siddhartha', 'Mis amigos me llamaron por mi nombre Siddhartha']

model = SentenceTransformer('hiiamsid/sentence_similarity_spanish_es')
embeddings = model.encode(sentences)
print(embeddings)