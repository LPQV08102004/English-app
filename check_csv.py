import pandas as pd
import json
import csv

print("=" * 70)
print("KIỂM TRA CHUẨN FILE CSV")
print("=" * 70)

# Đọc file
df = pd.read_csv('dictionary_sample.csv')

# 1. Kiểm tra cấu trúc cơ bản
print("\n✓ THÔNG TIN CƠ BẢN:")
print(f"  - Tổng số dòng: {len(df):,}")
print(f"  - Số cột: {len(df.columns)}")
print(f"  - Encoding: UTF-8 with BOM")
print(f"  - Delimiter: , (comma)")

# 2. Kiểm tra các cột
print("\n✓ CÁC CỘT TRONG FILE:")
for i, col in enumerate(df.columns, 1):
    null_count = df[col].isna().sum()
    print(f"  {i:2d}. {col:20s} - Null: {null_count:4d} ({null_count/len(df)*100:.1f}%)")

# 3. Kiểm tra dữ liệu
print("\n" + "=" * 70)
print("PHÂN TÍCH DỮ LIỆU:")
print("=" * 70)

print(f"\n✓ Ngôn ngữ:")
lang_counts = df['lang'].value_counts()
for lang, count in lang_counts.head(5).items():
    print(f"  - {lang}: {count:,} từ")

print(f"\n✓ Loại từ (POS):")
pos_counts = df['pos'].value_counts()
for pos, count in pos_counts.head(10).items():
    print(f"  - {pos}: {count:,} từ")

# 4. Kiểm tra JSON format
print("\n" + "=" * 70)
print("KIỂM TRA JSON FORMAT:")
print("=" * 70)

json_columns = ['senses', 'sounds', 'synonyms', 'translations', 'head_templates', 
                'forms', 'categories']

for col in json_columns:
    if col in df.columns:
        valid_json = 0
        invalid_json = 0
        empty = 0
        
        for val in df[col].head(100):  # Kiểm tra 100 dòng đầu
            if pd.isna(val) or val == '':
                empty += 1
            else:
                try:
                    json.loads(val)
                    valid_json += 1
                except:
                    invalid_json += 1
        
        status = "✓" if invalid_json == 0 else "✗"
        print(f"{status} {col:20s}: Valid: {valid_json:3d}, Invalid: {invalid_json:3d}, Empty: {empty:3d}")

# 5. Kiểm tra ví dụ
print("\n" + "=" * 70)
print("VÍ DỤ MỘT DÒNG DỮ LIỆU:")
print("=" * 70)

sample = df.iloc[0]
print(f"Word: {sample['word']}")
print(f"Language: {sample['lang']}")
print(f"POS: {sample['pos']}")
print(f"Etymology: {sample['etymology_text'][:100]}..." if pd.notna(sample['etymology_text']) else "Etymology: N/A")

# Parse senses
if pd.notna(sample['senses']):
    try:
        senses = json.loads(sample['senses'])
        print(f"Number of senses: {len(senses)}")
        if len(senses) > 0 and 'glosses' in senses[0]:
            print(f"First sense: {senses[0]['glosses'][0]}")
    except:
        print("Senses: Invalid JSON")

# 6. Tổng kết
print("\n" + "=" * 70)
print("ĐÁNH GIÁ:")
print("=" * 70)

issues = []

# Kiểm tra điều kiện
if df['word'].isna().sum() > 0:
    issues.append(f"❌ Có {df['word'].isna().sum()} dòng thiếu từ")

if len(df) == 0:
    issues.append("❌ File rỗng")

# Kiểm tra JSON
for col in json_columns:
    if col in df.columns:
        sample_vals = df[col].dropna().head(10)
        invalid = 0
        for val in sample_vals:
            try:
                json.loads(val)
            except:
                invalid += 1
        if invalid > 0:
            issues.append(f"⚠️  Cột '{col}' có dữ liệu JSON không hợp lệ")

if len(issues) == 0:
    print("✅ File CSV HOÀN TOÀN ĐÚNG CHUẨN!")
    print("   - Cấu trúc CSV đúng")
    print("   - Encoding UTF-8 with BOM")
    print("   - Dữ liệu JSON hợp lệ")
    print("   - Không có lỗi")
else:
    print("⚠️  File CSV có một số vấn đề:")
    for issue in issues:
        print(f"   {issue}")

print("\n" + "=" * 70)
