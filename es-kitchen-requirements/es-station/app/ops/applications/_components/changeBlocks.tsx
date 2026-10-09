'use client';

import { PAUSE_MAX } from '@/lib/ops/applications/constants';
import { RE_NG_DAYS } from '@/lib/domain/terms';
import { isStockReturn } from '@/lib/domain/cxlStock';
import { cxlInfo, cxlWhy, isSizeUp, kindImpact, pauseInfo, ymd } from '@/lib/ops/applications/logic';
import type { ChangeApp, ChangeBranch } from '@/lib/ops/applications/types';
import Link from 'next/link';
import billing from '@/lib/domain/areas/billing';
import { domainApi } from '@/lib/domain/client';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Badge, Btn, Inline, Table } from './ds';

const lockedApi = domainApi(billing);
import { fmtDate, fmtDatesIn, fmtYm } from '@/lib/format/date';

/*
 * 申請詳細（変更申請）の中のブロック。元：approve.js の pauseBlock・cxlBlock・billedBlock・noticeBlock・custMailBlock・noteBlocks など。
 * 申請詳細の「影響と設定」と、承認ダイアログの両方で使う
 */

/** 承認すると動くもの（影響） */
export function ImpactTable({ b, cls }: { b: ChangeBranch; cls?: string }) {
  return (
    <Table cls={cls} head={['項目', '内容', 'いつ']}>
      {b.impacts.map((x, k) => <tr key={k}><td><b>{x[0]}</b></td><td>{fmtDatesIn(x[1])}</td><td className="apx-when">{fmtDatesIn(x[2])}</td></tr>)}
    </Table>
  );
}

/** 休止の通算（上限は通算1年） */
export function PauseBlock({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  const P = pauseInfo(a, b);
  if (!P) return null;
  return (
    <>
      <div className="secttl">休止の通算（上限は通算1年）</div>
      <Table cls="apx-imp" head={['休止の履歴', { t: '月数', align: 'right' }]}>
        {P.hist.length ? P.hist.map((h, k) => <tr key={k}><td>{fmtDatesIn(h[0])}</td><td style={{ textAlign: 'right' }}>{h[1]}ヶ月</td></tr>)
          : <tr><td className="mut" colSpan={2}>過去の休止はありません</td></tr>}
        <tr><td><b>通算の休止月数（過去の休止の累計）</b></td><td style={{ textAlign: 'right' }}><b>{P.past}ヶ月</b></td></tr>
        <tr><td>今回の休止（再開予定月 {fmtDatesIn(P.resume) || '未入力'}）</td><td style={{ textAlign: 'right' }}>{P.cur}ヶ月</td></tr>
        <tr className="tot"><td>通算（承認後）／上限</td><td style={{ textAlign: 'right' }}><b>{P.total}ヶ月</b> ／ {PAUSE_MAX}ヶ月</td></tr>
        <tr><td><b>残り月数</b>（承認前）</td><td style={{ textAlign: 'right' }}><b>{P.left0}ヶ月</b></td></tr>
        <tr><td><b>残り月数</b>（今回を承認したあと）</td><td style={{ textAlign: 'right' }}><b style={{ color: P.left1 < 0 ? 'var(--red,#CF222E)' : 'inherit' }}>{P.left1}ヶ月</b></td></tr>
      </Table>
      {P.over
        ? <Inline tone="negative">通算の休止が上限の12ヶ月を超えるため、この申請は承認できません。お客様へは「もう使わない」ということなので、解約をご案内してください（ご確認 E）。</Inline>
        : <Inline tone="info">通算 {P.total}ヶ月・残り {P.left1}ヶ月。上限（通算1年）の範囲内です。再開予定月は必須で、「未定」は選べません。</Inline>}
    </>
  );
}

/** 解約日の判定 */
export function CxlBlock({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  const C = cxlInfo(a, b);
  if (!C) return null;
  const R = C.R;
  return (
    <>
      <div className="secttl">解約日の判定</div>
      <Table cls="apx-imp" head={['項目', '内容']}>
        <tr><td>申込日</td><td>{fmtDate(R.date)}</td></tr>
        <tr><td>判定に使うオーダー締切</td><td>{fmtDate(R.close)}（{fmtYm(R.closeFor.t)}サイクル分・既定は前月15日）　→　<b>締切{R.before ? '前（オーダー期間中）の申込：翌月から適用' : '後の申込：翌々月から適用'}</b></td></tr>
        <tr><td>適用月（最短）</td><td><b>{fmtYm(R.apply.t)}サイクル</b>（利用しなくなる最初のサイクル月）</td></tr>
        <tr><td>解約日（最短）</td><td><b>{fmtDate(R.end)}</b>（{fmtYm(R.last.t)}サイクルの末日）</td></tr>
        {C.want && C.wantEnd && C.wantApply && (
          <tr className="tot"><td>この申請の解約日</td><td><b>{fmtDate(C.wantEnd)}</b>（{fmtYm(C.want.t)}サイクルの末日・適用月 {fmtYm(C.wantApply.t)}サイクル）　{C.ok ? <Badge tone="success">ルールに合う</Badge> : <Badge tone="negative">ルールに合わない</Badge>}</td></tr>
        )}
      </Table>
      {C.ok
        ? <Inline tone="info">解約日はサイクルの終わり（日割りなし）。最短の解約日以降なら承認できます。自販機の拠点も同じ締切です（自販機だけ早める締切はありません）。</Inline>
        : <Inline tone="negative">{cxlWhy(a, b)} 却下して、{fmtDate(R.end)} 以降の解約日でお申し込みいただくようご案内してください。</Inline>}
    </>
  );
}
/** 拠点ごとの承認の表の1行に出す解約日 */
export function CxlMini({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  const C = cxlInfo(a, b);
  if (!C || !C.want || !C.wantEnd) return null;
  return <div className="mm">解約日 {fmtDate(C.wantEnd)}（最短 {fmtDate(C.R.end)}・締切 {fmtDate(C.R.close)} の{C.R.before ? '前' : '後'}の申込）{!C.ok && <> <b style={{ color: 'var(--red,#CF222E)' }}>ルールに合わない</b></>}</div>;
}

/** RV-OPS-20261002 O-l（TL-7）：請求済みの月にかかる差額。承認時に調整明細を自動で作り、次の請求書に1行ずつ載せる */
export function BilledBlock({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  if (a.kind === '法人情報の変更') return null;
  const B = b.billed;
  if (B?.err) return <><div className="secttl">請求済みの月にかかる差額</div><Inline tone="negative">試算できませんでした：{B.err}</Inline></>;
  if (!B || !B.rows || !B.rows.length) return <><div className="secttl">請求済みの月にかかる差額</div><p className="mm">{B?.done ? '調整明細は作っていません（請求済みの月にかかる差額はありませんでした）。' : '請求済みの月はありません（調整明細は作りません）。'}</p></>;
  return (
    <>
      <div className="secttl">請求済みの月にかかる差額</div>
      {B.done
        ? <Inline tone="info"><b>調整明細 {B.rows.length}件・差額の合計 {B.total}</b>（{(B.ids ?? []).join('・')}）。次の請求書に1行ずつ載せます（運営の請求 ③ 調整に出ます）</Inline>
        : <Inline tone="warning"><b>請求済みの月 {B.rows.length}件・差額の合計 {B.total}</b>。承認すると調整明細を自動で作り、次の請求書で精算します（日割りなし・サイクル月ごとの満額の差）</Inline>}
      <Table head={['サイクル月', '請求書', { t: '請求した額（税抜）', align: 'right' }, { t: '変更後の額（税抜）', align: 'right' }, { t: '差額（税抜）', align: 'right' }]}>
        {B.rows.map((r, k) => <tr key={k}><td>{fmtDatesIn(r[0])}</td><td>{r[1]}</td><td className="r">{r[2]}</td><td className="r">{r[3]}</td><td className="r"><b>{r[4]}</b></td></tr>)}
      </Table>
    </>
  );
}

/**
 * 確定（まだ発行していない）の月はロックしたまま変えない（2026/10/03 決定）。承認の前は試算、承認のあとは反映待ちの一覧：
 * 請求の画面で確定解除 →「反映」（共通データの billing.reapplyLocked）。反映しないときは「反映しない」（請求調整で対応）
 */
export function LockedBlock({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  const { toast, toastError, account } = useOps();
  const canAct = useCanAct();
  const B = b.billed;
  const branchId = (b.ids.match(/CU\d+/) || [])[0];
  const pre = B?.locked ?? [], skips = (B?.skips ?? []).filter((x) => x.status === '反映待ち');
  if (a.kind === '法人情報の変更' || (!pre.length && !skips.length)) return null;
  const href = branchId ? `/ops/billing/confirm/sub/${branchId}` : '/ops/billing/confirm';
  const act = async (op: 'reapplyLocked' | 'dismissLocked', id: string) => {
    try { await lockedApi.action(op, { id, by: account?.id ?? 'Ad00003' }); toast(op === 'reapplyLocked' ? '反映しました' : '反映しないにしました'); } catch (e) { toastError(e); }
  };
  return (
    <>
      <div className="secttl">確定済みの月（ロック中）</div>
      {!B?.done
        ? <Inline tone="warning"><b>{pre.map(fmtYm).join('・')} サイクルは請求の画面で確定済み</b>のため、承認しても変えません（反映待ちに残ります）。直すときは <Link href={href}>請求の画面</Link> で確定解除してから「反映」してください。</Inline>
        : (
          <>
            <Inline tone="warning">確定済みのため変えていない月があります。<Link href={href}>請求の画面</Link> で確定解除してから「反映」してください（運営の TOP にも出ます）。</Inline>
            <Table head={['サイクル月', '請求の状態', '操作']}>
              {skips.map((x) => (
                <tr key={x.id}><td>{fmtYm(x.cycleMonth)}</td><td><Badge>{x.billStatus}</Badge></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {/* 権限がなければ出さない */}
                    {x.canApply ? (canAct(lockedApi, 'reapplyLocked') && <Btn size="sm" onClick={() => act('reapplyLocked', x.id)}>反映</Btn>) : <Link href={href}>確定解除へ</Link>}
                    {' '}{canAct(lockedApi, 'dismissLocked') && <Btn size="sm" variant="outline" onClick={() => act('dismissLocked', x.id)}>反映しない</Btn>}
                  </td></tr>
              ))}
            </Table>
          </>
        )}
    </>
  );
}

/** RV-OPS-20261002 O-m（TL-1）：承認するときの「変更前の値」と今の値の照合 */
export function BeforeCheckNote({ a }: { a: ChangeApp }) {
  if (a.kind === '法人情報の変更') return null;
  return <Inline tone="info">承認するとき、申請の「変更前の値」と今の子契約の値を比べます。違うときは<b>「変更前の値が今の値と違います（申請のときの値 → 今の値）。今の値を確かめてから承認してください」</b>と出して、承認を止めます。</Inline>;
}

/* ---------- メールの文面 ---------- */
const FROM = '【ESステーション】ESキッチン運営（no-reply@es-kitchen.co.jp）';
const SIGN = '※ 本メールにお心当たりがない場合は、本メールを破棄してください。\n※ 本メールは送信専用のため、返信できません。\n\n──────────────────────────\nESキッチンサポート窓口\nESキッチン株式会社\nカスタマーサクセスチーム\nE-mail：info@es-kitchen.co.jp';
function Mail({ from, to, sub, body }: { from: string; to: string; sub: string; body: string }) {
  return (
    <div className="apx-mail">
      <div className="mh"><b>送信元</b><span>{from}</span><b>宛先</b><span>{to}</span><b>件名</b><span>{sub}</span></div>
      <pre>{body}</pre>
    </div>
  );
}
/** 2026/10/01 R2：解約の承認で委託配送会社へ自動通知（REQ-CT-289）の文面例 */
function MailBox({ v, name, ids, company, last }: { v: { ship: string; carrier?: string }; name: string; ids: string; company: string; last: string }) {
  const ES = v.ship === 'ES配送便', to = v.carrier || (ES ? '（配送ルートの納品会社）' : 'ヤマト運輸');
  const sub = `【ESステーション】配送停止のお知らせ（${name}／${ids.split('／')[0].trim()}）`;
  const body = `${to}　ご担当者様\n\nいつもお世話になっております。ESキッチン運営です。\n下記の拠点のご契約が終了しますので、配送の停止をお知らせいたします。\n\n` +
    `■ 拠点名：${name}（${company}）／${ids}\n■ 最終配送日：${last || '（最後の納品日を入れるとここに入ります）'}\n` +
    `■ 以降の配送：停止します。最終配送日より後の納品予定はすべて削除済みで、配送データは作られません。\n\nよろしくお願いいたします。\n\n${SIGN}`;
  return <Mail from={FROM} to={`${to}（${ES ? '拠点の担当委託配送会社＝ES配送便の委託ドライバーが所属する会社' : '拠点の運送会社＝COOL便の配送を担当する会社'}）`} sub={sub} body={body} />;
}
/** 委託配送会社への通知（解約だけ） */
export function NoticeBlock({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  if (a.kind !== '解約') return null;
  const last = String(b.set?.last || '').replace(/-/g, '/'), ship = b.ship || 'ES配送便', ES = ship === 'ES配送便';
  const other = ES ? { ship: 'COOL便', carrier: 'ヤマト運輸' } : { ship: 'ES配送便', carrier: '栄成ロジ（委託）' };
  return (
    <>
      <div className="secttl">委託配送会社への通知（承認すると自動で送る）</div>
      <p className="mm" style={{ margin: '0 0 0.428571rem' }}><span className="apx-mailtag">この拠点：{ship}</span>配送区分で宛先が変わります。この拠点の文面例は次のとおりです（最終配送日は「承認の前にする設定」の「最後の納品日」が入ります）。</p>
      {/自社便/.test(b.carrier || '')
        ? <Inline tone="info"><b>この拠点は自社便だけのため、委託配送会社への通知はありません</b>（T3-2）。承認すると、社内の配送担当に画面のお知らせ（配送停止・最終配送日）を出します。</Inline>
        : <MailBox v={{ ship, carrier: b.carrier }} name={b.name} ids={b.ids} company={a.company} last={last} />}
      <details className="apx-memo">
        <summary>宛先の書き分け（ES配送便の拠点／COOL便の拠点）</summary>
        <div className="pad">
          <Table head={['配送区分', '宛先', 'メモ']}>
            <tr><td><b>ES配送便</b>（委託ドライバー）</td><td>その拠点の配送ルート（子契約）に登録された納品会社（配送会社②）</td><td>自動で通知（T3-1）</td></tr>
            <tr><td><b>ES配送便</b>（自社便のみ）</td><td>委託配送会社はなし</td><td>メールは送らない。社内の配送担当に画面で知らせる（T3-2）</td></tr>
            <tr><td><b>COOL便</b></td><td>運送会社（配送ルートの運送会社。例：ヤマト運輸）</td><td>配送ルートの納品会社（運送会社）へ同じ文面を自動で送る（T3-1）</td></tr>
          </Table>
          <p className="mm" style={{ margin: '0.571429rem 0 0.285714rem' }}><span className="apx-mailtag">参考：{other.ship}の拠点の場合</span>宛先と宛先の説明だけが変わります。</p>
          <MailBox v={other} name={b.name} ids={b.ids} company={a.company} last={last} />
        </div>
      </details>
    </>
  );
}
/** 承認すると送るメール（お客様あて）の見本：Message List メール No.10（承認）・No.16（アカウント停止） */
function CustMailBlock({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  const rq = (l: string) => a.request.find((x) => x[0] === l)?.[1] ?? '—';
  const head = 'ESステーションをご利用いただきありがとうございます。\n以下のお申し込みを承認し、ご契約に反映いたしました。\n\n' +
    `■ 受付番号：${a.no}\n■ 拠点名：${b.name}（${a.company}）\n■ 内容：\n${a.request.map((r) => `　・${r[0]}：${r[1]}`).join('\n')}\n■ 反映するサイクル：${a.start}\n\n`;
  const extra = a.kind === '解約' ? `解約日は ${rq('解約をご希望の日')} です。最後のご請求は、解約の翌月の請求書1通です（最後の実績精算・違約金${isStockReturn(rq('残った商品（在庫）の扱い')) ? '' : '・残った商品の買取'}）。社員の方のアプリでのご購入は解約日までです（翌日からこの拠点は選べません）。残った商品は、お申し込みの内容（${rq('残った商品（在庫）の扱い')}）のとおり、${isStockReturn(rq('残った商品（在庫）の扱い')) ? 'ご返却いただきます（買取のご請求はありません。送料はお客様のご負担〈元払い〉です。返却のご案内は別途お送りします）' : 'ご契約の法人さまの買取になります'}。どちらの場合も、最後の棚卸報告をお願いいたします。ログインは最後のご請求の入金期限まで参照のみでご利用いただけ、その翌日に停止します。\n\n`
    : a.kind === '休止' ? `休止は ${rq('休止したい期間')} です。再開予定は ${rq('再開予定月')} です。休止中の月のプラン料金はかかりません。休止の始めの棚卸報告は任意です。報告いただいた場合は、それまでのご利用分を精算します（休止中は精算しません）。\n設備を置いたままの場合は、休止中も社員の方はアプリでご購入いただけます。休止中のご購入分は、再開時（再開せずにご解約の場合は解約時）の棚卸報告があれば精算します（再開時の報告も任意です）。\n設備の最低利用期間は、置いたままの設備は休止中は数えず、引き揚げた設備も、設置し直したときに休止前の残りを引き継ぎます（数え直しません。再設置費は自動ではかかりません）。\n\n`
      : a.kind === '再開' ? '休止中に設備を置いたままだった場合は、再開時の在庫の点検で休止中のご購入分を精算し、再開後の最初の請求書でご請求します。\n\n' : '';
  return (
    <details className="apx-memo">
      <summary>承認すると送るメール（お客様あて・Message List メール No.10{a.kind === '解約' ? '・No.16' : ''}）</summary>
      <div className="pad">
        <Mail from={FROM} to={`拠点のメイン担当者と申請した方（${a.applicant}）`} sub={`【ESステーション】${a.kind}のお申し込み承認のお知らせ（受付番号：${a.no}）`} body={head + extra + SIGN} />
        {a.kind === '解約' && (
          <>
            <p className="mm" style={{ margin: '0.714286rem 0 0.285714rem' }}><span className="apx-mailtag">あとで送るメール</span>最後の請求書の入金期限の翌日にアカウントを停止したとき（自動・Message List メール No.16）</p>
            <Mail from={FROM} to="拠点のメイン担当者・サブ担当者・請求担当者の全員" sub={`【ESステーション】アカウント停止のお知らせ（${b.name}）`}
              body={`ESステーションをご利用いただきありがとうございます。\nご解約にともない、下記の拠点のアカウントを停止いたしました。\n\n■ 拠点名：${b.name}（${b.ids.split('／')[0].trim()}）\n■ 解約日：${rq('解約をご希望の日')}\n■ 停止日：最後のご請求の入金期限の翌日\n\nこれまでのご利用、誠にありがとうございました。\n停止後はログインできません。請求書は Bill One でご確認いただけます。\n\n${SIGN}`} />
          </>
        )}
      </div>
    </details>
  );
}
/** 申請の種類ごとの注記：委託配送会社への通知・お客様へのメール・自販機の拠点（R3）・入口は「拠点情報の変更」だけ（R4） */
export function NoteBlocks({ a, b }: { a: ChangeApp; b: ChangeBranch }) {
  return (
    <>
      <NoticeBlock a={a} b={b} />
      <CustMailBlock a={a} b={b} />
      {b.vm && a.kind === '配送の変更' && (
        <Inline tone="warning"><b>この拠点は設備が自販機のため、配送方法は ES配送便に固定です</b>（ESライト（自販機）は ES配送便の価格プランだけです）。選択肢は出しません。COOL便への変更は承認できないので、却下してお客様へご案内します。</Inline>
      )}
      {(a.kind === '配送の変更' || a.kind === '設備の変更') && (b.changes || []).some((c) => (RE_NG_DAYS.test(c[2]) || /設備の希望日/.test(c[2]))) && (
        <Inline tone="info"><b>納品不可曜日・設備の希望日の変更は「拠点情報の変更」が入口です</b>。この申請の該当行は参照表示で、ここでは設定できません。以後は「拠点情報の変更」で申請してもらってください。</Inline>
      )}
    </>
  );
}

/** 冷蔵庫のサイズアップの手順（設備の変更） */
export function SizeUpNote({ a }: { a: ChangeApp }) {
  if (a.kind !== '設備の変更' || !a.branches.some(isSizeUp)) return null;
  return <Inline tone="info">冷蔵庫のサイズアップは、権限のある運営管理者なら誰でも承認・手配できます（特定の人の承認は不要）。手順：①「影響と設定」で「設備の異動（機種変更）」として登録する → ②「この拠点を承認」で承認 → ③ サイズの差額はオプション（OP000023 サイズ差額（月額））で毎月請求する。</Inline>;
}

/** この申請で影響する範囲（共通のルール） */
export function ImpactRules({ a }: { a: ChangeApp }) {
  const rows = kindImpact(a);
  if (!rows) return null;
  return (
    <details className="apx-memo">
      <summary>この申請で影響する範囲（共通のルール）</summary>
      <div className="pad">
        <Table head={['範囲', 'ルール']}>
          {rows.map((r, k) => <tr key={k}><td><b>{r[0]}</b></td><td>{r[1]}</td></tr>)}
        </Table>
      </div>
    </details>
  );
}
