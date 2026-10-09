# -*- coding: utf-8 -*-
"""商品CSV取込の大量行テスト（上限 5,000 行・新規行のみ）。importPreview と importCommit（裏の取込 jobStep まで）の所要時間と、dev サーバーのメモリを測る。

使い方：QA_BIG=1 python3 scripts/qa/big_csv.py [最大行数=5000]
  - 既定では何もしない（QA_BIG=1 のときだけ動く）。dev サーバー（NEXT_PUBLIC_DEMO=1・http://localhost:3000）を起動しておく。
  - タイムアウトの番人：小さい行数から順に倍々で測り、次の段階の予想時間（直前の時間 × 行数比の2乗：いちばん悪い増え方）が
    QA_BUDGET 秒（既定 60）を超えるときは、そこで止めて報告する（サーバーを長時間止めないため）。
  - 終わったら /api/dev/reset でデータを戻す。
目標：5,000 行の確認も、登録（裏の取込を最後まで）も、それぞれ約 20 秒以内（確認の返事は 19MB ほどあり、その受け取りの時間も含む）・サーバーのメモリが増え続けない。
"""
import os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from qa_lib import Api, BASE
from sec_product import csv_text

BUDGET = float(os.environ.get('QA_BUDGET', '60'))
GOAL = float(os.environ.get('QA_GOAL', '20'))

def rss_mb():
    """dev サーバー（next-server・ポートは QA_BASE）の常駐メモリの最大値（MB）。分からなければ -1"""
    best = -1
    try:
        for pid in os.listdir('/proc'):
            if not pid.isdigit(): continue
            try:
                cmd = open(f'/proc/{pid}/cmdline', 'rb').read().decode('utf-8', 'ignore')
                if 'next' not in cmd or ('server' not in cmd and 'dev' not in cmd): continue
                for line in open(f'/proc/{pid}/status'):
                    if line.startswith('VmRSS:'): best = max(best, int(line.split()[1]) // 1024)
            except Exception:
                continue
    except Exception:
        pass
    return best

def main():
    if not os.environ.get('QA_BIG'):
        print('QA_BIG=1 を付けると実行します（dev サーバーに大きな負荷をかけるため既定では何もしません）'); return 0
    top = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    sizes = [n for n in (250, 500, 1000, 2000, 5000) if n < top] + [top]
    ok = True
    with sync_playwright() as p:
        base = p.request.new_context(base_url=BASE)
        print('reset', base.post('/api/dev/reset').status)
        a = Api(p, 'ops', 'Ad00010')
        ex = a.d('csv', 'export', {'entity': 'products', 'keys': ['M002']})[1]
        head, row = ex['head'], ex['rows'][0]
        idx = {h.split('【')[0]: i for i, h in enumerate(head)}
        def rowof(i):
            r = list(row)
            r[idx['品番']] = ''; r[idx['商品名']] = f'大量{i}'; r[idx['商品名（英語）']] = f'Bulk {i}'; r[idx['JANコード']] = ''
            return r
        last = None
        for n in sizes:
            if last and last[1] * (n / last[0]) ** 2 > BUDGET:
                print(f'STOP: {n} 行の予想 {last[1] * (n / last[0]) ** 2:.0f} 秒が番人（{BUDGET:.0f} 秒）を超える。直前 {last[0]} 行＝{last[1]:.1f} 秒（増え方が2乗に近い）')
                ok = False; break
            text = csv_text(head, [rowof(i) for i in range(n)])
            t0 = time.time()
            st, j = a._post('domain', 'csv', 'importPreview', {'entity': 'products', 'text': text, 'fileName': f'big{n}.csv', 'by': 'Ad00010'})
            dt = time.time() - t0
            print(f'preview {n:5d} 行: HTTP {st} {dt:6.1f} 秒  counts={j.get("counts") if isinstance(j, dict) else j}  RSS={rss_mb()}MB  fileErrors={j.get("fileErrors") if isinstance(j, dict) else ""}')
            last = (n, dt)
            if st != 200 or not isinstance(j, dict) or j.get('counts', {}).get('新規') != n:
                print('FAIL: 新規が行数と合わない'); ok = False; break
            if n == sizes[-1] or n == 1000:
                tok = j['token']; t1 = time.time()
                st, c = a.d('csv', 'importCommit', {'entity': 'products', 'token': tok, 'ack': True})
                dt2 = time.time() - t1
                steps = 0
                job = (c or {}).get('jobId') if isinstance(c, dict) else None
                while job:
                    st3, s = a.d('csv', 'jobStep', {'id': job}); steps += 1
                    s = s if isinstance(s, dict) else {}
                    if s.get('status') != '実行中' or steps > 500: break
                dt3 = time.time() - t1
                after = a.d('master', 'list', {'kind': 'products'})[1]
                made = sum(1 for x in after if str(x.get('name', '')).startswith('大量'))
                print(f'commit  {n:5d} 行: HTTP {st} 登録 {dt2:5.1f} 秒＋裏の取込 {steps} 回 合計 {dt3:5.1f} 秒  登録された商品={made}  RSS={rss_mb()}MB')
                if made != n: print('FAIL: 登録数が合わない'); ok = False
                if dt > GOAL or dt3 > GOAL: print(f'NG: 確認 {dt:.1f} 秒／登録 {dt3:.1f} 秒のどちらかが目標 {GOAL:.0f} 秒を超えた（{n} 行）'); ok = ok and n != top
                # 更新：全商品を出力して、取り込んだ大量の商品の名前を変えて確認する（既存行の更新も2乗にならないこと）
                if n == sizes[-1]:
                    t4 = time.time()
                    exp = a.d('csv', 'export', {'entity': 'products'})[1]
                    print(f'export  {len(exp["rows"]):5d} 行: {time.time() - t4:6.1f} 秒')
                    rws = [r for r in exp['rows'] if str(r[idx['商品名']]).startswith('大量')]
                    for r in rws: r[idx['商品名']] = r[idx['商品名']] + '改'
                    st5, j5 = a._post('domain', 'csv', 'importPreview', {'entity': 'products', 'text': csv_text(head, rws), 'fileName': 'upd.csv', 'by': 'Ad00010'})
                    dt5 = time.time() - t4
                    c5 = j5.get('counts') if isinstance(j5, dict) else j5
                    print(f'update  {len(rws):5d} 行: HTTP {st5} {dt5:6.1f} 秒（出力＋確認）counts={c5}  RSS={rss_mb()}MB')
                    if st5 != 200 or not isinstance(j5, dict) or j5['counts'].get('更新') != len(rws): print('FAIL: 更新の数が合わない'); ok = False
                    if dt5 > GOAL * 2: print(f'NOTE: 更新の確認が {GOAL * 2:.0f} 秒を超えた'); ok = False
                if n == 1000 and n != sizes[-1]:
                    base.post('/api/dev/reset'); a = Api(p, 'ops', 'Ad00010'); last = (n, dt)
        print('reset', base.post('/api/dev/reset').status, '=>', 'OK' if ok else 'NG')
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main())
