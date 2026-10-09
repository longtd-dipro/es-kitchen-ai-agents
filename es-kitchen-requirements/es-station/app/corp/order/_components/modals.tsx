'use client';

import { useState, type ReactNode } from 'react';
import { capTxt, coldDl, frozDl, fmtD, isStd, orderTo, prods, SURVEY_RULE, sumBy, ym, type Check } from '@/lib/corp/order/logic';
import type { CSite, LogRow, Pref, ProdX, Qty, Survey } from '@/lib/corp/order/types';
import { toIso, fromIso } from '@/lib/supplier/dates';
import { Badge, Button, CheckList, Checkbox, Dialog, DialogSection, EmptyState, Field, Ro, Switch, Table, Td, TempTag } from './es';
import { DlLabel, Tags } from './parts';
import { prodImg } from './photo';
import { ZoomImage } from '../../_ui/ImageViewer';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

const foot = (...b: ReactNode[]) => <div style={{ display: 'flex', gap: '0.857143rem' }}>{b}</div>;

/** 登録できない（条件のチェック） */
export function NgDialog({ cs, onClose }: { cs: Check[]; onClose: () => void }) {
  return (
    <Dialog title="登録できません" width={640} onClose={onClose} footer={<Button onClick={onClose}>注文画面に戻る</Button>}>
      <div className="od-dlg"><p>次の条件を満たすように数をお直しください。合計は月のお届け数と同じにし、便ごとの数は差が1個以内になるように分けてください。</p><CheckList items={cs} /></div>
    </Dialog>
  );
}

/** メニュー詳細 */
export function MenuDetail({ p, onClose }: { p: ProdX; onClose: () => void }) {
  const st = Math.round(Number(p.rating));
  const stars = (n: number) => { const a: ReactNode[] = []; for (let i = 0; i < 5; i++) a.push(i < n ? '★' : <i key={i}>★</i>); return <span className="od-stars">{a}</span>; };
  return (
    <Dialog title="メニュー詳細" width={1040} onClose={onClose}>
      <div className="od-md">
        <div className="od-md__l">
          <div className="od-md__img"><ZoomImage src={prodImg(p)} alt={p.name} title={p.name} /></div>
          <h3>{p.name}</h3>
          {p.nameEn ? <div className="od-small">{p.nameEn}</div> : null}
          <div className="od-md__price"><Tags p={p} /><TempTag kind={p.keep} />{p.vmL ? <Badge tone="neutral" outline={false}>{'自販機：' + p.vmL}</Badge> : null}<b>{'定価（税込） ' + p.price + '円'}</b></div>
          <p>{p.desc}</p>
          <div className="od-box"><h4>アレルゲン情報</h4>
            <div className="od-alg"><em>特定原材料</em>{p.alg.length ? p.alg.map((a) => <span key={a}>{a}</span>) : <span className="sub">なし</span>}</div>
            <div className="od-alg"><em>特定原材料に準ずるもの</em>{p.alg2.map((a) => <span key={a} className="sub">{a}</span>)}</div>
          </div>
          <div className="od-g2"><Ro label="製造元" v={p.maker} /><Ro label="カテゴリ" v={p.cat} /></div>
        </div>
        <div className="od-md__r">
          <div className="od-box"><h4>短消費期限</h4><div className="od-muted">{p.exp ? '短消費期限：' + p.exp : '短消費期限の商品ではありません'}{p.life ? `（賞味期限・消費期限：お届け日から ${p.life}）` : ''}</div></div>
          <div className="od-box"><h4>栄養成分情報</h4>
            <div className="od-kv">エネルギー<b>{p.nut.kcal + 'kcal（' + p.nut.g + 'g）'}</b>脂質<b>{p.nut.fat + 'g'}</b>たんぱく質<b>{p.nut.pro + 'g'}</b>食塩相当量<b>{p.nut.salt + 'g'}</b>炭水化物<b>{p.nut.carb + 'g'}</b>内容量<b>{p.nut.g + 'g'}</b></div>
          </div>
          <div className="od-box"><h4>原材料</h4><div className="od-small">添加物</div><div className="od-muted">{p.add}</div><div className="od-small">原材料名</div><div className="od-muted">{p.raw}</div></div>
          <div className="od-box"><h4>商品レビュー</h4>
            <div>{stars(st)}<span className="od-muted" style={{ marginLeft: '0.571429rem' }}>{p.rating + '（' + p.reviews + '件）'}</span></div>
            {['美味しい・ボリューム満点・ご飯に合う', '美味しい・また食べたい', 'ボリューム満点・温めやすい'].map((c, i) => (
              <div key={i} className="od-rv"><span className="es-avatar">U</span>
                <div className="od-rv__b"><b>ニックネーム</b><span>{'2026/09/' + (20 - i * 3) + ' 12:1' + i}</span><div className="od-chips">{c.split('・').map((x) => <span key={x}>{x}</span>)}</div></div>
                {stars(5 - (i === 2 ? 1 : 0))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

/** 統計（指標一覧）。金額は出さない（2026/07/28 決定） */
export function Stats({ s, P, q, cats, cycL, onClose }: { s: CSite; P: ProdX[]; q: Qty; cats: string[]; cycL: string; onClose: () => void }) {
  const t = sumBy(s, P, q), ps = prods(s, P, true);
  const rows = cats.map((c) => {
    const cp = ps.filter((p) => p.cat === c), by: Record<string, number> = {}; let n = 0;
    s.dl.forEach((d) => { by[d.k] = 0; });
    cp.forEach((p) => { let any = 0; Object.keys(q[p.id] || {}).forEach((k) => { by[k] += q[p.id][k]; any += q[p.id][k]; }); if (any) n++; });
    return { c, n, by };
  }).filter((r) => ps.some((p) => p.cat === r.c));
  return (
    <Dialog title="指標一覧" id={s.short + '・' + cycL} width={820} onClose={onClose} footerNote="※ 品：商品の数　※ 個：注文の数" footer={<Button variant="outline" onClick={onClose}>閉じる</Button>}>
      <div className="od-dlg">
        <div className="od-kpis">
          <div className="od-kpi"><span>プラン</span><span className="big">{s.plan}</span><span>{s.planId + '（' + s.course + '）・冷蔵 ' + coldDl(s).length + '回' + (frozDl(s).length ? '・冷凍 ' + frozDl(s).length + '回' : '')}</span></div>
          <div className="od-kpi">
            <div className="row"><span>合計</span><b>{t.total + ' / ' + s.plan + '個'}</b></div>
            <div className="row"><span>冷蔵・常温</span><b>{t.cold + '個（' + capTxt(s.cap.chilled) + '）'}</b></div>
            {isStd(s) ? <div className="row"><span>冷凍</span><b>{t.frozen + '個（' + capTxt(s.cap.frozen!) + '）'}</b></div> : null}
          </div>
          <div className="od-kpi">
            <div className="row"><span>注文する商品</span><b>{t.items + '品'}</b></div>
            {s.dl.map((d) => <div key={d.k} className="row"><DlLabel d={d} withDate /><b>{t.byDl[d.k] + '個'}</b></div>)}
          </div>
        </div>
        <DialogSection title="カテゴリ別の注文数" note={'合計 ' + t.total + '個'} />
        <Table cols={[{ label: 'カテゴリ' }, { label: '品数', cls: 'r' }, ...s.dl.map((d) => ({ label: <DlLabel d={d} />, cls: 'r' })), { label: '計', cls: 'r' }]}
          rows={rows.map((r) => {
            let sm = 0;
            return <tr key={r.c}><Td v={r.c} /><Td v={r.n + '品'} cls="r" />{s.dl.map((d) => { sm += r.by[d.k]; return <Td key={d.k} v={r.by[d.k] + '個'} cls="r" />; })}<Td v={sm + '個'} cls="r" /></tr>;
          }).concat([<tr key="sum" className="att"><Td v={<b>計</b>} /><Td v={t.items + '品'} cls="r" />{s.dl.map((d) => <Td key={d.k} v={<b>{t.byDl[d.k] + '個'}</b>} cls="r" />)}<Td v={<b>{t.total + '個'}</b>} cls="r" /></tr>])} />
        <p className="note">金額はここには出しません（2026-07-28 決定）。</p>
      </div>
    </Dialog>
  );
}

/** 変更履歴の表と注記（P-HIST の列。モーダルと画面内のタブで同じ） */
export function LogTable({ list }: { list: LogRow[] }) {
  const why = list.some((r) => r.why);
  return (
    <>
      {list.length
        ? <Table cls="od-log" cols={[{ label: '日時', w: 150 }, { label: '変更した人' }, { label: '操作' }, { label: '項目' }, { label: '変更前' }, { label: '変更後' }, ...(why ? [{ label: '理由' }] : [])]}
          rows={list.map((r, i) => (
            <tr key={i}>
              <Td v={r.at} cls="es-num" /><Td v={r.who} />
              <td>{r.who.indexOf('ESキッチン') >= 0 || r.who.indexOf('（運営）') >= 0 ? <Badge tone="warning">{r.what}</Badge> : r.what}</td>
              <Td v={r.item ?? ''} /><Td v={r.before ?? '—'} /><td className="w">{r.after ?? r.detail}</td>
              {why ? <td className="w">{r.why ?? ''}</td> : null}
            </tr>
          ))} />
        : <EmptyState title="表示するデータがありません。" compact />}
      <p className="note">締切後に ES が変更した分（代替品・欠品など）も残ります。ログインは共有のため、変更した人は アカウント名（選んだご担当者）で出します。</p>
    </>
  );
}

/**
 * 変更履歴の行（P-HIST の列：日時・変更した人・操作・項目・変更前・変更後・理由（あれば）。新しいものが上。B-2）。
 * 今のサイクルの月は今の履歴、過去の月は その月の履歴（なければ締切の確定の1行）。画面内のタブ「変更履歴」の LogTable に渡す（版 1.1・受付簿 No.157：モーダルをやめてタブにした）
 */
export function logListOf({ m, cyc, cur, past, pastSt }: { m?: string; cyc: string; cur: LogRow[]; past?: Record<string, LogRow[]>; pastSt?: Record<string, string> }): LogRow[] {
  return m && m !== cyc
    ? (past?.[m] || [{ at: fmtD(orderTo(m)) + ' 23:59', who: 'システム', what: 'ご注文・変更の締切', detail: '', item: '確定', before: '—', after: pastSt?.[m] === 'デフォルト' ? '登録がなかったため、自動注文（基準数）で確定' : '登録内容で確定' }])
    : cur;
}

/** 注文の設定 */
export function PrefDialog({ s, P, cats, pref, next, onClose, onSave }: { s: CSite; P: ProdX[]; cats: string[]; pref: Pref; next: boolean; onClose: () => void; onSave: (p: Pref & { next: boolean }) => void | Promise<void> }) {
  const [m, setM] = useState({ ...pref, next });
  /* 保存中は「保存」を押せない（二重に保存しない） */
  const [busy, setBusy] = useState(false);
  const save = async () => { if (busy) return; setBusy(true); try { await onSave(m); } finally { setBusy(false); } };
  const mu = (p: Partial<typeof m>) => setM((o) => ({ ...o, ...p }));
  return (
    <Dialog title={'注文の設定（' + s.short + '）'} width={680} onClose={onClose} footer={foot(<Button key="c" variant="outline" onClick={onClose}>キャンセル</Button>, <Button key="s" disabled={busy} onClick={save}>保存</Button>)}>
      <div className="od-dlg od-prefdlg">
        <p className="note">この拠点の自動注文（ESキッチンの標準の数量。締切までに登録がないと、この数で注文されます）と AI（自動提案）に使う設定です。翌月以降もそのまま続きます。今月の数を作り直すときは「AI（自動提案）で注文」を使ってください。</p>
        <h4>カテゴリ（OFF のカテゴリは0個にします）</h4>
        <div className="od-cats">{cats.map((c) => <label key={c}><Checkbox label={c} checked={m.cats.includes(c)} onChange={(on) => mu({ cats: on ? m.cats.concat([c]) : m.cats.filter((x) => x !== c) })} /></label>)}</div>
        {/* REQ-CT-300（2026/10/02）：基準数のパターンは契約の時に決め、変更は ESキッチンだけ。ここでは見るだけ */}
        <div className="od-togrow"><span>消費期限の短い商品（サラダなど）<small>「含めない」の拠点は、消費期限の短い商品を自動注文・AI（自動提案）に入れません。ご契約の時に決めた設定です。変更はESキッチンへご依頼ください。</small></span><Badge tone={m.short ? 'neutral' : 'info'}>{m.short ? '含める' : '含めない'}</Badge></div>
        <h4>商品の金額</h4>
        <div className="od-cats">{[100, 200].map((y) => <label key={y}><Checkbox label={y + '円の商品'} checked={m.price.includes(y)} onChange={(on) => mu({ price: on ? m.price.concat([y]) : m.price.filter((x) => x !== y) })} /></label>)}</div>
        <h4>対象外の商品（毎月0個にします）</h4>
        <div className="od-cats od-exs">{P.map((p) => <label key={p.id}><Checkbox label={p.name} checked={m.ex.includes(p.id)} onChange={(on) => mu({ ex: on ? m.ex.concat([p.id]) : m.ex.filter((x) => x !== p.id) })} /></label>)}</div>
        <div className="od-togrow"><span>次回以降も適用（AI（自動提案）の結果を下書きに入れる）<small>ON：ご注文の受付開始日に、新しいメニューで AI（自動提案）（この設定・過去の注文・廃棄率（捨てた数 ÷（前回の在庫 ＋ 届いた数））・在庫）を作って下書きに入れます。OFF：ESキッチンの標準数にこの設定をかけた数です。</small></span><Switch checked={m.next} onChange={(v) => mu({ next: v })} /></div>
      </div>
    </Dialog>
  );
}

/** AI の提案で注文（方法を選ぶ） */
export function AiPick({ onClose, onPick }: { onClose: () => void; onPick: (mode: 'even' | 'past' | 'chat') => void }) {
  const [mode, setMode] = useState<'even' | 'past' | 'chat'>('even');
  const opts: ['even' | 'past' | 'chat', string, string][] = [['even', '均等配分', '契約の数（プラン数）に合わせて、選んだカテゴリの商品へ均等に配分します。'],
    ['past', '過去データを参照', '過去の注文実績と廃棄率（捨てた数 ÷（前回の在庫 ＋ 届いた数））をもとに、AI（自動提案）が数を提案します。'],
    ['chat', 'チャットで AI に指示', '「サラダはなしで、肉を多めに」のように話しながら数を決めます。']];
  return (
    <Dialog title="AI（自動提案）で注文" width={560} onClose={onClose} footer={foot(<Button key="c" variant="outline" onClick={onClose}>キャンセル</Button>, <Button key="o" onClick={() => onPick(mode)}>選択</Button>)}>
      <div className="od-dlg">
        {opts.map((o) => (
          <button key={o[0]} type="button" className={'od-opt' + (mode === o[0] ? ' is-on' : '')} onClick={() => setMode(o[0])}>
            <span className="es-radio__dot" aria-hidden /><span><b>{o[1]}</b>{o[2]}</span>
          </button>
        ))}
        <p className="note">提案はプレビューで確かめてから「確定」で注文画面に反映します。反映しただけでは登録されません。</p>
      </div>
    </Dialog>
  );
}

/** アンケート開始（締切は必須・既定値なし） */
export function SurveyStart({ from, to, onClose, onStart }: { from: string; to: string; onClose: () => void; onStart: (due: string) => void | Promise<void> }) {
  const [due, setDue] = useState('');
  /* 開始中は「案内を開始」を押せない（二重に開始しない） */
  const [busy, setBusy] = useState(false);
  const start = async () => { if (busy || !due) return; setBusy(true); try { await onStart(fromIso(due)); } finally { setBusy(false); } };
  return (
    <Dialog title="アンケート開始" width={520} onClose={onClose} footer={foot(<Button key="c" variant="outline" onClick={onClose}>キャンセル</Button>, <Button key="s" disabled={!due || busy} onClick={start}>案内を開始</Button>)}>
      <div className="od-dlg">
        <p>従業員アンケートを開始しますか？ <b>プロフィールで拠点IDを設定している従業員</b>にだけ、アプリで案内を送ります（ゲスト・Web版の未ログインの方には届きません）。</p>
        <Field label="アンケートの締切日" required helper={'受付期間の終わり（' + fmtDate(to) + '）までの日を選んでください。'}>
          <div className="es-input es-input--md"><DateInput fill min={toIso(from)} max={toIso(to)} value={due} onChange={(e) => setDue(e.target.value)} /></div>
        </Field>
        <p className="note">従業員は「気になる」「食べたい」で、1人15品まで選べます。結果は商品の横に点数で出ますが、注文数には自動で入りません。参考にしてください。</p>
      </div>
    </Dialog>
  );
}
/** アンケート（回答中） */
export function SurveyDialog({ s, P, sv, onClose }: { s: CSite; P: ProdX[]; sv: Survey; onClose: () => void }) {
  const top = prods(s, P).slice().sort((a, b) => (b.like * 2 + b.cur) - (a.like * 2 + a.cur)).slice(0, 5), ans = top.length ? 41 : 0;
  return (
    <Dialog title="アンケート" id={s.short} width={680} onClose={onClose} footer={<Button onClick={onClose}>閉じる</Button>}>
      <div className="od-dlg">
        <div className="od-g2"><Ro label="状態" v="回答中" /><Ro label="締切日" v={sv.due} /><Ro label="回答した人" v={ans + '人 ／ 案内した人 ' + sv.N + '人'} /><Ro label="点数の出し方" v={SURVEY_RULE} /></div>
        <DialogSection title="点数の高い商品（上位5品）" />
        <Table cols={[{ label: '順位', w: 56 }, { label: '商品名' }, { label: '食べたい', cls: 'r' }, { label: '気になる', cls: 'r' }, { label: '点数', cls: 'r' }]}
          rows={top.map((p, i) => <tr key={p.id}><Td v={i + 1} /><Td v={p.name} /><Td v={p.like + '人'} cls="r" /><Td v={p.cur + '人'} cls="r" /><Td v={(p.like * 2 + p.cur) + '点'} cls="r" /></tr>)} />
        <p className="note">結果は注文数に自動で入りません。注文画面の各商品にも点数が出ています。締切を過ぎると集計が確定します。</p>
      </div>
    </Dialog>
  );
}

/** デモのときだけ：このデモについて（月次注文） */
export function About({ cycL, from, to, today, onClose }: { cycL: string; from: string; to: string; today: string; onClose: () => void }) {
  const row = (a: string, b: string) => <tr key={a}><Td v={a} /><td className="w">{b}</td></tr>;
  return (
    <Dialog title="このデモについて（月次注文）" width={940} onClose={onClose}>
      <div className="od-dlg od-about">
        <p>{'法人Webの「月次注文」（商品注文・資材注文・注文履歴）です。2026-09-30 に受け取った現行デザイン（00_確認してほしい/法人オーダー/）の中身を、ES Kitchen（company-admin テーマ）の部品で組み直しました。データは拠点管理デモと同じ 株式会社サンプル（本社・大阪支店・名古屋営業所）＋自販機の例の横浜営業所、対象は ' + cycL + '分（受付 ' + fmtDate(from) + '〜' + fmtDate(to) + '）。デモの「今日」は ' + fmtDate(today) + '（受付中）です。'}</p>
        <DialogSection title="画面とできること" />
        <Table cols={[{ label: '画面', w: 200 }, { label: 'できること' }]} rows={[
          row('商品注文', '拠点タブ（拠点名＋ご注文の状態）。カード表示／一覧表示、検索（商品名・詳細・原材料・アレルゲン／カテゴリ／保存方法／商品タグ／短消費期限なし）。合計と便ごとの数を上に常に表示し、目安とずれた便は赤。チェックした商品に「注文内容をクリア」「第1便をコピー」「配送ごとの数量／合計を振り分け」。登録で条件を確認し、NG なら理由を表示'),
          row('ESライト（自販機）の拠点（横浜営業所）', '枠（ダブル／シングル／ベルト／自販機に入らない商品）ごとの開閉式。各枠に最大格納数（目安）と便ごとの合計。自販機の商品が1回の配送で50個を超えると注意（登録は止めない）。レイアウト（枠の数・配置）は出さない'),
          row('AI（自動提案）で注文', '「均等配分」「過去データを参照」「チャットで AI に指示」。条件（カテゴリ・短消費期限・金額）で提案 → プレビュー → 「確定」で注文画面に反映（まだ登録されない）。チャットは左がチャット、右がプレビュー（隠せる）'),
          row('アンケート', '締切日（必須・既定値なし）を入れて「案内を開始」。開始後は商品に点数（食べたい・気になる）が出る。注文数には入らない'),
          row('統計／メニュー詳細／変更履歴', '統計はカテゴリ別・便ごとの数（金額は出さない）。メニュー詳細は写真・タグ・定価・説明・アレルゲン・短消費期限・栄養成分・原材料・レビュー。変更履歴は 締切後の ES の変更も出す'),
          row('登録のあと', 'トースト「ご注文を登録しました。」と、画面の上の案内「資材のご注文もできます」（リンクで資材注文へ）'),
          row('資材注文', '1回配送・検索なし。コースで使う資材だけ出す'),
          row('注文履歴', 'メニューID・対象年月・拠点名・ご注文の受付開始日・締切日・自販機・メニューPDF・ご注文の状態・納品書（月・拠点ごと）。受付中の月は鉛筆で商品注文へ、締切後は目のアイコンで詳細（商品・資材・変更履歴）へ'),
        ]} />
        <DialogSection title="プラン・契約の仕様に合わせたところ（2026-09-30・01_仕様/月次注文デモ_プラン契約との差分_20260930.md）" />
        <ol className="od-ol">
          <li>数の判定はご契約に固めた月次提供数で行う：合計＝プラン数、温度帯ごとに 下限〜上限（100プラン ESスタンダード＝冷凍 1〜20・冷蔵・常温 0〜80）。「冷凍はプラン数の30%」はやめた（冷凍の割合は持たない・28-155）</li>
          <li>便の数と日付は月ごとのご契約のお届けスケジュール（冷蔵配送・冷凍配送ごとの回数と曜日）から。本社は 冷蔵2回・冷凍2回（冷凍の標準のお届け回数は仮置き）、大阪支店は ES配送便 2回（標準1回＋お届け回数追加）。11月分は A1＝11/9。大阪支店の日付は配送デモと同じ 11/10・11/24</li>
          <li>便ごとの差±1は温度帯ごとに判定</li>
          <li>自販機の枠の画面は コース＝ESライト（自販機）の拠点だけ（28-184）。自販機の例は本社（CU00643・100プラン ESライト（自販機）・ES配送便）。横浜営業所（CU00950）は ESスタンダード 100・COOL便（冷凍の見本）。お試しの例は別の法人（株式会社みちのく商事 仙台本社 CU00975・参照のみ。権限「お試しの法人」で見る）。自販機に入らない商品も出して注文できる</li>
          <li>プランの表記を「ES000004 100プラン（ESスタンダード）」の形に。コースは ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機）</li>
          <li>自動注文＝ESキッチンの標準数（基本50個あたり）× 基本比×倍（100プラン＝2倍・28-179）。AIモード（ON なら締切まで注文がないとき AI の数で確定）はご契約の設定として参照だけ出し、AI の画面の「次回からの数量」は外した</li>
          <li>資材のコース名を3コースに（ESライト（自販機）は ESライト（冷蔵庫）と同じ）</li>
        </ol>
        <DialogSection title="現行デザインから変えたところ" />
        <ol className="od-ol">
          <li>統計（指標一覧）から金額を外した（2026-07-28 決定）</li>
          <li>AI の選択肢の名前を決定どおり「均等配分」「過去データを参照」「チャットで AI に指示」に。AI 画面の右上は「確定（注文画面に反映）」（登録はお客様が注文画面で押す・暫定）</li>
          <li>拠点タブの「中止」は「休止中」に（休止は ES 側だけ）</li>
          <li>自販機の枠の見出しから枠の数を外した（レイアウトは顧客画面に出さない）</li>
          <li>カテゴリを商品カテゴリマスタの7つにそろえた：肉・魚・惣菜・主食・汁物・サラダ・果物・飲料・甘味（並びは表示順。2026-10-05 hong 決定。最終の名前は「サラダ・果物」「飲料・甘味」：2026-10-06 客先確認）</li>
        </ol>
        <DialogSection title="確認したいこと" />
        <ol className="od-ol">
          <li>【冷凍と冷蔵の配分は上限・下限の範囲で自由（2026-09-30 hong）】ただし今のプランマスタの値（100プラン：冷凍 上限20＋冷蔵・常温 上限80＝合計100、保存時のチェック 28-178①）では、合計100にすると必ず 冷凍20／冷蔵80 になり動かせない。上限の合計が合計より大きくなるように、28-178① を「上限の合計 ≧ 月次提供上限の合計」に変える（例：冷蔵・常温の上限を 99 に）必要がある</li>
          <li>自販機に入らない商品の受け取り方（ESライト（自販機）の拠点には冷蔵庫がない）</li>
          <li>AIモードをどこで持つか（月ごとのご契約／拠点）・法人Webで変えられるか</li>
          <li>画面名（「商品注文」のままか）／ES が登録したときの表記（ES登録済）</li>
          <li>アンケートの点数の出し方（デモは 食べたい 2点・気になる 1点）</li>
          <li>自販機の「1回の配送で最大50個」は超えたら登録不可にするか（デモは注意だけ）</li>
        </ol>
      </div>
    </Dialog>
  );
}

