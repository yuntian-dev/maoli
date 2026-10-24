#!/usr/bin/env bash
# 把多帧截图拼成一张对比图，方便一眼看撕页动效
set -u
PREFIX=${1:-/tmp/tear}
OUT=${2:-/tmp/tear_strip.png}
FILES=()
for f in ${PREFIX}_*.png; do
  [ -e "$f" ] && FILES+=("$f")
done
[ ${#FILES[@]} -eq 0 ] && { echo "no frames"; exit 1; }

# 缩放到宽度 320 拼一行
TMP=$(mktemp -d)
i=0
for f in "${FILES[@]}"; do
  sips -Z 320 "$f" --out "$TMP/f$i.png" >/dev/null 2>&1
  i=$((i+1))
done
montage -tile ${i}x1 -geometry +4+4 -background '#e8e0cd' "$TMP"/*.png "$OUT" 2>/dev/null \
  || python3 - "$TMP" "$OUT" "$i" <<'PY'
import sys, subprocess, os
tmp, out, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
files = [os.path.join(tmp, f"f{i}.png") for i in range(n)]
subprocess.run(["magick", "montage", *files, "-tile", f"{n}x1", "-geometry", "+4+4",
                "-background", "#e8e0cd", out], check=False)
PY
echo "strip: $OUT"
rm -rf "$TMP"
