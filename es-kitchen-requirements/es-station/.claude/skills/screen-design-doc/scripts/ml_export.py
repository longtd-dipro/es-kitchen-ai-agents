# -*- coding: utf-8 -*-
"""
Message List（Excel・正）を CSV の写しに書き出す（cloud など Excel が見えない所で突き合わせるため）。ローカルで実行する。

    python3 ml_export.py "<Message List の xlsx>" [--out <フォルダ>]

できるもの（--out の省略時は xlsx と同じフォルダ）：
    MessageList_WEB_<日付>.csv   … 「運営管理者／法人顧客向けWEB」シートをそのまま（列の順も同じ）
    MessageList_MAIL_<日付>.csv  … 「メール」シートをそのまま
日付は xlsx のファイル名の 8 桁（例 20261001）。なければ今日。
Excel を直したら、もう一度実行して CSV を commit する（make.py は最新の日付の CSV を読む。古い CSV は消してよい）。
"""
import argparse, csv, datetime, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kd_common

def main():
    ap = argparse.ArgumentParser(description='Message List（xlsx）→ CSV の写し')
    ap.add_argument('xlsx'); ap.add_argument('--out')
    a = ap.parse_args()
    if not os.path.exists(a.xlsx):
        sys.exit('見つかりません: ' + a.xlsx)
    m = re.search(r'(\d{8})', os.path.basename(a.xlsx))
    date = m.group(1) if m else datetime.date.today().strftime('%Y%m%d')
    out = a.out or os.path.dirname(os.path.abspath(a.xlsx))
    os.makedirs(out, exist_ok=True)
    sheets = kd_common.read_xlsx_sheets(a.xlsx)
    if 'web' not in sheets:
        sys.exit('「WEB」を名前に含むシートがありません: ' + a.xlsx)
    for key, name in (('web', 'WEB'), ('mail', 'MAIL')):
        if key not in sheets: continue
        path = os.path.join(out, 'MessageList_%s_%s.csv' % (name, date))
        with open(path, 'w', encoding='utf-8', newline='') as f:
            w = csv.writer(f)
            for row in sheets[key]:
                w.writerow(['' if c is None else str(c).replace('\r\n', '\n') for c in row])
        parsed = kd_common.parse_web(sheets[key]) if key == 'web' else kd_common.parse_mail(sheets[key])
        print('→ %s（%d 件）' % (path, len(parsed)))
    print('次：この CSV を git に入れる（git add → commit）。make.py は xlsx がないとき、このフォルダの最新の CSV を読む')

if __name__ == '__main__':
    main()
