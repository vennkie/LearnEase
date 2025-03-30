#!/usr/bin/env python3
"""
Backend Server for a React Frontend
-------------------------------------
This Flask application processes documents (PDF, DOCX, TXT) either from an uploaded file
or from a predefined folder, generates embeddings with SBERT, and creates summaries:
  - Each document chunk is summarised (one-line summary).
  - All chunk summaries can be combined and re-summarised to form a comprehensive summary.
This final summary is used by the quiz generation endpoint to produce a quiz.
"""


import asyncio  
import os
import json
import nltk
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader
from docx import Document
from groq import Groq


# Download required NLTK data (for tokenization)
nltk.download('punkt') 

# -------------------------
# Configuration & Initialization
# -------------------------
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")  # Set your Groq API key
DOCUMENTS_FOLDER = os.environ.get("DOCUMENTS_FOLDER", "./docs")        # Folder path for documents (if used)
EMBEDDINGS_FILE = os.environ.get("EMBEDDINGS_FILE", "embeddings_with_content.xlsx")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})

# Initialize the SentenceTransformer model.
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize the Groq client (needed for summarization functions).
client = Groq(api_key=GROQ_API_KEY)

# Global DataFrame to hold processed document chunks.
df = pd.DataFrame()

# -------------------------
# Summarization Functions
# -------------------------

def fully_summarize(full_text):
    """
    Generate a comprehensive summary from a combined text of all chunk summaries.
    """
    try:
        prompt = f"Using the following summaries from multiple document chunks, provide a comprehensive and concise summary:\n{full_text}"
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert summarizer."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=300,
            top_p=1,
            stop=None,
            stream=False
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print("Error fully summarizing:", e)
        return ""

# -------------------------
# Document Processing & Embedding Generation
# -------------------------
def extract_text_from_pdf(file_obj):
    reader = PdfReader(file_obj)
    text = ''
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_obj):
    doc = Document(file_obj)
    return "\n".join([para.text for para in doc.paragraphs])
async def async_summarize_chunk(text):
    """
    Generate a one-line summary for a given text chunk using Groq LLM asynchronously.
    """
    try:
        prompt = f"Summarize the following text in one concise line:\n{text}"
        response = await asyncio.to_thread(lambda: client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a concise summarizer."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=50,
            top_p=1,
            stop=None,
            stream=False
        ))
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("Error summarizing chunk:", e)
        return ""

async def process_text(content, source_name="uploaded_file", model=None):
    """
    Process text content: tokenize, chunk, summarize asynchronously, and create embeddings.
    Returns a DataFrame with columns: fileName, content, summary, embeddings.
    """
    data = []
    tokens = nltk.word_tokenize(content)
    chunks = [' '.join(tokens[i:i+300]) for i in range(0, len(tokens), 300)]
    
    # Process summaries asynchronously in batches of 10
    summaries = await asyncio.gather(*[async_summarize_chunk(chunk) for chunk in chunks])
    
    for i, (chunk, summary) in enumerate(zip(chunks, summaries)):
        embedding = model.encode(chunk).tolist() if model else []
    
        data.append({
            'fileName': f"{source_name}-part-{i+1}",
            'content': chunk,
            'summary': summary,
            'embeddings': (list(embedding))
        })
    
    return pd.DataFrame(data, columns=['fileName', 'content', 'summary', 'embeddings'])
def load_existing_data():
    global df
    if os.path.exists(EMBEDDINGS_FILE):
        try:
            df = pd.read_excel(EMBEDDINGS_FILE)
            # Parse stored embeddings from JSON-like strings if necessary.
            
            df['embeddings'] = df['embeddings'].apply(lambda x: np.array(json.loads(x)) if isinstance(x, str) else x)
        except Exception as e:
            print("Error loading existing data:", e)

# Load any existing data at startup.
load_existing_data()

# -------------------------
# Helper Functions for Retrieval
# -------------------------
def clean_json(json_str):
    try:
        json_str = json_str.strip().replace("'", '"')
        json_str = json_str.replace(" ", "")
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e} in data: {json_str}")
        return None

def parse_embeddings(json_str):
    data = clean_json(json_str)
    if data is not None:
        try:
            return np.array(data, dtype=np.float32)
        except Exception as e:
            print(f"Error converting JSON to numpy array: {e}")
            return np.array([])
    return np.array([])

def calculate_similarity(query_embedding, doc_embedding):
    if np.linalg.norm(doc_embedding) == 0 or np.linalg.norm(query_embedding) == 0:
        return 0
    return np.dot(query_embedding, doc_embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding))

def find_best_matches(user_query, top_n=3):
    if df.empty or 'embeddings' not in df.columns:
        return "No document embeddings available."
    query_embedding = model.encode(user_query)
    if np.linalg.norm(query_embedding) == 0:
        return "Query embedding is invalid. Please provide a more meaningful query."
    # Calculate similarity for each document chunk.


    df['similarity'] = df['embeddings'].apply(lambda emb: calculate_similarity(query_embedding, np.array(emb)))
    top_matches = df.nlargest(top_n, 'similarity')
    if top_matches['similarity'].isnull().all() or top_matches['similarity'].max() == 0:
        return "No matching documents found."
    replies = top_matches['content'].tolist()
    ans = "\n".join(replies)
    return (
        f"User's query: {user_query}\n"
        f"Refer to the following information:\n{ans}\n"
        "If the information is insufficient, answer generally. "
        "Keep your responses short and precise. "
    )

# -------------------------
# API Endpoints
# -------------------------

# 1. /upload: Accepts a file upload, processes it, and updates the embeddings data.

@app.route('/upload', methods=['POST'])
async def upload_route():
    global df
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty file name"}), 400

    ext = file.filename.rsplit('.', 1)[-1].lower()
    
    try:
        if ext == 'pdf':
            content = extract_text_from_pdf(file)

        elif ext == 'docx':
            content = extract_text_from_docx(file)
        elif ext == 'txt':
            content = file.read().decode('utf-8')
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        if not content:
            return jsonify({"error": "No content extracted from the file"}), 201
        
        # Delete 'output.txt' if it exists
        if os.path.exists('output.txt'):
            os.remove('output.txt')

        # Delete 'embeddings_with_content.xlsx' if it exists
        if os.path.exists(EMBEDDINGS_FILE):
            os.remove(EMBEDDINGS_FILE)
        
        with open('output.txt', 'w', encoding='utf-8') as f:
            f.write(content)


        new_data = await process_text(content, source_name=file.filename, model=model)
        
        df = new_data


        # Save updated DataFrame to Excel.
        df.to_excel(EMBEDDINGS_FILE, index=False)
        return jsonify({"message": f"File processed successfully with {len(new_data)} chunks."}), 200
    except Exception as e:
        print("Error processing file:", e)
        return jsonify({"error": str(e)}), 500

# 2. /chat: Uses the stored embeddings to implement a RAG chatbot.
conversation_history = [
    {
        "role": "system",
        "content": "You are an inference engine capable of deducing implicit geospatial information from user queries."
    }
]

def ask(user_input):
    context = find_best_matches(user_input)
    conversation_history.append({
        "role": "user",
        "content": context
    })
    chat_completion = client.chat.completions.create(
        messages=conversation_history,
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        max_tokens=1024,
        top_p=1,
        stop=None,
        stream=False,
    )
    response = chat_completion.choices[0].message.content
    conversation_history.append({
        "role": "assistant",
        "content": response
    })
    return response

@app.route('/chat', methods=['POST'])
def chat_route():
    data = request.get_json()
    user_input = data.get('query', '')
    if not user_input:
        return jsonify({"error": "No query provided"}), 400
    answer = ask(user_input)
    return jsonify({"answer": answer})

# 3. /get_embeddings: Generates embeddings for provided sentences.
@app.route('/get_embeddings', methods=['POST'])
def get_embeddings_route():
    try:
        data = request.get_json()
        sentences = data.get('sentences', '')
        if not sentences:
            return jsonify({"error": "No sentences provided"}), 400
        embeddings = model.encode(sentences)
        return jsonify({"embeddings": embeddings.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. /quiz: Selects 5 single-line summaries and returns a quiz in the specified format.
@app.route('/quiz', methods=['GET'])
def quiz_route():
    if df.empty or 'summary' not in df.columns:
        return jsonify({"error": "No summaries available for quiz generation"}), 400
    # Randomly sample up to 5 summaries.
    sample_count = min(5, len(df))
    sampled = df["summary"].dropna().sample(n=sample_count)
    summaries_text = "\n".join(sampled.tolist())
    prompt = (
        "Based on the following summaries from the uploaded document, generate a quiz in JSON format. "
        "Each quiz entry should include a question, a list of options, and the correct answer. "
        "Use the following format for each quiz entry:\n"
        "{ 'question': '...', 'options': ['a','b','c','d'], 'correct option': 'answer' }\n"
        "Summaries:\n" + summaries_text
    )
    quiz_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful quiz generator."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        max_tokens=1024,
        top_p=1,
        stop=None,
        stream=False
    )
    response = quiz_completion.choices[0].message.content
    try:
        quiz_data = json.loads(response)
    except Exception as e:
        quiz_data = {"quiz": response}
    return jsonify(quiz_data)

# 5. /summarise: Retrieves all single-line summaries and returns a comprehensive final summary.
@app.route('/summarise', methods=['GET'])
def summarise_route():
    if df.empty or 'summary' not in df.columns:
        return jsonify({"error": "No summaries available for full summarisation"}), 400
    combined_summaries = "\n".join(df["summary"].dropna().tolist())
    full_summary = fully_summarize(combined_summaries)
    return jsonify({"summary": full_summary})

# -------------------------
# Run the Flask App
# -------------------------
if __name__ == "__main__":
    # In production, run with a production-ready WSGI server (e.g., Gunicorn).
    app.run(host='0.0.0.0', port=5000, debug=True)

