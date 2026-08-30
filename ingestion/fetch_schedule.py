import pdfplumber
import json
import traceback

def process_pdf(pdf_path):
    print(f"🔍 Reading local file: {pdf_path}")
    feeders_data = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.find_tables()
            if not tables:
                continue
                
            table = tables[0]
            text_data = table.extract()
            
            for row_idx, row_text in enumerate(text_data):
                # Defensively skip invalid or header rows
                if not row_text or len(row_text) < 4:
                    continue
                
                first_col = str(row_text[0] or "")
                if "Division" in first_col or "Saturday" in first_col or "Sunday" in first_col:
                    continue

                division = str(row_text[0]).replace("\n", " ").strip() if row_text[0] else ""
                area = str(row_text[1]).replace("\n", " ").strip() if row_text[1] else ""
                feeder_name = str(row_text[2]).replace("\n", " ").strip() if row_text[2] else ""

                if not feeder_name:
                    continue

                # The 24 hourly time slots are the last 24 columns in the row
                hour_values = row_text[-24:] if len(row_text) >= 27 else []
                intervals = []

                for h_idx in range(24):
                    is_outage = False
                    
                    if h_idx < len(hour_values):
                        val = hour_values[h_idx]
                        if val is not None:
                            val_str = str(val).strip()
                            # An outage slot contains non-empty text (numbers, '0', 'LS', 'X', etc.)
                            if len(val_str) > 0:
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
        local_pdf = "schedule.pdf"
        feeders = process_pdf(local_pdf)
        
        total_outages = sum(1 for f in feeders for i in f['intervals'] if i['status'] == "SCHEDULED_OUTAGE")
        
        print(f"✅ Successfully processed {len(feeders)} feeders.")
        print(f"⚡ Found a total of {total_outages} scheduled blackout hours across the grid.")
        
        output_path = "../data/desco-database.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump({
                "metadata": {"document_name": "DESCO Schedule 9731b47e-db13-4998-8bb4-3e3045f51f92.pdf"}, 
                "feeders": feeders
            }, f, indent=2, ensure_ascii=False)
            
        print(f"🚀 Data successfully written to {output_path}")

    except FileNotFoundError:
        print("❌ Error: Could not find 'schedule.pdf' in the ingestion folder.")
    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()