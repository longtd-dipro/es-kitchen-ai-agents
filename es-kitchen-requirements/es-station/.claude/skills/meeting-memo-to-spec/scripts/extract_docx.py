#!/usr/bin/env python3
"""Gemini などの議事録 .docx から本文テキストを抽出する。

Gemini のメモは「概要／決定事項／さらなる議論が必要／調整済み／次のステップ／詳細／
文字起こし」といった見出しで構成される。要約（上部）は圧縮されて誤りを含むことが
あるため、必ず文字起こし本文（下部）で固有名詞・数値を裏取りすること。

使い方:
    python extract_docx.py <path-to.docx>                       # 全文を標準出力へ
    python extract_docx.py <path-to.docx> --section 文字起こし   # 見出し以降だけ
    python extract_docx.py <path-to.docx> --grep elepay,返金,ESQR  # 該当行の前後も

python-docx が無ければ自動で pip install --break-system-packages を試みる。
"""
import sys, subprocess, argparse


def ensure_docx():
    try:
        import docx  # noqa
    except ImportError:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "python-docx",
             "--break-system-packages", "-q"], check=False)


def load_paragraphs(path):
    from docx import Document
    doc = Document(path)
    return [p.text.strip() for p in doc.paragraphs if p.text.strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--section", help="この見出し語を含む段落以降だけ出力")
    ap.add_argument("--grep", help="カンマ区切りの語。該当行を前後1行つきで出力")
    args = ap.parse_args()

    ensure_docx()
    paras = load_paragraphs(args.path)

    if args.section:
        out, hit = [], False
        for p in paras:
            if not hit and args.section in p:
                hit = True
            if hit:
                out.append(p)
        paras = out if hit else paras

    if args.grep:
        terms = [t.strip() for t in args.grep.split(",") if t.strip()]
        for i, p in enumerate(paras):
            if any(t in p for t in terms):
                lo, hi = max(0, i - 1), min(len(paras), i + 2)
                print(f"--- [{i}] ---")
                for j in range(lo, hi):
                    print(paras[j])
        return

    print("\n".join(paras))


if __name__ == "__main__":
    main()
