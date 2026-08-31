import pdfplumber
import json
import traceback
import io
import requests
import urllib3
from playwright.sync_api import sync_playwright
from deep_translator import GoogleTranslator

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
DESCO_URL = "https://desco.gov.bd/pages/static-pages/69db2a3c6a42b12e9344d1f1"

def get_latest_pdf_url():
    print("🌐 Launching headless browser to bypass JavaScript...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Wait for the dynamic JavaScript links to load
        page.goto(DESCO_URL, wait_until="networkidle")
        
        links = page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a')).map(a => a.href);
        }''')
        browser.close()
        
    pdf_links = [link for link in links if link and '.pdf' in link.lower()]
    if not pdf_links:
        raise Exception("Could not find a PDF link on the DESCO page.")
        
    latest_pdf = pdf_links[0]
    print(f"✅ Selected newest PDF: {latest_pdf}")
    return latest_pdf

def process_pdf(pdf_bytes):
    feeders_data = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.find_tables()
            if not tables: continue
                
            table = tables[0]
            text_data = table.extract()
            
            for row_idx, row_text in enumerate(text_data):
                if not row_text or len(row_text) < 4: continue
                first_col = str(row_text[0] or "")
                if "Division" in first_col or "Saturday" in first_col or "Sunday" in first_col: continue

                division = str(row_text[0]).replace("\n", " ").strip() if row_text[0] else ""
                area = str(row_text[1]).replace("\n", " ").strip() if row_text[1] else ""
                feeder_name = str(row_text[2]).replace("\n", " ").strip() if row_text[2] else ""
                if not feeder_name: continue

                hour_values = row_text[-24:] if len(row_text) >= 27 else []
                intervals = []

                for h_idx in range(24):
                    is_outage = False
                    if h_idx < len(hour_values):
                        val = hour_values[h_idx]
                        if val is not None and len(str(val).strip()) > 0:
                            is_outage = True

                    intervals.append({
                        "start": f"{h_idx:02d}:00",
                        "end": f"{(h_idx+1):02d}:00",
                        "status": "SCHEDULED_OUTAGE" if is_outage else "AVAILABLE"
                    })

                safe_feeder_id = f"fdr_{feeder_name.lower().replace(' ', '_').replace('-', '').replace('/', '')}"
                feeders_data.append({
                    "id": safe_feeder_id, 
                    "division": division, 
                    "area": area,
                    "feeder": feeder_name, 
                    "page": page_num + 1, 
                    "intervals": intervals
                })
    return feeders_data

def main():
    try:
        pdf_url = get_latest_pdf_url()
        document_name = pdf_url.split('/')[-1]
        
        print(f"📥 Downloading {document_name}...")
        response = requests.get(pdf_url, verify=False)
        feeders = process_pdf(response.content)
        
        # --- BENGALI TRANSLATION ENGINE ---
        print("🌍 Translating database to Bengali in bulk...")
        unique_texts = set()
        for f in feeders:
            if f['division']: unique_texts.add(f['division'])
            if f['area']: unique_texts.add(f['area'])
            if f['feeder']: unique_texts.add(f['feeder'])
            
        unique_texts = list(unique_texts)
        translation_cache = {}
        translator = GoogleTranslator(source='en', target='bn')
        
        # Translate in batches of 50 to prevent API timeouts
        chunk_size = 50
        for i in range(0, len(unique_texts), chunk_size):
            chunk = unique_texts[i:i+chunk_size]
            try:
                translated_chunk = translator.translate_batch(chunk)
                for orig, trans in zip(chunk, translated_chunk):
                    translation_cache[orig] = trans if trans else orig
            except Exception as e:
                print(f"⚠️ Translation warning for a chunk: {e}")
                # Fallback to English if translation fails for this chunk
                for orig in chunk:
                    translation_cache[orig] = orig

        # Map the translations back to the JSON object
        for f in feeders:
            f['division_bn'] = translation_cache.get(f['division'], f['division'])
            f['area_bn'] = translation_cache.get(f['area'], f['area'])
            f['feeder_bn'] = translation_cache.get(f['feeder'], f['feeder'])
        # ----------------------------------

        total_outages = sum(1 for f in feeders for i in f['intervals'] if i['status'] == "SCHEDULED_OUTAGE")
        print(f"✅ Processed {len(feeders)} feeders. Found {total_outages} blackout hours.")
        
        output_path = "../data/desco-database.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump({
                "metadata": {"document_name": document_name}, 
                "feeders": feeders
            }, f, indent=2, ensure_ascii=False)
            
        print(f"🚀 Data successfully written to {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()