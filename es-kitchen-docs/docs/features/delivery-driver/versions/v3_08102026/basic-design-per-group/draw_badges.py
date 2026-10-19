#!/usr/bin/env python3
"""python3 draw_badges.py <NN> [--preview]  -> ve badge so item (do) len anh raw.
badges/G<NN>.json: {"N07/07-03_DA_RECV_005.png": [{"n":3,"x":120,"y":340}, ...]}  (x,y = TAM badge, toa do pixel anh raw 1x)
--preview: ghi vao bd2/preview/<file> (de xem bang Read); khong co: ghi de vao REQ/.../images/<file>"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
SP = os.path.dirname(os.path.abspath(__file__))
IMG = "/Users/longtd/Desktop/WORK/Project Eskitchen/REQ/REQ_Tài xế/basic-design/images"
S = 2; D = 36
def font(sz):
    return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", sz, index=1)
def draw(raw, badges, out):
    im = Image.open(raw).convert("RGB")
    im = im.resize((im.width * S, im.height * S), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    for b in badges:
        cx, cy = b["x"] * S, b["y"] * S
        r = D / 2 + (3 if b["n"] >= 10 else 0)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(200, 22, 29), outline=(255, 255, 255), width=2)
        t = str(b["n"]); f = font(22 if b["n"] < 10 else 18)
        d.text((cx, cy), t, fill=(255, 255, 255), font=f, anchor="mm")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, "PNG")
if __name__ == "__main__":
    nn = sys.argv[1]; prev = "--preview" in sys.argv
    data = json.load(open(os.path.join(SP, "badges", f"G{nn}.json"), encoding="utf-8"))
    for f, bl in data.items():
        out = os.path.join(SP, "preview", f) if prev else os.path.join(IMG, f)
        draw(os.path.join(SP, "raw", f), bl, out)
        print("ok", f, len(bl), "badges ->", out)
