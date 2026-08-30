import requests
from bs4 import BeautifulSoup
import pdfplumber
import json
import io
import urllib3
import traceback

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DESCO_URL = "https://desco.gov.bd/pages/static-pages/69db2a3c6a42b12e9344d1f1"

def get_latest_pdf_url():
    print("🌐 Fetching DESCO static page...")
    response = requests.get(DESCO_URL, verify=False)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    pdf_links = []
    for a in soup.find_all('a', href=True):
        if '.pdf' in a['href'].lower():
            pdf_link = a['href']
            if pdf_link.startswith('/'):
                pdf_link = "https://desco.gov.bd" + pdf_link
            pdf_links.append(pdf_link)
            
    if not pdf_links:
        raise Exception("Could not find a PDF link on the DESCO page.")
        
    print(f"📊 Found {len(pdf_links)} total PDFs on the page.")
    for idx, link in enumerate(pdf_links):
        print(f"   [{idx}] {link.split('/')[-1]}")
        
    # Grab the FIRST PDF in the list (newest upload is at the top!)
    latest_pdf = pdf_links[0]
    print(f"\n✅ Selected newest PDF: {latest_pdf}")
    return latest_pdf

def process_pdf(pdf_bytes):
    print("🔍 Extracting visual and text data using pdfplumber...")
    feeders_data = []
    
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.find_tables()
            if not tables:
                continue
                
            table = tables[0]
            cells = table.cells 
            text_data = table.extract() 
            
            # UPDATED LOGIC: Catch ANY shaded box, not just pure black
            black_rects = []
            for r in page.rects:
                color = r.get('non_stroking_color')
                # If the box has a color, and it is NOT pure white, count it as an outage
                if color and color not in (1, [1,1,1], (1,1,1), [1], (1,), (1.0, 1.0, 1.0)):
                    if r.get('width', 0) > 2:
                        black_rects.append(r)

            for row_idx, row_text in enumerate(text_data):
                if not row_text or len(row_text) < 3 or "Division" in str(row_text[0]) or "Saturday" in str(row_text[0]):
                    continue
# ... (the rest of the function remains exactly the same)
def main():
    try:
        pdf_url = get_latest_pdf_url()
        document_name = pdf_url.split('/')[-1] # Extracts "9731b47e-db13..." from the URL
        print("📥 Downloading PDF...")
        response = requests.get(pdf_url, verify=False)
        
        feeders = process_pdf(response.content)
        print(f"✅ Successfully processed {len(feeders)} feeders.")
        
        output_path = "../data/desco-database.json"
        with open(output_path, "w", encoding="utf-8") as f:
            # Save the document name in the JSON alongside the feeders!
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