# -*- coding: utf-8 -*-
"""QC 機能テスト（商品・メニュー・注文）。使い方：python3 scripts/qa/run_qc.py [節名 ...]  （デモを NEXT_PUBLIC_DEMO=1 で http://localhost:3000 に起動しておく）
結果は docs/05_画面設計書/テスト結果_商品・メニュー・注文_20261007.md に書く。最後に /api/dev/reset でデータを戻す。"""
import importlib, os, sys, traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from qa_lib import *

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'docs', '05_画面設計書', 'テスト結果_商品・メニュー・注文_20261007.md')
SECTIONS = ['sec_product', 'sec_category', 'sec_menu', 'sec_order', 'sec_material', 'sec_corp', 'sec_extra', 'sec_fix', 'sec_ui']

NOTES = '''
## 実施の前提・メモ

- 対象：http://localhost:3000（NEXT_PUBLIC_DEMO=1・デモの今日 2026/10/05）。実行：`python3 scripts/qa/run_qc.py [節名]`（節＝sec_product／sec_category／sec_menu／sec_order／sec_material／sec_corp／sec_extra／sec_fix／sec_ui）。開始前と終了後に `/api/dev/reset`・今日を .env の日付へ戻す。アプリのコードと決定は変えていない。
- 方法：キーとなる画面は Playwright（Chromium）で操作。入力の境界・権限・締めの判定は、ログイン済みの Cookie で運営Webの API（`/api/ops/area/…`・`/api/domain/…`）を直接呼んだ（画面は同じ API を呼ぶ）。「今日」は `/api/demo/today` で動かした。
- ログイン：運営 Ad00010（フル権限＝システム管理）・Ad00002（CS）・Ad00013（閲覧のみ）・Ad00011（物流）・Ad00021（倉庫）。法人Web CU00950（スタンダード）・CU00871／CU00643（ライト）・CU00001。
- 実行しなかった・できなかったこと：①CSV 5,000行ちょうどの取込（#80 の観測のとおりサーバーが長時間止まるため、既定ではスキップ。`QA_BIG=1`）②取消の注文の編集（見本に取消の商品注文がない。資材の取消は確認済）③締めの当日 23:59／翌日 0:00 の時刻の境界・バッチ失敗（デモは日付単位の操作だけ）④公開メニューの外した商品を、発注締め日の「後」に自動注文から外さないこと（メニュー自体が締切後で編集できないため作れない）⑤請求済みの月にかかる資材注文の調整明細⑥メール・アプリ通知の実配信⑦PDF の実ファイル（デモは「開きます」の表示だけ）。
'''

def set_today(ctx, d):
    r = ctx.post('/api/demo/today', data={'date': d}); return r.status

def main():
    only = sys.argv[1:]
    with sync_playwright() as p:
        base = p.request.new_context(base_url=BASE)
        print('reset', base.post('/api/dev/reset').status, 'today', set_today(base, ''))
        ctxs = {'ops_full': Api(p, 'ops', 'Ad00010'), 'ops_cs': Api(p, 'ops', 'Ad00002'), 'ops_viewer': Api(p, 'ops', 'Ad00013'), 'base': base}
        for k, v in ctxs.items():
            if k != 'base': print(k, v.ok)
        br = launch(p); ctxs['browser'] = br; ctxs['pw'] = p
        for s in SECTIONS:
            if only and s not in only: continue
            try:
                m = importlib.import_module(s)
            except ModuleNotFoundError:
                continue
            try:
                m.run(p, ctxs)
            except Exception as e:
                traceback.print_exc()
                screen(s); rec(f'節 {s} の実行が途中で止まった', '-', False, f'{type(e).__name__}: {e}', blocked=True)
            base.post('/api/dev/reset'); set_today(base, '')
            for k in ('ops_full', 'ops_cs', 'ops_viewer'):  # reset で Cookie のアカウントは残る
                pass
        br.close()
        base.post('/api/dev/reset'); set_today(base, '')
    n = write_table(OUT, '# テスト結果：商品・メニュー・注文（2026-10-07 QC・実行：scripts/qa/run_qc.py）')
    open(OUT, 'a', encoding='utf-8').write(NOTES)
    print(n)

if __name__ == '__main__':
    main()
