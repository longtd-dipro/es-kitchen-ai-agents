# -*- coding: utf-8 -*-
"""result.json から、クリックで進むビューア（HTML 1ファイル・画像は中に埋め込む）を作る"""
import base64, json, os

SITES = {'corp': ['法人Web', 'Web DN'], 'ops': ['運営', 'Vận hành'], 'warehouse': ['倉庫', 'Kho'], 'driver': ['ドライバー', 'Tài xế'],
         'carrier': ['委託配送', 'Giao ủy thác'], 'supplier': ['仕入先', 'Nhà cung cấp'], 'system': ['システム', 'Hệ thống']}

def b64(out, rel, width=None, q=None):
    """画像を data URI に。width・q を渡すと縮めて WebP にする（閲覧用を 512KB 未満にするため）"""
    if not rel: return ''
    p = os.path.join(out, rel)
    if not os.path.exists(p): return ''
    if width:
        import io
        from PIL import Image
        im = Image.open(p).convert('RGB')
        if im.width > width: im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
        return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    return 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

LIMIT = 500 * 1024      # Claude アプリの Browser ペインは 512KB まで

def build(out):
    """2つ作る：閲覧用（画像を縮めて埋め込み・500KB 未満。アプリでそのまま開ける）と、送付用（元の画質で埋め込み）"""
    R = json.load(open(os.path.join(out, 'result.json'), encoding='utf-8'))
    sc = R['scenario']
    lanes = []
    for s in R['steps']:
        if s['site'] not in lanes: lanes.append(s['site'])
    name = sc.get('short') or sc['title'][0].split('（')[0]
    def page(img):
        steps = []
        for s in R['steps']:
            st = {k: s.get(k) for k in ('site', 'url', 'cap', 'act', 'result', 'note', 'box', 'diff', 'watch')}
            st['img'] = img(s.get('shot')); st['imgAfter'] = img(s.get('shotAfter'))
            steps.append(st)
        data = {'title': sc['title'], 'id': sc['id'], 'when': R['when'], 'lanes': [[k] + SITES.get(k, [k, k]) for k in lanes],
                'steps': steps, 'goal': sc.get('goal', ['', ''])}
        return TEMPLATE.replace('/*__DATA__*/', 'window.SF=' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + ';')
    html = ''
    for width, q in ((1100, 60), (1000, 50), (900, 42), (800, 35), (700, 30), (600, 26)):
        html = page(lambda rel: b64(out, rel, width, q))
        if len(html.encode('utf-8')) < LIMIT: break
    view = os.path.join(out, '%s_%s.html' % (sc['id'], name))
    open(view, 'w', encoding='utf-8').write(html)
    open(os.path.join(out, '%s_%s_送付用.html' % (sc['id'], name)), 'w', encoding='utf-8').write(page(lambda rel: b64(out, rel)))
    return view

TEMPLATE = r'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>シナリオの流れ</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#1f2933;--ink2:#52606d;--ink3:#8a96a3;--line:#dde3ea;--acc:#2563eb;--accb:#e8efff;--red:#e11d48;--ok:#15803d;--okb:#e7f6ec;--warn:#b45309;--warnb:#fff4e0;--ng:#b91c1c;--ngb:#fde8e8}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#111418;--card:#1a1f25;--ink:#e6eaef;--ink2:#b3bdc8;--ink3:#7d8996;--line:#2b333c;--acc:#7aa2ff;--accb:#1d2a44;--red:#ff5c7c;--ok:#4ade80;--okb:#14301f;--warn:#fbbf24;--warnb:#33280f;--ng:#f87171;--ngb:#3a1717}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.6 -apple-system,"Hiragino Sans","Noto Sans JP",sans-serif}
header{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--card);flex-wrap:wrap}
header h1{font-size:16px;margin:0;font-weight:600}header .sub{color:var(--ink3);font-size:12px}
.sp{flex:1}.seg button{border:1px solid var(--line);background:var(--card);color:var(--ink2);padding:4px 10px;cursor:pointer}.seg button.on{background:var(--accb);color:var(--acc);border-color:var(--acc)}
.seg button:first-child{border-radius:6px 0 0 6px}.seg button:last-child{border-radius:0 6px 6px 0}
main{max-width:1280px;margin:0 auto;padding:12px 16px}
.lanes{display:grid;gap:8px;margin-bottom:12px}.lane{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:6px 8px;min-width:0}
.lane h3{margin:0 0 6px;font-size:12px;color:var(--ink2);font-weight:600;text-align:center}.dots{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.dot{width:28px;height:28px;border-radius:50%;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;color:var(--ink3);background:var(--card)}
.dot.done{background:var(--bg);color:var(--ink2)}.dot.on{background:var(--acc);color:#fff;border-color:var(--acc)}.dot.warn{box-shadow:0 0 0 2px var(--warn)}.dot.fail{box-shadow:0 0 0 2px var(--ng)}
.wrap{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:12px}@media (max-width:900px){.wrap{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.cap{font-size:16px;font-weight:600;margin:0 0 4px}.where{font-size:12px;color:var(--ink3);margin-bottom:8px;word-break:break-all}
.shot{position:relative;border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:pointer}.shot img{display:block;width:100%}
.hint{position:absolute;border:3px solid var(--red);border-radius:6px;animation:pulse 1.2s infinite;cursor:pointer}
.hint.look{border-style:dashed;border-color:var(--acc);animation:none;cursor:default}
.hint .lbl{position:absolute;top:-30px;left:0;white-space:nowrap;background:var(--red);color:#fff;font-size:12px;font-weight:600;padding:3px 8px;border-radius:5px}
.hint.look .lbl{background:var(--acc)}.hint.below .lbl{top:auto;bottom:-30px}.hint.right .lbl{left:auto;right:0}
.hint.shake{animation:shake .4s 2}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(225,29,72,.55)}70%{box-shadow:0 0 0 14px rgba(225,29,72,0)}100%{box-shadow:0 0 0 0 rgba(225,29,72,0)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@media (prefers-reduced-motion:reduce){.hint{animation:none}}
.nav{display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap}
.btn{border:1px solid var(--line);background:var(--card);color:var(--ink);padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px}
.btn.pri{background:var(--acc);color:#fff;border-color:var(--acc)}.btn.pri.glow{animation:pulseb 1.2s infinite}
@keyframes pulseb{0%{box-shadow:0 0 0 0 rgba(37,99,235,.5)}70%{box-shadow:0 0 0 12px rgba(37,99,235,0)}100%{box-shadow:0 0 0 0 rgba(37,99,235,0)}}
.tip{font-size:12px;color:var(--ink3)}
.res{display:inline-block;font-size:12px;padding:1px 8px;border-radius:10px;margin-left:6px;vertical-align:2px}
.res.ok{background:var(--okb);color:var(--ok)}.res.warn{background:var(--warnb);color:var(--warn)}.res.fail{background:var(--ngb);color:var(--ng)}
.side h4{margin:0 0 8px;font-size:13px;color:var(--ink2)}.chip{display:flex;align-items:center;gap:6px;flex-wrap:wrap;border:1px solid var(--line);border-radius:8px;padding:6px 8px;margin-bottom:6px}
.chip code{font:12px ui-monospace,Menlo,monospace}.chip .k{font-size:11px;color:var(--ink3)}
.st{font-size:11px;padding:1px 6px;border-radius:4px}.st.new{background:var(--warnb);color:var(--warn)}.st.upd{background:var(--accb);color:var(--acc)}.st.del{background:var(--ngb);color:var(--ng)}
.arrow{color:var(--ink3)}.none{color:var(--ink3);font-size:13px}.fields{font-size:11px;color:var(--ink3);width:100%}
.note{margin-top:8px;font-size:12px;padding:6px 8px;border-radius:6px;background:var(--warnb);color:var(--warn)}
.trail{margin-top:12px}.trail .t{font-size:12px;color:var(--ink2);margin-bottom:4px}.trail code{font:11px ui-monospace,Menlo,monospace;background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:1px 5px;margin:0 4px 4px 0;display:inline-block}
.done-box{text-align:center;padding:24px}
</style></head><body>
<header><h1 id="ttl"></h1><span class="sub" id="sub"></span><span class="sp"></span>
<div class="seg" id="lang"><button data-l="ja" class="on">日本語</button><button data-l="vi">Tiếng Việt</button></div></header>
<main><div class="lanes" id="lanes"></div>
<div class="wrap"><div class="card"><p class="cap" id="cap"></p><div class="where" id="where"></div>
<div class="shot" id="shot"><img id="img" alt=""><div class="hint" id="hint"><span class="lbl" id="lbl"></span></div></div>
<div class="nav"><button class="btn" id="prev"></button><button class="btn pri" id="next"></button><span class="tip" id="tip"></span></div>
<div id="note"></div></div>
<div class="card side"><h4 id="dh"></h4><div id="chips"></div><div class="trail" id="trail"></div></div></div></main>
<script>/*__DATA__*/</script>
<script>
var D=window.SF,L='ja',I=0;
var T={ja:{click:'ここを押す',look:'ここを見る',next:'次へ ▶',prev:'◀ 戻る',tip:'赤い枠を押すと次に進みます',tipL:'見たら「次へ」',data:'このステップで変わったデータ',none:'データの変化なし（見るだけ）',noneC:'データの変化なし',trail:'ここまでに出てきた ID',ok:'動いた',warn:'要確認',fail:'動かない',fin:'最後まで来ました',again:'最初から',ins:'新規',upd:'更新',del:'削除',touch:'保存（内容は同じ）',miss:'赤い枠を押してください'},
vi:{click:'Bấm vào đây',look:'Xem chỗ này',next:'Tiếp ▶',prev:'◀ Lùi',tip:'Bấm vào khung đỏ để sang bước tiếp',tipL:'Xem xong bấm "Tiếp"',data:'Dữ liệu thay đổi ở bước này',none:'Không đổi dữ liệu (chỉ xem)',noneC:'Không có thay đổi dữ liệu',trail:'Các ID đã xuất hiện',ok:'Chạy được',warn:'Cần xem',fail:'Không chạy',fin:'Đã tới bước cuối',again:'Xem lại từ đầu',ins:'Mới',upd:'Cập nhật',del:'Xóa',touch:'Đã lưu (nội dung như cũ)',miss:'Hãy bấm vào khung đỏ'}};
function t(k){return T[L][k]}function P(x){return Array.isArray(x)?(x[L==='vi'?1:0]||x[0]):(x||'')}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function $(i){return document.getElementById(i)}
function lanes(){var g=$('lanes');g.style.gridTemplateColumns='repeat('+D.lanes.length+',minmax(0,1fr))';
g.innerHTML=D.lanes.map(function(l){return '<div class="lane"><h3>'+esc(L==='vi'?l[2]:l[1])+'</h3><div class="dots">'+D.steps.map(function(s,j){return s.site===l[0]?'<div class="dot '+(j===I?'on':j<I?'done':'')+' '+(s.result!=='ok'?s.result:'')+'" data-j="'+j+'" title="'+esc(P(s.cap))+'">'+(j+1)+'</div>':''}).join('')+'</div></div>'}).join('');
g.querySelectorAll('.dot').forEach(function(e){e.onclick=function(){go(+e.dataset.j)}})}
function chips(s){if(!s.diff||!s.diff.length)return '<div class="none">'+(s.act==='click'?t('noneC'):t('none'))+'</div>';
return s.diff.slice(0,14).map(function(d){var c=d.op==='insert'?'new':d.op==='delete'?'del':'upd',lab=d.op==='insert'?t('ins'):d.op==='delete'?t('del'):d.op==='touch'?t('touch'):t('upd');
var st=d.before&&d.after&&d.before!==d.after?esc(d.before)+' <span class="arrow">→</span> '+esc(d.after):esc(d.after||d.before||'');
return '<div class="chip"><code>'+esc(d.id)+'</code><span class="k">'+esc(d.kind)+'</span><span class="st '+c+'">'+lab+'</span>'+(st?'<span>'+st+'</span>':'')+(d.fields&&d.fields.length&&d.op==='update'?'<div class="fields">'+esc(d.fields.join(', '))+'</div>':'')+'</div>'}).join('')+(s.diff.length>14?'<div class="none">… +'+(s.diff.length-14)+'</div>':'')}
function trail(){var seen=[];for(var j=0;j<Math.min(I+1,D.steps.length);j++){(D.steps[j].diff||[]).forEach(function(d){if(d.op==='insert'&&seen.indexOf(d.id)<0)seen.push(d.id)});(D.steps[j].watch||[]).forEach(function(w){if(seen.indexOf(w)<0)seen.push(w)})}
return seen.length?'<div class="t">'+t('trail')+'</div>'+seen.map(function(x){return '<code>'+esc(x)+'</code>'}).join(''):''}
function go(j){I=Math.max(0,Math.min(D.steps.length,j));draw()}
function draw(){lanes();var fin=I>=D.steps.length,s=D.steps[Math.min(I,D.steps.length-1)];
$('ttl').textContent=P(D.title);$('sub').textContent=D.id+' ・ '+D.when;
if(fin){$('cap').innerHTML=t('fin');$('where').textContent='';$('img').src=s.imgAfter||s.img;$('hint').style.display='none';
$('next').textContent=t('again');$('next').classList.remove('glow');$('tip').textContent='';$('note').innerHTML='';}
else{var lane=D.lanes.filter(function(l){return l[0]===s.site})[0];
$('cap').innerHTML=(I+1)+'. '+esc(P(s.cap))+'<span class="res '+s.result+'">'+t(s.result)+'</span>';
$('where').textContent=(L==='vi'?lane[2]:lane[1])+'  '+(s.url||'');$('img').src=s.img;
var h=$('hint');if(s.box){h.style.display='block';h.style.left=(s.box[0]*100)+'%';h.style.top=(s.box[1]*100)+'%';h.style.width=(s.box[2]*100)+'%';h.style.height=(s.box[3]*100)+'%';
h.className='hint '+(s.act==='look'?'look':'')+(s.box[1]<0.06?' below':'')+(s.box[0]+s.box[2]>0.8?' right':'');$('lbl').textContent=s.act==='look'?t('look'):t('click');}else h.style.display='none';
$('next').textContent=t('next');$('next').classList.toggle('glow',s.act!=='click'||!s.box);$('tip').textContent=s.act==='click'&&s.box?t('tip'):t('tipL');
$('note').innerHTML=s.note?'<div class="note">'+esc(P(s.note))+'</div>':'';}
$('prev').textContent=t('prev');$('prev').disabled=I===0;$('dh').textContent=t('data');$('chips').innerHTML=fin?'':chips(s);$('trail').innerHTML=trail()}
$('hint').onclick=function(e){e.stopPropagation();var s=D.steps[I];if(s&&s.act==='click')go(I+1)};
$('shot').onclick=function(){var s=D.steps[I];if(s&&s.act==='click'&&s.box){var h=$('hint');$('tip').textContent=t('miss');h.classList.remove('shake');void h.offsetWidth;h.classList.add('shake')}};
$('next').onclick=function(){go(I>=D.steps.length?0:I+1)};$('prev').onclick=function(){go(I-1)};
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(I+1);if(e.key==='ArrowLeft')go(I-1)});
$('lang').onclick=function(e){var b=e.target.closest('button');if(!b)return;L=b.dataset.l;document.querySelectorAll('#lang button').forEach(function(x){x.classList.toggle('on',x===b)});document.documentElement.lang=L;draw()};
draw();
</script></body></html>'''

if __name__ == '__main__':
    import sys
    print(build(sys.argv[1]))
