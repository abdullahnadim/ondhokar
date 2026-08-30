import pdfplumber

with pdfplumber.open("schedule.pdf") as pdf:
    page = pdf.pages[12] # Page 13 (0-indexed)
    
    print(f"Total Rects on Page 13: {len(page.rects)}")
    
    tables = page.find_tables()
    if tables:
        table = tables[0]
        extracted = table.extract()
        cells = table.cells
        
        for i, row in enumerate(extracted):
            row_str = " | ".join([str(c) if c is not None else "" for c in row])
            if "shyamoli" in row_str.lower() or "kallayanpur" in row_str.lower() or "shamoly" in row_str.lower():
                print(f"\n[Row {i}]: {row_str}")
                print(f"Total column cells extracted: {len(cells[i])}")
                
                # Check bounding box of the time cells (last 24 columns)
                time_cells = cells[i][-24:]
                print(f"Sample Time Cell 0 bbox: {time_cells[0]}")
                print(f"Sample Time Cell 10 bbox: {time_cells[10] if len(time_cells) > 10 else 'N/A'}")

    print("\n--- SAMPLE 10 RECTANGLES (Color & Bounding Box) ---")
    for idx, r in enumerate(page.rects[:10]):
        print(f"Rect #{idx}: bbox=({r['x0']:.2f}, {r['top']:.2f}, {r['x1']:.2f}, {r['bottom']:.2f}), width={r['width']:.2f}, height={r['height']:.2f}, non_stroke={r.get('non_stroking_color')}, stroke={r.get('stroking_color')}")