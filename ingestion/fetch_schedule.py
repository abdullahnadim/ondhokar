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
    
    for a in soup.find_all('a', href=True):
        if '.pdf' in a['href'].lower():
            pdf_link = a['href']
            if pdf_link.startswith('/'):
                pdf_link = "https://desco.gov.bd" + pdf_link
            print(f"📄 Found latest PDF schedule: {pdf_link}")
            return pdf_link
            
    raise Exception("Could not find a PDF link on the DESCO page.")

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
            
            # Find all black rectangles on this page to detect outages
            black_rects = [
                r for r in page.rects 
                if r.get('non_stroking_color') in (0, [0,0,0], (0,0,0), [0], (0,))
                and r.get('width', 0) > 2
            ]

            for row_idx, row_text in enumerate(text_data):
                # Defensively skip bad rows
                if not row_text or len(row_text) < 3 or "Division" in str(row_text[0]) or "Saturday" in str(row_text[0]):
                    continue

                division = str(row_text[0]).replace("\n", " ").strip() if row_text[0] else ""
                area = str(row_text[1]).replace("\n", " ").strip() if row_text[1] else ""
                feeder_name = str(row_text[2]).replace("\n", " ").strip() if row_text[2] else ""

                if not feeder_name or row_idx >= len(cells):
                    continue

                row_boxes = cells[row_idx]
                hour_boxes = row_boxes[-24:] 
                intervals = []

                # Ensure we strictly iterate 24 times for the 24 hours
                for h_idx in range(24):
                    is_outage = False
                    
                    # Defensively check the bounding box structure
                    if h_idx < len(hour_boxes):
                        bbox = hour_boxes[h_idx]
                        # Verify it is actually a coordinate tuple and not a float/None
                        if bbox and isinstance(bbox, (list, tuple)) and len(bbox) == 4:
                            x0, top, x1, bottom = bbox
                            center_x = (x0 + x1) / 2
                            center_y = (top + bottom) / 2
                            
                            for rect in black_rects:
                                rx0, rtop, rx1, rbottom = rect['x0'], rect['top'], rect['x1'], rect['bottom']
                                if rx0 <= center_x <= rx1 and rtop <= center_y <= rbottom:
                                    is_outage = True
                                    break

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
        print("📥 Downloading PDF...")
        response = requests.get(pdf_url, verify=False)
        
        feeders = process_pdf(response.content)
        print(f"✅ Successfully processed {len(feeders)} feeders.")
        
        output_path = "../data/desco-database.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump({"feeders": feeders}, f, indent=2, ensure_ascii=False)
            
        print(f"🚀 Data successfully written to {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()