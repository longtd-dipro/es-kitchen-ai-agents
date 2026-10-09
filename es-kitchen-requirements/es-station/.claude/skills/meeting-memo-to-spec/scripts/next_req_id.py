#!/usr/bin/env python3
"""仕様書 .md 群から REQ 採番の次番号を調べる。

要件IDは `REQ-<PREFIX>-<番号>`（例 REQ-CT-271, REQ-DL-710, REQ-PM-044）で、
ドメインごとに連番。新しい行を足す前に、各ファイルの最大番号＋1を知るために使う。

使い方:
    python next_req_id.py <file.md> [<file.md> ...]
    python next_req_id.py <file.md> --prefix CT     # そのプレフィックスだけ
"""
import sys, re, argparse
from collections import defaultdict

ap = argparse.ArgumentParser()
ap.add_argument("files", nargs="+")
ap.add_argument("--prefix", help="例 CT / DL / PM。省略時は全プレフィックス")
args = ap.parse_args()

pat = re.compile(r"REQ-([A-Z]+)-(\d+)")
mx = defaultdict(int)
for f in args.files:
    try:
        text = open(f, encoding="utf-8").read()
    except OSError as e:
        print(f"(skip {f}: {e})", file=sys.stderr)
        continue
    for pre, num in pat.findall(text):
        mx[pre] = max(mx[pre], int(num))

keys = [args.prefix] if args.prefix else sorted(mx)
for k in keys:
    cur = mx.get(k, 0)
    print(f"REQ-{k}: max={cur:>4}  next=REQ-{k}-{cur+1:03d}")
