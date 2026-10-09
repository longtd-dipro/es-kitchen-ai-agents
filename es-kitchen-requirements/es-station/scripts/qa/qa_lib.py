# -*- coding: utf-8 -*-
"""QC 共通の道具：ログイン（API）・領域の呼び出し・結果の記録。run_qc.py から使う。"""
import json, os, re, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get('QA_BASE', 'http://localhost:3000')
RESULTS = []          # (画面, 観点, 決定, 結果, 実際の動き)
_cur = {'screen': ''}

class Api:
    """1つのログイン（サイト＋ID）。Cookie を持つ API 呼び出し役"""
    def __init__(self, pw, site, login_id):
        self.site, self.login_id = site, login_id
        self.ctx = pw.request.new_context(base_url=BASE, extra_http_headers={'x-es-site': site})
        r = self.ctx.post('/api/domain/account/signIn', data={'args': {'site': site, 'loginId': login_id}})
        j = r.json()
        self.ok = r.ok and (j.get('data', j).get('ok') if isinstance(j, dict) else False)
        self.login_res = j
    def _post(self, kind, area, op, args):
        r = self.ctx.post(f'/api/{kind}/{area}/{op}', data={'args': args if args is not None else {}}, timeout=300000)
        try: j = r.json()
        except Exception: j = {'raw': r.text()[:300]}
        return r.status, j
    def d(self, area, op, args=None): return self._post('domain', area, op, args)
    def o(self, area, op, args=None): return self._post('ops/area', area, op, args)
    def raw(self, path, data=None):
        r = self.ctx.post(path, data=data or {})
        try: return r.status, r.json()
        except Exception: return r.status, {'raw': r.text()[:300]}

def data_of(j):
    """API の返事から中身を取り出す（{data:…} か {error:…}）"""
    if isinstance(j, dict):
        if 'data' in j: return j['data']
    return j

def err_of(st, j):
    if st < 400: return ''
    if isinstance(j, dict):
        e = j.get('error') or j.get('message') or j
        if isinstance(e, dict): e = e.get('message') or json.dumps(e, ensure_ascii=False)
        return str(e)
    return str(j)

def screen(name): _cur['screen'] = name

def rec(desc, decision, ok, actual='', blocked=False):
    res = 'BLOCKED' if blocked else ('PASS' if ok else 'FAIL')
    RESULTS.append((_cur['screen'], desc, decision, res, (actual or '').replace('\n', ' ⏎ ').replace('|', '\\|')))
    print(f"[{res}] {len(RESULTS):3d} {_cur['screen']} / {desc}" + ('' if ok or blocked else '\n        -> ' + (actual or '')[:300]))
    return ok

def reset(api_ctx):
    return api_ctx.post('/api/dev/reset').status

def write_table(path, header_note=''):
    n = {'PASS': 0, 'FAIL': 0, 'BLOCKED': 0}
    for r in RESULTS: n[r[3]] += 1
    lines = [header_note, '', f"集計：PASS {n['PASS']}／FAIL {n['FAIL']}／BLOCKED {n['BLOCKED']}（計 {len(RESULTS)}）", '',
             '| # | 画面 | 観点（入力→期待結果） | 決定（受付簿 No.） | 結果 | 実際の動き（FAILのみ詳しく） |', '|---|---|---|---|---|---|']
    for i, (s, d, dec, res, act) in enumerate(RESULTS, 1):
        lines.append(f'| {i} | {s} | {d.replace("|", "／")} | {dec} | {res} | {act if res != "PASS" else ""} |')
    open(path, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    return n

CHROME = os.environ.get('QA_CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')

def launch(p):
    return p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=['--no-sandbox'])

LOGINS = {'ops': ('/ops', '#ops-login-id', '#ops-login-pw', 'button[type=submit]'),
          'corp': ('/corp/login', 'input[autocomplete=username]', 'input[autocomplete=current-password]', 'button[type=submit]')}

def ui_login(br, site, login_id, vw=1400, vh=1000):
    """ブラウザの新しい文脈でログインして (context, page) を返す"""
    c = br.new_context(viewport={'width': vw, 'height': vh}); pg = c.new_page()
    path, i, w, b = LOGINS[site]
    pg.goto(BASE + path); pg.wait_for_selector(i, timeout=30000)
    pg.fill(i, login_id); pg.fill(w, 'password'); pg.click(b)
    pg.wait_for_selector(i, state='detached', timeout=30000); pg.wait_for_timeout(1200)
    return c, pg
