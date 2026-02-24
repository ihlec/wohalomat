import os
import sys

# Dies ist ein Beispiel-Skript, um zu zeigen, wie man Wahlprogramme analysieren könnte.
# Es benötigt die Bibliotheken `openai` und `PyPDF2`.
# pip install openai PyPDF2

try:
    import openai
    from PyPDF2 import PdfReader
except ImportError:
    print("Bitte installiere die notwendigen Bibliotheken: pip install openai PyPDF2")
    sys.exit(1)

# Konfiguration
OPENAI_API_KEY = "DEIN_API_KEY_HIER"
PROGRAMME_DIR = "./wahlprogramme"

questions = [
    "Baden-Württemberg soll an der Schuldenbremse festhalten.",
    "Der Ausbau von Windkraftanlagen im Staatswald soll beschleunigt werden.",
    # ... weitere Fragen
]

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def analyze_position(text, question):
    prompt = f"""
    Analysiere das folgende Wahlprogramm und bestimme die Position der Partei zur folgenden Aussage:
    "{question}"

    Antworte NUR mit einem der folgenden Werte:
    - agree (Stimme zu)
    - disagree (Stimme nicht zu)
    - neutral (Neutral / Keine Aussage)

    Wahlprogramm Ausschnitt:
    {text[:10000]}  # Begrenzung auf die ersten 10000 Zeichen für dieses Beispiel
    """
    
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip().lower()

def main():
    if not os.path.exists(PROGRAMME_DIR):
        os.makedirs(PROGRAMME_DIR)
        print(f"Bitte lege die PDF-Dateien der Wahlprogramme in den Ordner '{PROGRAMME_DIR}'.")
        return

    pdf_files = [f for f in os.listdir(PROGRAMME_DIR) if f.endswith('.pdf')]
    
    if not pdf_files:
        print(f"Keine PDF-Dateien im Ordner '{PROGRAMME_DIR}' gefunden.")
        return

    results = {}

    for pdf_file in pdf_files:
        party_name = pdf_file.replace('.pdf', '')
        print(f"Analysiere {party_name}...")
        
        text = extract_text_from_pdf(os.path.join(PROGRAMME_DIR, pdf_file))
        party_positions = {}
        
        for i, question in enumerate(questions):
            position = analyze_position(text, question)
            party_positions[f"q{i+1}"] = position
            print(f"  Frage {i+1}: {position}")
            
        results[party_name] = party_positions

    print("\nErgebnisse (JSON Format für data.ts):")
    print(results)

if __name__ == "__main__":
    main()
