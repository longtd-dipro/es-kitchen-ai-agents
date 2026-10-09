'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CORPS, ES_STAFF, NF_EQ, NF_KUBUN, NF_ROUTES, PLANS, PROXY_USER } from '@/lib/ops/applications/constants';
import { nfBlankBranch, nfErrors, nfVm, type NfBranch, type NfForm } from '@/lib/ops/applications/logic';
import { today } from '@/lib/supplier/dates';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { api, setFilter } from './api';
import { Btn, PageHead } from './ds';
import { DiscardModal, Fld, scrollToBad, Sel, useLeaveGuard } from './proxyParts';

/*
 * 契約申込新規登録（代理入力）。元：approve.js の newForm（2026/09/28）。
 * Webの申込以外（電話・営業・紙など）で受けた新規申込を運営が代わりに入力する。
 * 登録すると申込（受付中）が1件でき、あとはWebの申込と同じ受付で進める。
 */
const blank = (): NfForm => ({
  route: '', recv: today().replace(/\//g, '-'), es: '', corpKind: '新しい法人',
  cname: '', ckana: '', cbill: '', caddr: '', ctel: '', corp: '',
  pname: '', pkana: '', pmail: '', ptel: '', branches: [nfBlankBranch()], doc: '', photo: '',
});

export default function NewProxyForm() {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const [f, setF] = useState<NfForm>(blank);
  const [dirty, setDirty] = useState(false);
  const [bad, setBad] = useState<string[]>([]);
  const [leave, setLeave] = useState(false);
  useLeaveGuard(dirty);

  const set = (p: Partial<NfForm>) => { setF({ ...f, ...p }); setDirty(true); setBad(bad.filter((k) => !(k in p))); };
  const setB = (i: number, p: Partial<NfBranch>) => {
    setF({ ...f, branches: f.branches.map((b, k) => (k === i ? { ...b, ...p } : b)) });
    setDirty(true);
    setBad(bad.filter((k) => !Object.keys(p).some((x) => k === `b${i}.${x}`)));
  };
  const toList = () => router.push('/ops/applications');
  const cancel = () => (dirty ? setLeave(true) : toList());
  const save = async () => {
    const b = nfErrors(f);
    if (b.length) { setBad(b); scrollToBad(); toast(`入力されていない項目があります（${b.length}件）`); return; }
    try {
      const { no } = await api.action('createIntake', { form: f });
      setDirty(false);
      setFilter({ tab: 'new', q: '', sort: 'date' });
      toast(`登録しました。受付中の申込として一覧に追加しました（${no}）`);
      router.push('/ops/applications');
    } catch (e) { toastError(e); }
  };
  const bd = (k: string) => bad.includes(k);
  const inp = (k: keyof NfForm, ph?: string, type = 'text') => <input type={type} value={String(f[k])} placeholder={ph} onChange={(e) => set({ [k]: e.target.value } as Partial<NfForm>)} />;

  return (
    <div id="apx">
      <div className="page" id="apxbody">
        <div className="apx-narrow" id="nf">
          <PageHead crumb={[{ t: '契約申請管理', on: cancel }, '契約申込新規登録']} title="契約申込新規登録（代理入力）"
            actions={<><Btn variant="outline" onClick={cancel}>キャンセル</Btn>{canAct(api, 'createIntake') && <Btn onClick={save}>登録</Btn>}</>} />
          <div className="card"><h2>受付の情報<span className="sub">どこから受けたか（履歴に残ります）</span></h2><div className="pad"><div className="frow">
            <Fld label="受付経路" req err="受付経路を選んでください" bad={bd('route')}><Sel value={f.route} opts={NF_ROUTES} ph="選択してください" onChange={(v) => set({ route: v })} /></Fld>
            <Fld label="受付日" req bad={bd('recv')}>{inp('recv', undefined, 'date')}</Fld>
            <Fld label="入力者"><div className="ro lock">{PROXY_USER}</div></Fld>
            <Fld label="ES営業担当"><Sel value={f.es} opts={ES_STAFF} ph="選択してください" onChange={(v) => set({ es: v })} /></Fld>
          </div></div></div>
          <div className="card"><h2>法人<span className="sub">既存の法人に拠点を足すときは「既存の法人」</span></h2><div className="pad">
            <div className="frow"><Fld label="法人の区分"><Sel value={f.corpKind} opts={['新しい法人', '既存の法人']} onChange={(v) => set({ corpKind: v as NfForm['corpKind'] })} /></Fld></div>
            {f.corpKind === '新しい法人' ? (
              <div className="frow" style={{ marginTop: '0.785714rem' }}>
                <Fld label="法人名" req bad={bd('cname')}>{inp('cname', '例）株式会社サンプルフーズ')}</Fld>
                <Fld label="法人名フリガナ" req bad={bd('ckana')}>{inp('ckana', 'カタカナ')}</Fld>
                <Fld label="請求先法人名" req bad={bd('cbill')}>{inp('cbill', '請求書の宛名（法人名と同じなら同じ名前）')}</Fld>
                <Fld label="請求書に載る住所">{inp('caddr', '郵便番号・住所')}</Fld>
                <Fld label="電話番号">{inp('ctel', '例）03-1234-5678')}</Fld>
              </div>
            ) : (
              <div className="frow" style={{ marginTop: '0.785714rem' }}>
                <Fld label="法人" req err="法人を選んでください" bad={bd('corp')}><Sel value={f.corp} opts={CORPS} ph="法人ID・法人名で選ぶ" onChange={(v) => set({ corp: v })} /></Fld>
              </div>
            )}
          </div></div>
          <div className="card"><h2>法人のご担当者（メイン担当者）<span className="sub">この方が申込者になります。拠点のご担当者は各拠点で入力</span></h2><div className="pad"><div className="frow">
            <Fld label="担当者名" req bad={bd('pname')}>{inp('pname')}</Fld>
            <Fld label="フリガナ" req bad={bd('pkana')}>{inp('pkana', 'カタカナ')}</Fld>
            <Fld label="メールアドレス" req bad={bd('pmail')}>{inp('pmail', 'アカウント発行の案内先')}</Fld>
            <Fld label="電話番号">{inp('ptel')}</Fld>
          </div></div></div>
          <div id="nfbrs">
            {f.branches.map((b, i) => {
              const p = `b${i}.`, vm = nfVm(b), trial = b.kubun === 'お試しキャンペーン';
              const bi = (k: keyof NfBranch, ph?: string, type = 'text') => <input type={type} value={b[k]} placeholder={ph} onChange={(e) => setB(i, { [k]: e.target.value })} />;
              return (
                <div className="card nf-br" key={i}>
                  <h2>拠点{i + 1}の申込内容<span className="sub">拠点ごとに1件の親契約になります</span>
                    {i > 0 && <span className="r"><Btn variant="outline" tone="negative" size="sm" onClick={() => { setF({ ...f, branches: f.branches.filter((_, k) => k !== i) }); setDirty(true); setBad([]); }}>この拠点を外す</Btn></span>}
                  </h2>
                  <div className="pad"><div className="frow">
                    <Fld label="契約区分" req err="契約区分を選んでください" bad={bd(p + 'kubun')}
                      hint="「切替（お試し→本導入）」は、お試し中の拠点を本導入へ切り替える申込です。登録すると受付の「切替」と同じ画面（拠点ごとに、同じ親契約の契約種別を本導入に切り替える）で進めます。">
                      <Sel value={b.kubun} opts={NF_KUBUN} ph="選択してください" onChange={(v) => setB(i, { kubun: v, ...(v === 'お試しキャンペーン' ? { plan: PLANS[0], course: 'ESライト', eq: /自販機/.test(b.eq) ? '冷蔵庫' : b.eq } : {}) })} />
                    </Fld>
                    <Fld label="拠点名" req bad={bd(p + 'name')}>{bi('name', '例）東京本社')}</Fld>
                    <Fld label="郵便番号" req bad={bd(p + 'zip')}>{bi('zip', '例）103-0027')}</Fld>
                    <Fld label="住所" req bad={bd(p + 'addr')}>{bi('addr', '都道府県から建物名まで')}</Fld>
                    <Fld label="プラン" req err="プランを選んでください" bad={bd(p + 'plan')}><Sel value={b.plan} opts={trial ? PLANS.slice(0, 1) : PLANS} ph="選択してください" onChange={(v) => setB(i, { plan: v })} /></Fld>
                    <Fld label="コース" req err="コースを選んでください" bad={bd(p + 'course')} hint={trial ? 'お試しはプラン50・ESライト（冷蔵庫）だけです。' : undefined}><Sel value={b.course} opts={trial ? ['ESライト'] : ['ESライト', 'ESスタンダード']} ph="選択してください" onChange={(v) => setB(i, { course: v })} /></Fld>
                    {/* 2026/10/01 R3（決定 28-19）：設備に自販機を選んだ拠点は、配送区分を ES配送便に固定（選択肢を出さない） */}
                    <Fld label="配送区分" req err="配送区分を選んでください" bad={bd(p + 'ship')} hint={vm ? '設備が自販機の拠点は ES配送便に固定です。選択肢は出しません。' : undefined}>
                      <Sel value={vm ? 'ES配送便' : b.ship} opts={['ES配送便', 'COOL便']} ph="選択してください" disabled={vm} onChange={(v) => setB(i, { ship: v })} />
                    </Fld>
                    <Fld label="納品不可曜日">{bi('ng', '例）土・日・祝日')}</Fld>
                    {/* REQ-CT-300（2026/10/02）：基準数のパターンは契約（申込）の時に決める。自販機は自販機の基準数なので出さない */}
                    <Fld label="設置フロア" req={vm} err="自販機の拠点は設置フロアを入れてください" bad={bd(p + 'floor')}><input value={b.floor ?? ''} placeholder="例）2F 給湯室" onChange={(e) => setB(i, { floor: e.target.value })} /></Fld>
                    {!vm && <Fld label="基準数のパターン" hint="短消費期限なし＝消費期限の短い商品をデフォルト注文に入れない。料金は変わらない。契約後は法人・拠点の画面（運営）でだけ変えられる"><Sel value={b.pattern || '通常'} opts={['通常', '短消費期限なし']} onChange={(v) => setB(i, { pattern: v })} /></Fld>}
                    <Fld label="設備の希望" req err="設備の希望を選んでください" bad={bd(p + 'eq')}><Sel value={b.eq} opts={trial ? NF_EQ.filter((x) => !/自販機/.test(x)) : NF_EQ} ph="選択してください" onChange={(v) => setB(i, { eq: v })} /></Fld>
                    <Fld label="開始サイクル月（希望）" req bad={bd(p + 'start')} hint="契約はサイクル単位のため日は選びません（A1＝その月の最初の月曜）">{bi('start', undefined, 'month')}</Fld>
                    <Fld label="拠点のご担当者" req wide err="氏名とメールアドレスを入れてください" bad={bd(p + 'staff')}>{bi('staff', '氏名・フリガナ・メール（例：鈴木 一郎・スズキ イチロウ・suzuki@example.jp）')}</Fld>
                    <Fld label="請求先" hint="法人なしの拠点は「この拠点」になります"><Sel value={b.billTo} opts={['法人', 'この拠点']} onChange={(v) => setB(i, { billTo: v })} /></Fld>
                    <Fld label="配送備考" wide><textarea value={b.note} placeholder="例）8:00〜10:00／通用口から搬入" onChange={(e) => setB(i, { note: e.target.value })} /></Fld>
                  </div></div>
                </div>
              );
            })}
          </div>
          <div style={{ margin: '-0.285714rem 0 1.142857rem' }}><Btn variant="outline" icon="Plus" onClick={() => { setF({ ...f, branches: [...f.branches, nfBlankBranch()] }); setDirty(true); }}>拠点を追加</Btn></div>
          <div className="card"><h2>添付資料<span className="sub">任意</span></h2><div className="pad"><div className="frow">
            <Fld label="申込書（紙・PDF）">{inp('doc', 'ファイルを選択')}</Fld>
            <Fld label="搬入経路資料・設置場所写真">{inp('photo', 'ファイルを選択')}</Fld>
          </div></div></div>
        </div>
      </div>
      {leave && <DiscardModal onCancel={() => setLeave(false)} onOk={() => { setLeave(false); setDirty(false); toList(); }} />}
    </div>
  );
}
