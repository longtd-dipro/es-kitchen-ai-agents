'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CANCEL_REASONS, DUP_KINDS, RESOLVE_OPTS, TROUBLE_AUTO_CHILD, TROUBLE_FROM, TROUBLE_KINDS } from '@/lib/ops/delivery/constants';
import { checkCancel, checkCrProcess, checkDuplicate, checkTroubleReport, checkTroubleResolve, type Errors } from '@/lib/ops/delivery/logic';
import type { DeliveryDetail } from '@/lib/ops/delivery/types';
import { useQuery } from '@/lib/ops/core/client';
import { useOps } from '../../_ui/OpsProvider';
import { api } from './api';
import { Badge, Button, Checkbox, Dialog, DialogSection, Field, InlineMessage, Radio, SectionTitle, Select, TextField } from './kit';

/* 配送データ詳細から開くモーダル（部品 16 の DeliveryCancel・DeliveryDuplicate・TroubleReport・TroubleResolve・ChangeRequestProcess） */

type P = { r: DeliveryDetail; onClose: () => void };
const foot = (r: DeliveryDetail) => `${r.site} ・ ${r.temp} ・ ${r.st}`;
const num = (s: string) => parseInt(s, 10) || 0;

/** 配送データの取消 */
export function CancelModal({ r, onClose, onAlt }: P & { onAlt: () => void }) {
  const { toast, toastError } = useOps();
  const [f, setF] = useState({ why: '', detail: '', alt: true });
  const [err, setErr] = useState<Errors>({});
  const submit = async () => {
    const e = checkCancel(f);
    setErr(e);
    if (Object.keys(e).length) return;
    try {
      await api.action('cancelDelivery', { id: r.id, ...f });
      onClose();
      toast(f.alt ? '取消しました（代わりの便は複製で作ります）' : '取消しました');
      if (f.alt) onAlt();
    } catch (x) { toastError(x); }
  };
  return (
    <Dialog m="DeliveryCancel" title="配送データの取消" id={r.id} footerNote={foot(r)} onClose={onClose}
      footer={<><Button variant="outline" size="lg" onClick={onClose}>キャンセル</Button><Button size="lg" tone="negative" onClick={submit}>取消する</Button></>}>
      <DialogSection title="取消するとどうなるか" note="取消できるのは倉庫から出る前だけです。出荷後に止めるときは「対応を決める」の中止を使います。" />
      <div className="mdl-b">
        <table className="imp">
          <tbody>
            <tr><td>出荷指示</td><td className="n">{r.so}</td></tr>
            <tr className="sub"><td>送信済みなら数量0の新しい版で再送して打ち消します。ピッキング開始後は倉庫へ電話でも連絡します</td><td className="n"></td></tr>
            <tr><td>送り状</td><td className="n">{r.invoices.length}件</td></tr>
            <tr><td>請求</td><td className="n">対象外（実績0）</td></tr>
            <tr className="sub"><td>代わりの便を作らないときは「お届け中止」</td><td className="n"></td></tr>
          </tbody>
        </table>
      </div>
      <DialogSection title="理由" />
      <div className="mdl-b">
        <div className="two">
          <Select label="理由" req placeholder="選んでください" options={CANCEL_REASONS} value={f.why} onChange={(why) => setF({ ...f, why })} error={err.why} />
          <TextField label="理由の詳細" req placeholder="例：倉庫の設備故障のため、関西倉庫から出す" value={f.detail} onChange={(detail) => setF({ ...f, detail })} error={err.detail} />
        </div>
        <Checkbox label="続けて代わりの便を複製で作る（代替便）" checked={f.alt} onChange={(alt) => setF({ ...f, alt })} />
        <div className="note">取消した配送データは消さずに残し、変更履歴に理由と操作者を記録します。</div>
      </div>
    </Dialog>
  );
}

/** 配送データの複製（分納・再配送・代替便・返送・その他） */
export function DuplicateModal({ r, onClose, initial = 'return' }: P & { initial?: string }) {
  const { toast, toastError } = useOps();
  const [kind, setKind] = useState(initial);
  const d = DUP_KINDS.find((k) => k.v === kind)!;
  const [f, setF] = useState({ reason: '', date: '', dest: '', wh: '' });
  /* 子の数量の初期値：再配送・代替便は元の確定数量（全量）、ほかは 0（残数・返送数は運営が入れる） */
  const fullQty = (v: string) => (v === 'redelivery' || v === 'alternative' ? r.qty.slice(0, 3).map((q) => String(num(q.f) || num(q.p))) : ['0', '0', '0']);
  const [qty, setQty] = useState<string[]>(fullQty(initial));
  const [err, setErr] = useState<Errors>({});
  const pick = (v: string) => { setKind(v); setQty(fullQty(v)); setErr({}); };
  let n = 1; while (r.children.includes(`${r.id}-${n}`)) n++;
  const products = r.qty.slice(0, 3), done = r.sample === 'done';
  const submit = async () => {
    const e = checkDuplicate({ ...f, kind });
    setErr(e);
    if (Object.keys(e).length) return;
    try {
      const out = await api.action('duplicateDelivery', { id: r.id, kind, ...f, qty });
      onClose();
      toast(`${out.id} を作成しました（確認中）`);
    } catch (x) { toastError(x); }
  };
  return (
    <Dialog m="DeliveryDuplicate" title="配送データの複製" id={r.id} footerNote={`新しい配送No：${r.id}-${n}（枝番は最大9）`} onClose={onClose}
      footer={<><Button variant="outline" size="lg" onClick={onClose}>キャンセル</Button><Button size="lg" onClick={submit}>複製する</Button></>}>
      <DialogSection title="複製の理由" note="元の配送データは書き換えません。子は確認中で作り、日付と数量を確定すると出荷待になります。" />
      <div className="mdl-b">
        <div style={{ display: 'flex', gap: '1.714286rem', flexWrap: 'wrap' }}>
          {DUP_KINDS.map((o) => <Radio key={o.v} name="dr" label={o.label} checked={kind === o.v} onChange={() => pick(o.v)} />)}
        </div>
        <div className="note">{d.desc}</div>
        <TextField label="理由の詳細" req placeholder="例：不在のため全量を再配送" value={f.reason} onChange={(reason) => setF({ ...f, reason })} error={err.reason} />
      </div>
      <DialogSection title="行き先と日付" />
      <div className="mdl-b">
        <div className="es-formgrid">
          {kind === 'return'
            ? <Select label="返送先" req placeholder="選んでください" options={['本社（東京・港区）', '関西事務所（大阪・北区）']} value={f.dest} onChange={(dest) => setF({ ...f, dest })} error={err.dest} helper="倉庫マスタの区分「返送先」から選びます。納品先を替えられるのは返送だけです" />
            : <TextField label="納品先" value={`${r.site}（元の配送からコピー）`} readOnly />}
          {kind === 'alternative' && <Select label="ピッキング倉庫" placeholder="元の配送と同じ" options={['関東倉庫 WH00001', '関西倉庫 WH00002']} value={f.wh} onChange={(wh) => setF({ ...f, wh })} helper="移動先の倉庫で扱えない商品は選び直します" error={err.wh} />}
          <TextField date label="仮の納品日" req icon="CalendarBlank" value={f.date} onChange={(date) => setF({ ...f, date })} error={err.date} helper="ピッキング日はリードタイムを保って決まります" />
        </div>
      </div>
      <DialogSection title="商品ごとの数量" note={d.qtyNote} />
      <div className="mdl-b">
        <div className="es-table-wrap">
          <table className="es-table compact">
            <thead><tr><th>商品名</th><th className="r">元の確定数量</th><th className="r">元の実績</th><th>子の数量</th></tr></thead>
            <tbody>
              {products.map((q, i) => (
                <tr key={q.n}>
                  <td>{q.n}</td>
                  <td className="r es-num">{num(q.f) || num(q.p)}</td>
                  <td className="r es-num">{done ? [10, 8, 5][i] : '—'}</td>
                  <td><TextField size="sm" suffix="食" value={qty[i] ?? '0'} onChange={(v) => setQty(Object.assign([...qty], { [i]: v }))} style={{ width: '7.142857rem' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {r.children.length > 0 && (
          <InlineMessage tone="info" title={`この配送にはすでに子が${r.children.length}件あります`}>
            {r.children.join('・')} です。新しい子は枝番 -{n} になります。未解決のトラブルに子があるときは2件目を作らず、その子を使い回します。
          </InlineMessage>
        )}
      </div>
    </Dialog>
  );
}

/** トラブルの代理登録 */
export function TroubleReportModal({ r, onClose }: P) {
  const { toast, toastError } = useOps();
  const [f, setF] = useState({ from: '', who: '', at: '', kind: '', text: '' });
  const [asked, setAsked] = useState(true);
  const [err, setErr] = useState<Errors>({});
  const auto = TROUBLE_AUTO_CHILD.includes(f.kind);
  const submit = async () => {
    const e = checkTroubleReport(f);
    setErr(e);
    if (Object.keys(e).length) return;
    try {
      await api.action('reportTrouble', { id: r.id, ...f });
      onClose();
      toast('トラブルを登録しました（種別により子を作成）');
    } catch (x) { toastError(x); }
  };
  return (
    <Dialog m="TroubleReport" title="トラブルの代理登録" id={r.id} footerNote={foot(r)} onClose={onClose}
      footer={<><Button variant="outline" size="lg" onClick={onClose}>キャンセル</Button><Button size="lg" onClick={submit}>登録する</Button></>}>
      <DialogSection title="連絡の内容" note="法人・拠点・配送会社からの連絡を運営が代わりに登録します。登録しても配送データの状態は変えません。" />
      <div className="mdl-b">
        <div className="es-formgrid">
          <Select label="連絡元" req placeholder="選んでください" options={TROUBLE_FROM} value={f.from} onChange={(from) => setF({ ...f, from })} error={err.from} />
          <TextField label="連絡者" placeholder="例：総務部 森 ・ 電話番号" value={f.who} onChange={(who) => setF({ ...f, who })} />
          <TextField label="連絡を受けた日時" placeholder="yyyy-mm-dd hh:mm" icon="CalendarBlank" value={f.at} onChange={(at) => setF({ ...f, at })} />
          <Select label="種別（6区分）" req placeholder="選んでください" options={TROUBLE_KINDS} value={f.kind} onChange={(kind) => setF({ ...f, kind })} error={err.kind} />
        </div>
        <TextField label="内容" req placeholder="例：9/25 の冷凍便が届いていない" value={f.text} onChange={(text) => setF({ ...f, text })} error={err.text} />
        <div className="row between">
          <span className="note">写真・資料は「この配送の資料」に付きます。</span>
          <Button variant="outline" size="sm" icon="Plus" onClick={() => toast('写真を追加しました')}>写真を追加</Button>
        </div>
        {f.kind && <InlineMessage tone={auto ? 'info' : 'warning'} title={auto ? '登録と同時に、送り直し用の子を1件作ります' : 'この種別では子を作りません'}>
          {auto ? `子（確認中・仮の日付と数量）を作ります。解決で使い回すか取消にします。確定するまで出荷指示・割当・請求の対象外です。` : '未解決のトラブル報告として要確認に残ります。送るかどうかは「対応を決める」で選びます。'}
        </InlineMessage>}
        <details style={{ marginTop: '0.571429rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.928571rem', color: 'var(--primary-text)' }}>種別の決め方：ドライバーアプリの選択肢との対応表（2026-10-01 決定 A3）</summary>
          <table className="trmap">
            <thead><tr><th>場面</th><th>アプリの選択肢（原文）</th><th>運営の6区分</th><th>自動子</th></tr></thead>
            <tbody>
              {[
                ['荷物受取', '箱数不足', '数量相違（不足・過剰）', '作らない'], ['荷物受取', '誤配送', '誤配送', '作る'], ['荷物受取', '荷物破損', '破損・品質不良', '作る'], ['荷物受取', 'その他', 'その他', '作らない'],
                ['自動（受取）', '一部未受取のまま完了', '数量相違（不足・過剰）', '作らない'], ['配達', '商品不足・誤配送', '種別未定（解決のときに6区分を付ける）', '付けたときに判定'],
                ['配達', '交通渋滞・事故', '遅延（渋滞・事故・天候）', '作らない'], ['配達', '不在・連絡不可', '不在・受け取り不可', '作る'], ['配達', 'その他', 'その他', '作らない'],
                ['自動（ES配送便）', '③陳列の差異', '種別未定', '付けたときに判定'], ['自動（COOL便）', '一部未配送のまま完了', '数量相違（不足・過剰）', '作らない（再配送は「対応を決める」で選ぶ）'],
              ].map((x, i) => <tr key={i}>{x.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
            </tbody>
          </table>
          <div className="note">代理登録（電話・メールで受けた連絡）も同じ6区分で登録します。ドライバーの報告は原文（app_reason_raw）を残し、この表で6区分に入れます。</div>
        </details>
      </div>
      <DialogSection title="みなし完了の配送" note="運送会社が直接配達した配送は、納品日の翌朝に納品済（みなし）になっています。" />
      <div className="mdl-b">
        <Checkbox label={`ヤマト運輸へ調査を依頼した${r.invoices.length ? `（送り状 ${r.invoices.map((x) => x.no).join('・')}）` : ''}`} checked={asked} onChange={setAsked} />
        <div className="note">調査で紛失・未配達と分かったら、「対応を決める」で 再配達待（送り直す）または 中止 を選べます（みなし完了の納品済だけ）。請求が確定済みなら翌月の調整で直します。</div>
      </div>
    </Dialog>
  );
}

/** トラブルの対応を決める（1. 対応を選ぶ → 2. 数量・子・理由を入れる） */
export function TroubleResolveModal({ r, onClose }: P) {
  const { toast, toastError } = useOps();
  const [step, setStep] = useState<1 | 2>(1);
  const [cur, setCur] = useState('redelivery');
  const sel = RESOLVE_OPTS.find((o) => o.v === cur)!;
  const open = r.trb.filter((t) => t.st === '未解決');
  const needKind = open.some((t) => t.kind === '種別未定');
  const [kind2, setKind2] = useState('');
  const [reason, setReason] = useState('');
  const [freight, setFreight] = useState('請求しない');
  const [childDate, setChildDate] = useState('');
  const [err, setErr] = useState<Errors>({});
  const products = r.qty.map((q) => ({ n: q.n, id: q.id ?? '', f: num(q.f) || num(q.p) }));
  /* 納品できた数（商品ごとの入力。対応を選び直したら初期値に戻す） */
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const got0 = (i: number) => products[i].f;
  const got = (i: number) => (qtys[cur + i] !== undefined ? Math.min(Math.max(num(qtys[cur + i]), 0), products[i].f) : got0(i));
  const resend = products.reduce((a, p, i) => a + (p.f - got(i)), 0), total = products.reduce((a, p) => a + p.f, 0);
  const pick = (v: string) => setCur(v);
  const hasQty = cur === 'full' || cur === 'partial' || cur === 'partial_no_resend';
  const hasChild = cur === 'partial' || cur === 'redelivery', hasFreight = cur === 'redelivery' || cur === 'stop';
  const submit = async () => {
    const e = checkTroubleResolve({ reason, needKind, kind2 });
    setErr(e);
    if (Object.keys(e).length) return;
    try {
      await api.action('resolveTrouble', { id: r.id, option: cur, kind2: needKind ? kind2 : undefined, qty: hasQty ? products.map((p, i) => ({ id: p.id, qty: got(i) })) : undefined, reason, freight: hasFreight ? freight : undefined, childDate: hasChild ? childDate : undefined });
      onClose();
      toast('トラブルを解決しました');
    } catch (x) { toastError(x); }
  };
  const stepCls = (n: number) => 'es-stage__step es-stage__step--' + (n === step ? 'current' : n < step ? 'done' : 'future');
  const steps = <div className="trs-steps"><span className={stepCls(1)}>1. 対応を選ぶ</span><span className="es-stage__arrow" aria-hidden="true">▶</span><span className={stepCls(2)}>2. 数量・子・理由を入れる</span></div>;
  const qtyInput = (i: number) => <TextField size="sm" suffix="食" value={qtys[cur + i] ?? String(got0(i))} onChange={(v) => setQtys({ ...qtys, [cur + i]: v })} style={{ width: '7.142857rem' }} />;
  return (
    <Dialog m="TroubleResolve" title="トラブルの対応を決める" id={r.id} toolbar={steps} footerNote={foot(r)} onClose={onClose}
      footer={step === 1
        ? <><Button variant="outline" size="lg" onClick={onClose}>キャンセル</Button><Button size="lg" onClick={() => setStep(2)}>次へ</Button></>
        : <><Button variant="outline" size="lg" onClick={() => setStep(1)}>戻る</Button><Button size="lg" onClick={submit}>解決する</Button></>}>
      {step === 1 && (
        <>
          <DialogSection title={`未解決のトラブル報告 ${open.length}件（まとめて解決します）`} note="報告の内容は「トラブル」タブで見られます。" />
          <div className="mdl-b">
            <div className="trs-sum">
              {open.map((t, i) => <span key={i}>{i + 1}. <b>{t.kind}</b>（アプリ：{t.raw}）・ {t.who} {t.at} ・ {t.child && t.child !== '—' && !t.child.startsWith('—') ? '自動子 ' + t.child : t.note}</span>)}
            </div>
            {needKind && (
              <div className="es-formgrid">
                <Select label={`報告${open.findIndex((t) => t.kind === '種別未定') + 1}の種別`} req placeholder="選んでください" error={err.kind2} options={['数量相違（不足・過剰）', '誤配送']} value={kind2} onChange={setKind2} helper={`アプリの選択肢：${open.find((t) => t.kind === '種別未定')?.raw ?? ''}`} />
              </div>
            )}
          </div>
          <DialogSection title="対応を選ぶ" note="状態は、納品できた量で決まります。" />
          <div className="mdl-b" style={{ gap: '0.571429rem' }}>
            {RESOLVE_OPTS.map((o) => (
              <div key={o.v} className={'trs-opt' + (o.v === cur ? ' on' : '')}>
                <Radio name="rs" label={o.label} checked={o.v === cur} onChange={() => pick(o.v)} />
                <span className="note">{o.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <DialogSection title="選んだ対応" action={<Button variant="ghost" size="sm" onClick={() => setStep(1)}>対応を選び直す</Button>} />
          <div className="mdl-b"><div className="trs-pick"><b>{sel.label}</b><span className="note">{sel.desc}</span></div></div>
          {(cur === 'full' || cur === 'partial' || cur === 'partial_no_resend') && (
            <>
              <DialogSection title="商品ごとの数量" />
              <div className="mdl-b">
                <div className="es-table-wrap">
                  <table className="es-table compact">
                    <thead><tr><th>商品名</th><th className="r">確定</th><th>納品できた数</th>{cur === 'full' && <th>代替元（代替品のとき）</th>}{cur === 'partial' && <th className="r">送り直す数</th>}</tr></thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={p.n + cur}>
                          <td>{p.n}</td><td className="r es-num">{p.f}</td><td>{qtyInput(i)}</td>
                          {cur === 'full' && <td><span className="muted">—</span></td>}
                          {cur === 'partial' && <td className="r es-num">{p.f - got(i)}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {hasChild && (
            <>
              <DialogSection title="送り直す子" note="自動子を使い回します（1配送に子は1件まで）。" />
              <div className="mdl-b">
                <div className="es-formgrid">
                  <TextField label="子の配送No" value={r.autoChild ?? `${r.id}-1`} readOnly />
                  <TextField label="子の種類" value={cur === 'partial' ? `分納・残り ${resend}食` : `再配送・全量 ${total}食`} readOnly />
                  <TextField date label="仮の納品日" icon="CalendarBlank" value={childDate} onChange={setChildDate} />
                </div>
              </div>
            </>
          )}
          <DialogSection title={hasFreight ? '運賃・理由' : '理由'} />
          <div className="mdl-b">
            {hasFreight && <div className="es-formgrid"><Select label="運賃" options={['請求しない', '請求する']} value={freight} onChange={setFreight} helper="「請求する」は理由必須" /></div>}
            <TextField label="理由" req placeholder="例：拠点が不在のため全量を持ち戻り。再配送することを拠点と合意" value={reason} onChange={setReason} error={err.reason} />
            <InlineMessage tone="info">{sel.result}</InlineMessage>
          </div>
        </>
      )}
    </Dialog>
  );
}

/** 変更申請の確認（DD-20260916-0001：希望日・別日・否認） */
export function CrProcessModal({ r, onClose }: P) {
  const { toast, toastError } = useOps();
  const router = useRouter();
  const { data } = useQuery(api, 'crProcess', { id: r.crOpenId });
  const [pick, setPick] = useState('a1');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<Errors>({});
  const [fold, setFold] = useState({ base: false, want: false, alt: false });
  const id = r.crOpenId ?? '';
  const run = async (decision: 'approve' | 'reject') => {
    const e = checkCrProcess({ decision, pick, reason });
    setErr(e);
    if (Object.keys(e).length) return;
    try {
      const out = await api.action('processChangeRequest', { id, decision, pick, reason });
      onClose();
      toast(out.msg);
      if (decision === 'approve') router.push('/ops/delivery/schedule?view=month&d=2026-11');
    } catch (x) { toastError(x); }
  };
  const foldBtn = (k: keyof typeof fold) => <Button variant="ghost" tone="neutral" size="sm" icon={fold[k] ? 'CaretDown' : 'CaretUp'} aria-label={fold[k] ? '開く' : '折りたたむ'} onClick={() => setFold({ ...fold, [k]: !fold[k] })} />;
  type Row = NonNullable<typeof data>['want'][number];
  const rows = (list: Row[]) => list.map((x) => (
    <tr key={x.v} className={pick === x.v ? 'sel' : x.dis ? 'dis' : ''}>
      <td><Radio name="pick" checked={pick === x.v} disabled={x.dis} onChange={() => setPick(x.v)} ariaLabel={x.d} /></td><td>{x.no}</td>
      <td className={'es-num ' + x.dC}>{x.d}</td><td>{x.dc}</td><td className={'es-num ' + x.sC}>{x.s}</td><td>{x.sc}</td><td className={'es-num ' + x.lC}>{x.lt}</td><td className={'es-num ' + x.nC}>{x.n}</td>
    </tr>
  ));
  const thead = (first: string) => <thead><tr><th style={{ width: '3.428571rem' }}></th><th style={{ width: '3.428571rem' }}>No</th><th>{first}</th><th>納品日サイクル</th><th>出荷日</th><th>出荷日サイクル</th><th>リードタイム</th><th>出荷日の件数</th></tr></thead>;
  return (
    <Dialog m="ChangeRequestProcess" title="変更申請の確認" id={id} headExtra={<Badge tone="neutral">要再確認</Badge>} onClose={onClose}
      footer={<><Button variant="outline" tone="negative" size="lg" onClick={() => run('reject')}>否認する</Button><span style={{ flex: 1 }} /><Button size="lg" onClick={() => run('approve')}>選択した日で承認</Button></>}>
      <div className="mdl-b">
        <SectionTitle action={foldBtn('base')}>基本情報</SectionTitle>
        {!fold.base && (
          <>
            <div className="es-formgrid">
              <Field label="配送No"><div className="es-input es-input--md es-input--readonly"><Link className="es-mono" href={`/ops/delivery/list/${r.id}`} onClick={onClose}>{r.id}</Link></div></Field>
              <TextField label="温度帯" value={r.temp} readOnly />
              <TextField label="配送区分" value={r.svc} readOnly />
            </div>
            <div className="es-table-wrap">
              <table className="es-table compact">
                <thead><tr><th style={{ width: '3.428571rem' }}>No</th><th>出荷時点</th><th>配送会社</th><th>到着時点</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td><Link href="/ops/masters/warehouses">WH00001-関東倉庫</Link></td><td>ヤマト運輸</td><td><Link href="/ops/masters/warehouses">HU00124-ヤマト 品川営業所</Link></td></tr>
                  <tr><td>2</td><td>HU00124-ヤマト 品川営業所</td><td><Link href="/ops/masters/consignees">栄成ロジ（委託）</Link></td><td><Link href="/ops/contracts">CU00662-東和キッチンサービス ／ 大森工場</Link></td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        <SectionTitle action={foldBtn('want')}>変更後の納品日を選択</SectionTitle>
        {!fold.want && (
          <>
            <div className="es-formgrid">
              <TextField label="現在納品予定日" value="2026-11-18（水）" readOnly />
              <TextField label="出荷予定日" value="2026-11-16（月）" readOnly />
              <TextField label="リードタイム" value="2日" readOnly />
            </div>
            <div className="crp-2">
              <TextField label="申請日" value="2026-09-16" readOnly helper="山本 由紀（総務部 ・ 03-5555-0123）" />
              <TextField label="申請理由" value="月末棚卸しのため、当日の荷受けができません。" readOnly />
            </div>
            <div className="es-table-wrap"><table className="es-table compact">{thead('希望納品日')}<tbody>{rows(data?.want ?? [])}</tbody></table></div>
          </>
        )}
        <SectionTitle action={foldBtn('alt')}>別日を選択</SectionTitle>
        {!fold.alt && <div className="es-table-wrap"><table className="es-table compact">{thead('納品日')}<tbody>{rows(data?.alt ?? [])}</tbody></table></div>}
        <div className="note">別日は、今の納品日と同じサイクルの同じ前半（A・B週）から出しています。赤字＝契約のリードタイム（2日）を超える・出荷不可・件数の上限（300件）を超える。出荷不可の日は選べません。別日で承認すると、法人へ「別の日のご提案」として送り、法人の返事を待ちます（期限 10/15）。同じ拠点・同じ納品日の冷蔵 1件（CP0000330）も一緒に動きます。</div>
        <TextField label="理由（別日の提案・否認では必須。法人に表示）" placeholder="例）11/19 は出荷件数が上限を超えるため、11/20 をご提案します" value={reason} onChange={setReason} error={err.reason ?? err.pick} />
      </div>
    </Dialog>
  );
}

