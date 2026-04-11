import json
import sys
from pathlib import Path

src = Path(sys.argv[1])
dst = Path(sys.argv[2])

data = json.loads(src.read_text(encoding="utf-8"))

with dst.open("w", encoding="utf-8") as f:
    for obj in data:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")

print("Wrote", dst, "rows=", len(data))
