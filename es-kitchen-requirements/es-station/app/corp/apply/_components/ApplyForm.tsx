'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { CAMPAIGN_DISCOUNT, DEMO_FILES, ERR_MAX, KICKOFF_URL, MODEL, SAMPLE, ZIPS, setApplyMaster } from '@/lib/corp/docs/apply/data';
import {
  capOK, corpFields, destFields, eqInit, eqQty, errCount, firstBadBranch, mainStaff, newApply, newBranch, normalizeApply, planFields, quoteAll, TRIAL_MEALS,
  staffRows, step1Errors, step2Errors, whoOf, yen,
} from '@/lib/corp/docs/apply/logic';
import type { ApplyBranch, ApplyKind, ApplyState, FieldDef, FormErrors, Staff } from '@/lib/corp/docs/apply/types';
import { DEMO } from '@/lib/demo';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useCorp } from '../../_ui/CorpProvider';
import { Confirm, type CfmView } from './Confirm';
import { Fields, Kv, StaffTable } from './parts';
import { PlanCard, type CardOps, type Group } from './PlanCard';
import { QuotePanel } from './QuotePanel';

const api = areaApi(corpDocs);
const noErr = (): FormErrors => ({ fields: {}, staff: {} });
/** デモにしかない文言（「（デモ）」など）は DEMO のときだけ付ける */
const demo = (s: string) => (DEMO ? s : '');

type Modal = null | { t: 'kind'; k: ApplyKind } | { t: 'send' } | { t: 'quote' } | { t: 'cancel' };

/**
 * 申込フォーム（ログイン前の「新規のお申し込み」）。元：22_法人_拠点管理.html に入れた 21_法人_申込フォーム.html の renderApply ほか。
 * ステップ1 希望内容と納品先 → ステップ2 法人情報 → ステップ3 確認 → 完了。登録は corp-docs の submitApply（運営Web の契約申請管理に「受付中」で出る）
 */
export function ApplyForm({ initialKind }: { initialKind: ApplyKind }) {
  /* プラン表・機種・オプションは共通データのマスタ（2026/10/03：画面にコピーを持たない）。読み込んでから描く。マスタを直すと読み直して料金に反映する */
  const { data: master } = useQuery(api, 'applyMaster');
  if (!master) return null;
  setApplyMaster(master);
  return <ApplyFormBody initialKind={initialKind} />;
}

function ApplyFormBody({ initialKind }: { initialKind: ApplyKind }) {
  const router = useRouter();
  const { toast, toastError } = useCorp();
  const [A, setA] = useState<ApplyState>(() => newApply(initialKind));
  const [errs, setErrs] = useState<FormErrors>(noErr);
  const [showSum, setShowSum] = useState(false);
  const [sec, setSec] = useState<Record<number, Group>>({});
  const [eqOpen, setEqOpen] = useState<Record<string, boolean>>({});
  const [cfmView, setCfmView] = useState<CfmView>('table');
  const [cfmOpen, setCfmOpen] = useState<Record<number, boolean>>({});
  const [brCol, setBrCol] = useState(true);
  const [whoBad, setWhoBad] = useState(false);
  const [agBad, setAgBad] = useState(false);
  const [cpSrc, setCpSrc] = useState(0);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);

  /* 描き直したあとにする（スクロールなど） */
  const after = useRef<(() => void)[]>([]);
  useEffect(() => {
    const f = after.current;
    after.current = [];
    f.forEach((x) => x());
  });
  const later = (f: () => void) => after.current.push(f);
  const el = (id: string) => document.getElementById(id);
  const scrollTop = () => later(() => { document.querySelector('.corp-main')?.scrollTo(0, 0); window.scrollTo(0, 0); });

  /* 確認の見せ方の初期値（元：スマホ幅はアコーディオン型）。本番は表型に固定 */
  useEffect(() => { if (DEMO && window.innerWidth <= 720) setCfmView('acc'); }, []);

  /** 状態を写して書き換える */
  const upd = (fn: (n: ApplyState) => void) => {
    const n = structuredClone(A);
    fn(n);
    setA(n);
    return n;
  };
  const clrField = (id: string) => setErrs((e) => {
    if (!e.fields[id]) return e;
    const f = { ...e.fields };
    delete f[id];
    return { ...e, fields: f };
  });
  const clrStaff = (scope: string) => setErrs((e) => {
    if (!e.staff[scope]) return e;
    const s = { ...e.staff };
    delete s[scope];
    return { ...e, staff: s };
  });
  const isT = A.kind === 'trial';

  /* ---------- 担当者テーブル ---------- */
  const owner = (n: ApplyState, scope: string): { _st?: Staff[] } => (scope === 'c' ? n.corp : n.branches[parseInt(scope.slice(1), 10)]);
  const defKinds = (scope: string) => (scope === 'c' ? ['メイン担当者', '請求担当者'] : ['メイン担当者']);
  const staffSet = (scope: string, j: number, k: keyof Staff, v: string) => {
    upd((n) => { const rows = staffRows(owner(n, scope), defKinds(scope)); rows[j] = { ...rows[j], [k]: v }; });
    clrStaff(scope);
  };
  const staffAdd = (scope: string) => upd((n) => { const o = owner(n, scope); staffRows(o, ['メイン担当者']); o._st!.push({ kind: 'サブ担当者' }); });
  const staffDel = (scope: string, j: number) => upd((n) => { const o = owner(n, scope); if (!o._st || o._st.length <= 1) return; o._st.splice(j, 1); });

  /* ---------- 住所検索（郵便番号 → 都道府県・市区町村・町域番地。建物等は埋めない） ---------- */
  const zip = (scope: string) => {
    const store = (scope === 'c_' ? A.corp : A.branches[parseInt(scope.slice(1), 10)]) as Record<string, unknown>;
    const key = String(store?.zip || '').replace(/[^0-9]/g, '');
    if (!key) { setErrs((e) => ({ ...e, fields: { ...e.fields, [scope + 'zip']: '郵便番号をご入力ください。' } })); return; }
    const hit = ZIPS[key];
    /* 郵便番号の住所データはまだない（見本の数件だけ引ける） */
    if (!hit) { toast('郵便番号の住所検索はまだつないでいません。お手数ですが手でご入力ください。'); return; }
    upd((n) => { Object.assign(scope === 'c_' ? n.corp : n.branches[parseInt(scope.slice(1), 10)], hit); });
    setErrs((e) => {
      const f = { ...e.fields };
      ['zip', 'pref', 'city', 'addr1'].forEach((k) => delete f[scope + k]);
      return { ...e, fields: f };
    });
    toast('住所を入力しました（建物・部屋番号は手でご入力ください）');
  };

  /* ---------- 入力グループ（タブ） ---------- */
  const section = (i: number, g: Group, targetId?: string) => {
    setSec((s) => ({ ...s, [i]: g }));
    later(() => el(targetId || `panel-${i}-${g}`)?.scrollIntoView({ block: targetId ? 'center' : 'start', behavior: 'smooth' }));
  };

  /* ---------- 契約カードの操作 ---------- */
  const ops: CardOps = {
    open: (i) => upd((n) => { const was = n.branches[i]._o; n.branches.forEach((b, j) => { b._o = j === i && !was; }); }),
    dup: (i) => {
      const n = upd((n) => {
        const cp = structuredClone(n.branches[i]);
        cp.name = (cp.name || '') + '（コピー）';
        n.branches.forEach((b) => { b._o = false; });
        cp._o = true;
        n.branches.splice(i + 1, 0, cp);
      });
      toast('希望プラン ' + (i + 1) + ' を複製しました（' + n.branches.length + '契約）');
    },
    section: (i, g) => section(i, g),
    dev: (i, d) => {
      if (A.branches[i].dev === d) return;
      upd((n) => {
        const b = n.branches[i];
        b.dev = d; b._eq = {}; b._so = {}; b._incl = {};
        if (d === 'vm') { b.course = 'ライト'; b.ship = 'ES配送便'; } /* 自販機は固定 */
        eqInit(b);
      });
      if (d === 'vm') toast('自動販売機はコース「ライト」・配送方法「ES配送便」で固定です');
    },
    set: (i, f, v) => { upd((n) => { (n.branches[i] as unknown as Record<string, unknown>)[f.key] = v; eqInit(n.branches[i]); }); clrField(f.id); },
    zip,
    inclSet: (i, grp, k) => {
      const b = A.branches[i], m = MODEL[k];
      if (!m) return;
      if (!capOK(b, m)) { toast(m.label + 'は、ご契約の ' + (b.meals || 100) + ' 個には容量が足りません。'); return; }
      upd((n) => { const x = n.branches[i]; x._incl = { ...(x._incl || {}), [grp]: k }; });
      toast('サイズを「' + m.label + '」に変更しました');
    },
    eqGrp: (i, g) => {
      const key = i + '_' + g, b = A.branches[i];
      const qty = Object.keys(b._eq || {}).filter((k) => MODEL[k]?.grp === g).reduce((t, k) => t + eqQty(b, k), 0);
      const cur = eqOpen[key] !== undefined ? eqOpen[key] : qty > 0;
      setEqOpen({ ...eqOpen, [key]: !cur });
      later(() => el(`sec-${i}-add`)?.scrollIntoView({ block: 'start' }));
    },
    eqAdd: (i, k, d) => {
      const m = MODEL[k], cap = m && m.max ? m.max : 9;
      let v = eqQty(A.branches[i], k) + d;
      if (v > cap) { toast(m.label + 'は最大 ' + cap + ' 台までです。それ以上は担当者へご相談ください。'); v = cap; }
      upd((n) => { const b = eqInit(n.branches[i]); b._eq[k] = Math.max(0, v); });
    },
    svcTog: (i, k, on) => upd((n) => { n.branches[i]._so = { ...(n.branches[i]._so || {}), [k]: !!on }; }),
    ngTog: (i, d, on) => upd((n) => { n.branches[i]._ng = { ...(n.branches[i]._ng || {}), [d]: !!on }; }),
    fileAdd: (i) => {
      const b = A.branches[i], fs = b._files || [];
      if (fs.length >= 10) { toast('ファイルは最大10件までです'); return; }
      /* アップロードはまだつないでいない。名前と大きさの見本を順に足す */
      const j = fs.length % DEMO_FILES.names.length;
      upd((n) => { n.branches[i]._files = [...(n.branches[i]._files || []), { n: DEMO_FILES.names[j], s: DEMO_FILES.sizes[j] }]; });
      toast('ファイルを追加しました' + demo('（デモ）'));
    },
    fileDel: (i, j) => upd((n) => { n.branches[i]._files.splice(j, 1); }),
    sameTog: (i, on) => { upd((n) => { n.branches[i]._same = !!on; }); clrStaff('b' + i); },
    staffSet, staffAdd, staffDel,
    gotoCorp: () => goto(2),
  };

  const add = () => {
    const n = upd((n) => {
      n.branches.forEach((b) => { b._o = false; });
      const nb = newBranch(n.branches.length, n.kind === 'trial');
      nb._o = true;
      n.branches.push(nb);
    });
    toast('契約を追加しました（' + n.branches.length + '契約）');
  };
  const del = (i: number) => {
    if (A.branches.length <= 1) return;
    const n = upd((n) => {
      n.branches.splice(i, 1);
      if (!n.branches.some((b) => b._o)) n.branches[0]._o = true;
    });
    setSec({});
    setErrs(noErr());
    toast('契約を削除しました（' + n.branches.length + '契約）');
  };

  /* ---------- 契約区分の切替（何が変わって何が残るかを、切り替える前にお見せする） ---------- */
  const kindDo = (k: ApplyKind) => {
    const toT = k === 'trial', done: string[] = [];
    setModal(null);
    upd((n) => {
      n.kind = k;
      if (toT) {
        let vm = 0, st = 0;
        n.branches.forEach((b) => {
          if (b.dev === 'vm') { b.dev = 'rf'; b._eq = {}; b._so = {}; b._incl = {}; eqInit(b); vm++; }
          if (b.start) { b.start = ''; st++; }
          /* お試しはプラン50・ライトだけ（台帳 R・受付簿 #422） */
          if (b.meals !== TRIAL_MEALS || b.course !== 'ライト') { b.meals = TRIAL_MEALS; b.course = 'ライト'; eqInit(b); }
        });
        if (vm) done.push('設備タイプを冷蔵庫・冷凍庫に変更 ' + vm + '件');
        if (st) done.push('契約開始希望年月を解除 ' + st + '件');
        done.push('キャンペーン割引を適用');
      } else {
        done.push('契約開始希望年月の入力欄を表示');
        done.push('設備タイプの選択を表示');
      }
    });
    setErrs(noErr());
    scrollTop();
    toast((toT ? 'お試しキャンペーン' : '本導入') + 'に切り替えました（' + done.join('／') + '。お届け先・ご担当者は保持）');
  };

  /* ---------- ステップの移動 ---------- */
  const next = () => {
    if (A.step === 1) {
      const n = normalizeApply(structuredClone(A), 1) as ApplyState;
      const e = step1Errors(n), cnt = errCount(e);
      if (cnt) {
        const fb = firstBadBranch(n, e);
        if (fb >= 0 && !n.branches[fb]._o) n.branches.forEach((b, j) => { b._o = j === fb; });
        setA(n); setErrs(e); setShowSum(true);
        later(() => el('errsum')?.scrollIntoView({ block: 'center' }));
        toast(cnt + '件の入力が足りません（希望プラン ' + (fb + 1) + '）');
        return;
      }
      n.step = 2;
      setA(n);
    } else if (A.step === 2) {
      const n = normalizeApply(structuredClone(A), 2) as ApplyState;
      const e = step2Errors(n), cnt = errCount(e);
      if (cnt) {
        setA(n); setErrs(e); setShowSum(true);
        later(() => el('errsum')?.scrollIntoView({ block: 'center' }));
        toast(cnt + '件の入力が足りません');
        return;
      }
      n.step = 3;
      setA(n);
    }
    setErrs(noErr()); setShowSum(false);
    scrollTop();
  };
  const back = () => {
    upd((n) => { n.step = (n.step - 1) as 1 | 2; });
    setErrs(noErr()); setShowSum(false); setWhoBad(false); setAgBad(false);
    scrollTop();
  };
  function goto(step: 1 | 2, bi?: number) {
    upd((n) => {
      n.step = step;
      if (step === 1 && bi != null) n.branches.forEach((b, i) => { b._o = i === bi; });
    });
    setErrs(noErr()); setShowSum(false);
    scrollTop();
    if (step === 1 && bi != null) later(() => document.querySelectorAll('.cd-apply .brc')[bi]?.scrollIntoView({ block: 'start' }));
  }
  /** 未入力のまとめから、その欄へ飛ぶ。閉じている契約なら開いてから飛ぶ */
  const jump = (id: string, bi: number | null) => {
    if (bi == null) { el(id)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    if (!A.branches[bi]._o) upd((n) => n.branches.forEach((b, j) => { b._o = j === bi; }));
    const inPlan = planFields(A, bi).some((f) => 'w_' + f.id === id);
    const g: Group = id.startsWith('e_st_') ? 'staff' : inPlan ? 'base' : 'delivery';
    section(bi, g, id);
  };

  /* ---------- ステップ2：納品先からコピー ---------- */
  const copy = () => {
    const b = A.branches[cpSrc] || A.branches[0];
    if (!b) return;
    upd((n) => { (['zip', 'pref', 'city', 'addr1', 'addr2', 'tel', 'fax'] as const).forEach((k) => { n.corp[k] = b[k] || ''; }); });
    toast('お届け先の住所・電話番号をコピーしました（法人名はコピーしていません）');
  };

  /* ---------- 登録 ---------- */
  const send = () => {
    if (!whoOf(A.who, A)) {
      setWhoBad(true);
      later(() => el('whoFld')?.scrollIntoView({ block: 'center' }));
      return;
    }
    if (!A.agree) { setAgBad(true); return; }
    setModal({ t: 'send' });
  };
  const doSend = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { kind, corp, branches, who, agree } = A;
      const r = await api.action('submitApply', { kind, corp, branches, who, agree });
      upd((n) => { n.sent = true; n.no = r.no; });
      setModal(null);
      scrollTop();
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };
  const reset = () => { setA(newApply(A.kind)); setSec({}); setEqOpen({}); setErrs(noErr()); setShowSum(false); setWhoBad(false); setAgBad(false); scrollTop(); };

  /* ---------- デモデータ（本番にはない） ---------- */
  const apDemo = () => {
    const S = SAMPLE[A.kind];
    if (A.step === 2) {
      upd((n) => {
        n.corp = structuredClone(S.corp);
        const m0 = (n.corp._st || []).find((x) => x.kind === 'メイン担当者');
        n.who = m0?.mail || '';
      });
    } else if (A.step === 1) {
      /* サンプルの拠点数に合わせる（足りなければ増やす。多い分はそのまま使い回す） */
      upd((n) => {
        const cnt = Math.max(n.branches.length, S.branches.length);
        let open = n.branches.findIndex((b) => b._o);
        if (open < 0) open = 0;
        const out: ApplyBranch[] = [];
        for (let i = 0; i < cnt; i++) {
          const nb: ApplyBranch = structuredClone(S.branches[i % S.branches.length]);
          nb._o = i === open;
          if (n.kind === 'trial') { nb.dev = 'rf'; nb.start = ''; }
          out.push(eqInit(nb));
        }
        n.branches = out;
      });
    } else return;
    setErrs(noErr()); setShowSum(false);
    toast('デモデータを入力しました');
  };

  /* ---------- キャンセル（入力していれば確認） ---------- */
  const dirty = () => !A.sent && JSON.stringify({ ...A, kind: initialKind }) !== JSON.stringify(newApply(initialKind));
  const cancel = () => { if (dirty()) setModal({ t: 'cancel' }); else router.push('/corp/login'); };

  const meetLink = () => toast('既存の「面談のお申し込み」ページへ移動します' + demo('（このデモには含みません）'));
  const contact = () => toast('お問い合わせ画面を開きます' + demo('（デモ）'));

  /* ================= 描画 ================= */
  const q = quoteAll(A);
  const stepT = ['希望内容とお届け先を入力', '法人情報を入力', '内容を確認して送信'];

  let body: ReactNode = null;
  if (A.sent) body = <Done A={A} onReset={reset} onLogin={() => router.push('/corp/login')} />;
  else if (A.step === 1) {
    body = (
      <div className="cols">
        <div id="apmain" style={{ minWidth: 0 }}>
          <div className="meetcta" style={{ marginTop: 0 }}>
            <div className="mt">
              <b>面談でご相談いただくと、合うプランと設備をご提案できます。</b>
              <div className="ms">
                費用はかかりません。面談なしでこのままお申し込みいただけます。アカウントをお持ちの方は<a className="lk" onClick={() => router.push('/corp/login')}>ログイン</a>、
                面談の内容が分からない方は<a className="lk" onClick={contact}>お問い合わせ</a>へ。
              </div>
            </div>
            <button type="button" className="btn teal" onClick={meetLink}>面談のお申し込みへ <span className="ext">別ページ</span></button>
          </div>
          <div className="card contractsetup">
            <h2>お申し込み方法</h2>
            <div className="pad">
              <div className="kindsw">
                <button type="button" className={`kb${isT ? '' : ' on'}`} onClick={() => !isT || setModal({ t: 'kind', k: 'main' })}>
                  <b>本導入</b><span>継続してご利用いただく契約です</span>
                </button>
                <button type="button" className={`kb${isT ? ' on' : ''}`} onClick={() => isT || setModal({ t: 'kind', k: 'trial' })}>
                  <b>お試しキャンペーン</b><span>初回利用企業限定・1ヶ月間・50プラン（ESライト）の月額分を割引</span>
                </button>
              </div>
              {isT && (
                <div className="note warn">
                  <b>お試しキャンペーンは初回利用企業限定・1ヶ月です。</b>最低利用期間と違約金はありません。設備は<b>冷蔵庫・冷凍庫のみ</b>で、自動販売機はお選びいただけません（自販機をご検討の場合は面談でご相談ください）。<br />
                  <b>キャンペーン割引は1回だけです。</b>割引額は「50プラン（ESライト）の月額 {yen(CAMPAIGN_DISCOUNT)}」で、適用先の月額合計が上限です（50プラン（ESライト）・1拠点ならほぼ無料）。<br />
                  <b>請求先が「法人に請求」なら、法人の請求に1回。</b>拠点ごとに請求する（「この拠点に請求」）場合は、<b>一覧の最初の拠点だけ</b>に適用します。複数の拠点をお申し込みいただけますが、複数拠点・プラン変更・期間の延長は差額をご請求します。
                </div>
              )}
              {A.branches.length === 1 ? (
                <div className="singlecontract">
                  <div className="scopy">複数の拠点をまとめて申し込むときは、拠点を追加してください（右のお見積は開いている契約の分です）。</div>
                  <button type="button" className="btn sm" onClick={add}><span className="ico">＋</span>別の拠点も追加</button>
                </div>
              ) : (
                <>
                  <div className="secttl">入力する契約<span className="mm">{A.branches.length}契約</span></div>
                  <div className="chips">
                    {A.branches.map((b, i) => (
                      <div key={i} className={`chip${b._o ? ' on' : ''}`} onClick={() => ops.open(i)}>
                        <div className="ct"><b>希望プラン {i + 1}</b><span className="x" onClick={(e) => { e.stopPropagation(); del(i); }}>×</span></div>
                        <div className="cn">{b.name || '（未入力）'}</div>
                      </div>
                    ))}
                    <button type="button" className="chipadd" onClick={add}><span className="ico">＋</span>契約を追加</button>
                  </div>
                </>
              )}
            </div>
          </div>
          {A.branches.map((b, i) => <PlanCard key={i} A={A} i={i} active={sec[i] || 'base'} eqOpen={eqOpen} errs={errs} ops={ops} />)}
        </div>
        <aside className="side" id="apside"><QuotePanel A={A} /></aside>
      </div>
    );
  } else if (A.step === 2) {
    body = (
      <>
        <div className="note info" style={{ marginTop: 0 }}><b>あと少しです。</b>ご請求とご連絡に使う法人のご情報をご入力ください。</div>
        <div className="card">
          <h2>法人情報</h2>
          <div className="pad">
            <div className="copybox">
              <div className="cbt"><b>お届け先（拠点）情報からコピー</b><div className="cbs">今回の申込で入力したお届け先の郵便番号・住所・電話番号をコピーできます。</div></div>
              <div className="cbr">
                <select id="cp_src" value={cpSrc} onChange={(e) => setCpSrc(Number(e.target.value))}>
                  {A.branches.map((b, i) => <option key={i} value={i}>{'希望プラン ' + (i + 1) + '　' + (b.name || '（未入力）')}</option>)}
                </select>
                <button type="button" className="btn" onClick={copy}>このお届け先からコピー</button>
              </div>
              <div className="cbn">※ 法人名はコピーされません。法人の正式名称を入力してください。</div>
            </div>
            <Fields
              list={corpFields()} store={A.corp as Record<string, unknown>} errs={errs.fields} onZip={zip}
              onSet={(f: FieldDef, v) => { upd((n) => { (n.corp as Record<string, unknown>)[f.key] = v; }); clrField(f.id); }}
            />
            <div className="secttl">担当者情報</div>
            <StaffTable
              scope="c" rows={A.corp._st && A.corp._st.length ? A.corp._st : [{ kind: 'メイン担当者' }, { kind: '請求担当者' }]} err={errs.staff.c}
              note={<><b>メイン担当者1名・請求担当者1名が必須です。</b>サブ担当者は何名でも追加できます。</>}
              onSet={(j, k, v) => staffSet('c', j, k, v)} onAdd={() => staffAdd('c')} onDel={(j) => staffDel('c', j)}
            />
            <div className="note mut">
              <b>お申し込み者（確認画面でご担当者から選びます）とメイン担当者の両方のメールアドレスあてに、受付完了メール（受付番号つき）をお送りします。</b>
              請求書は<b>請求担当者</b>あてにお送りします。拠点で「法人の担当者情報と同じ」にした場合も、この担当者を使います。
            </div>
          </div>
        </div>
      </>
    );
  } else {
    body = (
      <Confirm
        A={A} view={cfmView} open={cfmOpen} brCol={brCol} whoBad={whoBad} agBad={agBad}
        onView={(v) => { setCfmView(v); setCfmOpen({}); }}
        onBrCol={setBrCol}
        onAcc={(i) => setCfmOpen((o) => ({ ...o, [i]: !(o[i] !== undefined ? o[i] : cfmView === 'acc' && i === 0) }))}
        onGoto={goto}
        onWho={(mail) => { upd((n) => { n.who = mail; }); if (mail) setWhoBad(false); }}
        onAgree={(on) => { upd((n) => { n.agree = on; }); if (on) setAgBad(false); }}
      />
    );
  }

  return (
    <div className="corp-docs cd-apply">
      <header className="cb-pubhead">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/corp/logo.png" alt="ES STATION" />
        <span className="cb-pubname">法人Web</span>
        <nav className="cb-publinks">
          <a onClick={meetLink}>面談のお申し込み</a>
          <a onClick={contact}>お問い合わせ</a>
        </nav>
        <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={() => router.push('/corp/login')}><span>ログイン</span></button>
      </header>
      <div id="app">
        <div className="page">
          <div id="phead" className="phead">
            <div style={{ minWidth: 0 }}>
              <div className="crumb">新規のお申し込み</div>
              <h1>新規契約申込</h1>
              <div className="pmeta">
                {isT
                  ? <><span>お試し期間 <b>1ヶ月</b></span><span>最低利用期間 <b>なし</b></span></>
                  : <span>お申し込みから開始まで <b>2〜3週間</b></span>}
              </div>
            </div>
          </div>
          <div id="steps" className="steps">
            <div className="stpm">
              <span className="sn">{A.step} / 3</span><span className="st">{stepT[A.step - 1]}</span>
              <span className="sp"><i style={{ width: Math.round((A.step / 3) * 100) + '%' }} /></span>
            </div>
            {stepT.map((t, i) => {
              const k = i + 1, c = k < A.step ? 'done' : k === A.step ? 'now' : 'todo';
              return (
                <div key={i} className={`stp ${c}`}>
                  <div className="n">{c === 'done' ? '✓' : k}</div>
                  <div style={{ minWidth: 0 }}><div className="t">{t}</div><div className="s">{k < A.step ? '完了' : k === A.step ? 'ご入力中' : '未入力'}</div></div>
                </div>
              );
            })}
          </div>
          <div id="body">
            {showSum && !A.sent && <ErrSum A={A} errs={errs} onJump={jump} />}
            {body}
          </div>
        </div>
        {!A.sent && (
          <div className="fixfoot" id="foot">
            <div className="ffin">
              {DEMO && (A.step === 1 || A.step === 2) && <button type="button" className="btn sm demob" onClick={apDemo}>デモデータを入力</button>}
              {A.step === 1 && (
                <button type="button" className="qmb" onClick={() => setModal({ t: 'quote' })}>
                  <span className="l">お見積</span><span className="v">{q.n ? yen(q.net) + '/月' : '—'}</span>
                </button>
              )}
              <div className="fnote">
                {A.step === 2 ? 'ご請求とご連絡に使う、法人のご情報をご入力ください。' : A.step === 3 ? 'ご入力内容をご確認ください。修正が必要な場合は「修正する」から該当ステップに戻れます。' : ''}
              </div>
              <div className="fr">
                {A.step > 1
                  ? <button type="button" className="btn" onClick={back}>戻る</button>
                  : <button type="button" className="btn" onClick={cancel}>キャンセル</button>}
                {A.step < 3
                  ? <button type="button" className="btn pri" onClick={next}>次へ <span className="ico">→</span></button>
                  : <button type="button" className="btn pri" onClick={send}><span className="ico">✓</span>登録</button>}
              </div>
            </div>
          </div>
        )}
      </div>
      {modal && (
        <div className="ov on" id={modal.t === 'kind' || modal.t === 'cancel' ? 'ov2' : 'ov1'} onClick={(e) => { if (e.target === e.currentTarget && !busy) setModal(null); }}>
          {modal.t === 'kind' && <KindModal A={A} k={modal.k} onClose={() => setModal(null)} onDo={() => kindDo(modal.k)} />}
          {modal.t === 'send' && <SendModal A={A} busy={busy} onClose={() => setModal(null)} onDo={doSend} />}
          {modal.t === 'quote' && (
            <div className="mdl qsheet">
              <div className="mhead"><h3>お見積</h3><p className="mdesc">開いている契約の内訳と、お申し込み全体の合計です。</p></div>
              <div className="mbody"><QuotePanel A={A} /></div>
              <div className="mfoot"><button type="button" className="btn pri" onClick={() => setModal(null)}>閉じる</button></div>
            </div>
          )}
          {modal.t === 'cancel' && (
            <div className="mdl">
              <div className="mhead"><div className="mico dang">!</div><h3>編集内容を破棄しますか？</h3><p className="mdesc">編集中の内容は保存されません。<br />編集内容を破棄してもよろしいですか？</p></div>
              <div className="mfoot">
                <button type="button" className="btn" onClick={() => setModal(null)}>キャンセル</button>
                <button type="button" className="btn red" onClick={() => { setModal(null); router.push('/corp/login'); }}>破棄</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- 未入力のまとめ（契約ごとにまとめ、押すとその欄へ飛ぶ） ---------- */
function ErrSum({ A, errs, onJump }: { A: ApplyState; errs: FormErrors; onJump: (id: string, bi: number | null) => void }) {
  type G = { bi: number | null; name: string; items: { label: string; id: string }[] };
  const groups: G[] = [], map: Record<string, G> = {};
  const push = (bi: number | null, label: string, id: string) => {
    const k = bi == null ? 'c' : String(bi);
    if (!map[k]) {
      const b = bi == null ? null : A.branches[bi];
      map[k] = { bi, name: bi == null ? '法人情報' : '希望プラン ' + (bi + 1) + (b && b.name ? '　' + b.name : ''), items: [] };
      groups.push(map[k]);
    }
    map[k].items.push({ label, id });
  };
  if (A.step === 1) {
    A.branches.forEach((_, i) => {
      [...planFields(A, i), ...destFields(A, i)].forEach((f) => { if (errs.fields[f.id]) push(i, f.label, 'w_' + f.id); });
    });
    /* 担当者テーブルは1つにつき1件だけ出す（行ごとに出すと数が膨らむため） */
    A.branches.forEach((_, i) => { if (errs.staff['b' + i]) push(i, 'ご担当者', 'e_st_b' + i); });
  } else {
    corpFields().forEach((f) => { if (errs.fields[f.id]) push(null, f.label, 'w_' + f.id); });
    if (errs.staff.c) push(null, 'ご担当者', 'e_st_c');
  }
  const total = groups.reduce((t, g) => t + g.items.length, 0);
  if (!total) return null;
  return (
    <div className="errsum" id="errsum">
      <div className="esh"><span className="ico">!</span><b>{total}件</b>の入力が足りません。押すとその欄へ移動します。</div>
      {groups.map((g, n) => {
        const show = g.items.slice(0, ERR_MAX), rest = g.items.length - show.length;
        return (
          <div key={n} className="esg">
            <div className="egt">{g.name}<span className="n">{g.items.length}件</span></div>
            <div className="esb">
              {show.map((x) => <button key={x.id} type="button" className="esb-i" onClick={() => onJump(x.id, g.bi)}>{x.label}</button>)}
              {rest > 0 && <button type="button" className="esb-i more" onClick={() => onJump(g.items[ERR_MAX].id, g.bi)}>ほか {rest}件</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KindModal({ A, k, onClose, onDo }: { A: ApplyState; k: ApplyKind; onClose: () => void; onDo: () => void }) {
  const toT = k === 'trial';
  const vm = A.branches.filter((b) => b.dev === 'vm').length, st = A.branches.filter((b) => b.start).length;
  const ch: ReactNode[] = [];
  const keep = ['お届け先のご情報（住所・電話番号・従業員数）', '拠点のご担当者', '搬入経路の添付資料', 'プラン外の備考'];
  if (toT) {
    if (vm) ch.push(<>設備タイプが <b>冷蔵庫・冷凍庫</b> になります（自動販売機の契約 {vm}件）</>);
    if (st) ch.push(<><b>契約開始希望年月</b>が外れます（お試しはESキッチンが調整します）</>);
    ch.push(<>お見積に <b>お試しキャンペーン割引 −{yen(CAMPAIGN_DISCOUNT)}</b>（50プラン（ESライト）の月額が上限・請求先が「法人に請求」なら法人の請求に1回、拠点ごとに請求する場合は一覧の最初の拠点だけ）が入ります</>);
    ch.push(<>最低利用期間と違約金が <b>なし</b> になります</>);
  } else {
    ch.push(<><b>契約開始希望年月</b>をご入力いただきます</>);
    ch.push(<>設備タイプで <b>自動販売機</b> もお選びいただけます</>);
    ch.push(<>お試しキャンペーン割引が外れ、<b>通常の月額料金</b>になります</>);
  }
  return (
    <div className="mdl">
      <div className="mhead">
        <div className="mico q">?</div>
        <h3>{toT ? 'お試しキャンペーン' : '本導入'}に切り替えますか？</h3>
        <p className="mdesc">入力済みの内容は、下のとおり残ります。</p>
      </div>
      <div className="mbody">
        <div className="note warn" style={{ marginTop: 0 }}><b>変わるもの</b><ul>{ch.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        <div className="note ok"><b>そのまま残るもの</b><ul>{keep.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <div className="mfoot">
        <button type="button" className="btn" onClick={onClose}>やめる</button>
        <button type="button" className="btn pri" onClick={onDo}>切り替える</button>
      </div>
    </div>
  );
}

function SendModal({ A, busy, onClose, onDo }: { A: ApplyState; busy: boolean; onClose: () => void; onDo: () => void }) {
  const all = quoteAll(A);
  return (
    <div className="mdl">
      <div className="mhead">
        <div className="mico q">?</div>
        <h3>この内容で登録しますか？</h3>
        <p className="mdesc">送信後も、ESキッチンからのご連絡で内容を変更できます。</p>
      </div>
      <div className="mbody">
        <div className="cnt">
          <div className="ci"><div className="cl">契約区分</div><div className="cvv" style={{ fontSize: '1rem' }}>{A.kind === 'trial' ? 'お試し' : '本導入'}<span className="cu" /></div></div>
          <div className="ci acc2"><div className="cl">契約</div><div className="cvv">{A.branches.length}<span className="cu">件</span></div></div>
          <div className="ci"><div className="cl">月額合計（税抜）</div><div className="cvv" style={{ fontSize: '1.071429rem' }}>{all.n ? yen(all.net) : '—'}<span className="cu">/月</span></div></div>
        </div>
        {!!all.nq && <div className="note warn">自動販売機の契約 {all.nq}件は別途お見積りです。</div>}
        <div className="note info">お申し込みの受付番号を、<b>お申し込み者とメイン担当者の両方</b>へメールでお送りします。2〜3営業日でESキッチンからご連絡します。</div>
      </div>
      <div className="mfoot">
        <button type="button" className="btn" onClick={onClose} disabled={busy}>戻る</button>
        <button type="button" className="btn pri" onClick={onDo} disabled={busy}>登録する</button>
      </div>
    </div>
  );
}

/* ---------- 完了 ---------- */
function Done({ A, onReset, onLogin }: { A: ApplyState; onReset: () => void; onLogin: () => void }) {
  const isT = A.kind === 'trial', all = quoteAll(A);
  return (
    <div className="ov on donev">
      <div className="mdl">
        <div className="mhead">
          <div className="mico ok">✓</div>
          <h3>お申し込みを受け付けました。</h3>
          <p className="mdesc">お申し込みありがとうございます。<br />内容を確認後、担当者よりご連絡いたします。</p>
        </div>
        <div className="mbody">
          <div className="note mut" style={{ marginTop: 0 }}>
            ※受付番号を記載した受付完了メールを、お申し込み者（{whoOf(A.who, A)?.mail || '—'}）と メイン担当者（{mainStaff(A.corp).mail || '—'}） の両方宛に送信しております。
          </div>
          <Kv rows={[
            ['受付番号', <b key="no">{A.no}</b>],
            ['契約区分', isT ? 'お試しキャンペーン' : '本導入'],
            ['契約数', A.branches.length + '契約'],
            ['月額基本料金合計（税抜）', (all.n ? yen(all.net) + '/月' : '—') + (all.nq ? '　＋ 別途見積 ' + all.nq + '件' : '')],
          ]} />
          {/* キックオフ面談の予約（お申し込みの全員に案内：台帳 2026/10/03） */}
          <div className="note info">
            <b>キックオフ面談のご予約</b><br />
            ご利用開始に向けたキックオフ面談（1時間）のご予約をお願いします。<br />
            <a href={KICKOFF_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'underline' }}>キックオフ面談を予約する</a>
          </div>
        </div>
        <div className="mfoot">
          {DEMO && <button type="button" className="btn" onClick={onReset}>もう一度デモを見る</button>}
          <button type="button" className="btn pri" onClick={onLogin}>ログイン画面へ</button>
        </div>
      </div>
    </div>
  );
}
