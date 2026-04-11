import json
import csv
import sys
from pathlib import Path

def flatten_dict(d, parent_key='', sep='_'):
    """Làm phẳng dictionary lồng nhau"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        elif isinstance(v, list):
            # Chuyển list thành chuỗi JSON
            items.append((new_key, json.dumps(v, ensure_ascii=False)))
        else:
            items.append((new_key, v))
    return dict(items)

def process_jsonl_to_csv(input_file, output_file, max_rows=None):
    """
    Chuyển đổi file JSONL sang CSV
    
    Args:
        input_file: Đường dẫn file JSONL đầu vào
        output_file: Đường dẫn file CSV đầu ra
        max_rows: Số dòng tối đa để xử lý (None = tất cả)
    """
    print(f"Đang xử lý file: {input_file}")
    print(f"Đầu ra: {output_file}")
    
    # Đọc một vài dòng đầu để xác định các cột
    all_keys = set()
    sample_data = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if max_rows and i >= max_rows:
                break
            try:
                data = json.loads(line.strip())
                flattened = flatten_dict(data)
                all_keys.update(flattened.keys())
                sample_data.append(flattened)
                
                # Hiển thị tiến trình
                if (i + 1) % 10000 == 0:
                    print(f"Đã xử lý {i + 1} dòng...")
            except json.JSONDecodeError as e:
                print(f"Lỗi tại dòng {i + 1}: {e}")
                continue
    
    # Sắp xếp các cột
    fieldnames = sorted(list(all_keys))
    
    print(f"\nTổng số cột: {len(fieldnames)}")
    print(f"Tổng số dòng: {len(sample_data)}")
    
    # Ghi ra file CSV
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        
        for row in sample_data:
            # Đảm bảo tất cả các giá trị là chuỗi
            cleaned_row = {}
            for key in fieldnames:
                value = row.get(key, '')
                if value is None:
                    cleaned_row[key] = ''
                else:
                    cleaned_row[key] = str(value)
            writer.writerow(cleaned_row)
    
    print(f"\n✓ Hoàn thành! File CSV đã được lưu tại: {output_file}")

def process_simple_csv(input_file, output_file, max_rows=None):
    """
    Tạo CSV đơn giản với các trường chính
    """
    print(f"Đang tạo CSV đơn giản...")
    
    rows = []
    with open(input_file, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if max_rows and i >= max_rows:
                break
            try:
                data = json.loads(line.strip())
                
                # Trích xuất các trường chính
                row = {
                    'word': data.get('word', ''),
                    'lang': data.get('lang', ''),
                    'lang_code': data.get('lang_code', ''),
                    'pos': data.get('pos', ''),
                    'etymology_text': data.get('etymology_text', ''),
                    'head_templates': json.dumps(data.get('head_templates', []), ensure_ascii=False),
                    'forms': json.dumps(data.get('forms', []), ensure_ascii=False),
                    'senses': json.dumps(data.get('senses', []), ensure_ascii=False),
                    'sounds': json.dumps(data.get('sounds', []), ensure_ascii=False),
                    'synonyms': json.dumps(data.get('synonyms', []), ensure_ascii=False),
                    'translations': json.dumps(data.get('translations', []), ensure_ascii=False),
                    'categories': json.dumps(data.get('categories', []), ensure_ascii=False),
                }
                rows.append(row)
                
                if (i + 1) % 10000 == 0:
                    print(f"Đã xử lý {i + 1} dòng...")
            except json.JSONDecodeError as e:
                print(f"Lỗi tại dòng {i + 1}: {e}")
                continue
    
    # Ghi ra CSV
    fieldnames = ['word', 'lang', 'lang_code', 'pos', 'etymology_text', 
                  'head_templates', 'forms', 'senses', 'sounds', 
                  'synonyms', 'translations', 'categories']
    
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✓ Hoàn thành! CSV đơn giản đã được lưu tại: {output_file}")
    print(f"Tổng số từ: {len(rows)}")

if __name__ == "__main__":
    input_file = r"c:\Study\Tiếng Anh App\kaikki.org-dictionary-English.jsonl"
    
    print("=" * 60)
    print("CHUYỂN ĐỔI TỪ ĐIỂN JSONL SANG CSV")
    print("=" * 60)
    print("\nChọn chế độ xuất:")
    print("1. CSV đầy đủ (tất cả các trường, file lớn)")
    print("2. CSV đơn giản (các trường chính, dễ đọc hơn)")
    print("3. CSV mẫu (chỉ 1000 dòng đầu tiên)")
    
    choice = input("\nNhập lựa chọn (1/2/3): ").strip()
    
    if choice == "1":
        output_file = r"c:\Study\Tiếng Anh App\dictionary_full.csv"
        process_jsonl_to_csv(input_file, output_file)
    elif choice == "2":
        output_file = r"c:\Study\Tiếng Anh App\dictionary_simple.csv"
        process_simple_csv(input_file, output_file)
    elif choice == "3":
        output_file = r"c:\Study\Tiếng Anh App\dictionary_sample.csv"
        process_simple_csv(input_file, output_file, max_rows=1000)
    else:
        print("Lựa chọn không hợp lệ!")
        sys.exit(1)
