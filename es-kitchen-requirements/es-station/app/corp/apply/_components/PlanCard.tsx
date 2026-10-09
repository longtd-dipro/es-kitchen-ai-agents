'use client';

import { Fragment, type ReactNode } from 'react';
import { DEV_TYPES, EQ_GRP, MODEL, NG_DAYS, SVC_OPT, VM_ESTIMATE_NOTE } from '@/lib/corp/docs/apply/data';
import { addableOf, capOK, destFields, eqInit, eqQty, inclOf, planFields, planOf, quoteOf, sizeChoices, yen } from '@/lib/corp/docs/apply/logic';
import type { ApplyBranch, ApplyState, FieldDef, FormErrors, Staff } from '@/lib/corp/docs/apply/types';
import { Fields, More, StaffTable } from './parts';

/* 契約（希望プラン）1件のカード。元の planCard と、それを5つの入力グループ（タブ）にまとめる compactApplySections */

export type Group = 'base' | 'equipment' | 'option' | 'delivery' | 'staff';
export const GROUPS: [Group, string][] = [['base', 'プラン'], ['equipment', '機種・設備'], ['option', 'オプション'], ['delivery', 'お届け先・搬入'], ['staff', 'ご担当者']];
const NEXT: Partial<Record<Group, [Group, string]>> = {
  base: ['equipment', '機種・設備へ'], equipment: ['option', 'オプションへ'], option: ['delivery', 'お届け先・搬入へ'], delivery: ['staff', 'ご担当者へ'],
};

/** カードの操作（ApplyForm が持つ） */
export type CardOps = {
  open: (i: number) => void;
  dup: (i: number) => void;
  section: (i: number, g: Group) => void;
  dev: (i: number, d: ApplyBranch['dev']) => void;
  set: (i: number, f: FieldDef, v: string) => void;
  zip: (scope: string) => void;
  inclSet: (i: number, grp: string, k: string) => void;
  eqGrp: (i: number, g: string) => void;
  eqAdd: (i: number, k: string, d: number) => void;
  svcTog: (i: number, k: string, on: boolean) => void;
  ngTog: (i: number, d: string, on: boolean) => void;
  fileAdd: (i: number) => void;
  fileDel: (i: number, j: number) => void;
  sameTog: (i: number, on: boolean) => void;
  staffSet: (scope: string, j: number, k: keyof Staff, v: string) => void;
  staffAdd: (scope: string) => void;
  staffDel: (scope: string, j: number) => void;
  gotoCorp: () => void;
};

type Props = {
  A: ApplyState;
  i: number;
  active: Group;
  eqOpen: Record<string, boolean>;
  errs: FormErrors;
  ops: CardOps;
};

export function PlanCard({ A, i, active, eqOpen, errs, ops }: Props) {
  const b = eqInit(structuredClone(A.branches[i]));
  const isT = A.kind === 'trial', dev = b.dev || 'rf', p = planOf(b), q = quoteOf(b);
  const sm = [b.pref, p.name, b.start].filter(Boolean).join('　／　');
  const store = b as unknown as Record<string, unknown>;

  /* セクション（見出し＋中身）。グループごとにまとめてタブで1つだけ見せる */
  const sec = (key: string, title: ReactNode, body: ReactNode) => (
    <Fragment key={key}>
      <div className="secttl" id={`sec-${i}-${key}`}>{title}</div>
      {body}
    </Fragment>
  );

  const base: ReactNode[] = [];
  if (!isT) {
    base.push(sec('dev', '設備タイプ', (
      <>
        <div className="devsw">
          {DEV_TYPES.map((d) => (
            <button key={d.v} type="button" className={`db${dev === d.v ? ' on' : ''}`} onClick={() => ops.dev(i, d.v)}>
              <b>{d.t}</b><span>{d.sub}</span>
            </button>
          ))}
        </div>
        {dev === 'vm' && (p.vm ? (
          <div className="note warn">
            <b>自動販売機は「{p.name.replace('（ESライト）', '（ESライト（自販機））')}」の料金（月額 {yen(p.vm.fee)}・ES配送便）に、自販機月額料金（{yen(p.vm.lease)}{p.vm.units > 1 ? ` × ${p.vm.units}台` : ''}）がかかります。初期料金 {yen(p.vm.init)} が初回のご請求で1回かかります。</b>
            設置の前に<b>現場調査</b>を行います。調査の結果・自販機の在庫状況により、ご要望にお応えできない場合や、対応までにお時間をいただく場合があります。
            <br /><b>{VM_ESTIMATE_NOTE}</b>
          </div>
        ) : (
          <div className="note warn"><b>このプランでは自動販売機をお選びいただけません。</b>ご検討の場合は担当者にご相談ください（別途お見積り）。</div>
        ))}
      </>
    )));
  }
  base.push(sec('plan', '契約内容', <Fields list={planFields(A, i)} store={store} errs={errs.fields} onSet={(f, v) => ops.set(i, f, v)} onZip={ops.zip} />));

  /* 設備 — プランに含まれる分と、追加でご希望の分に分ける */
  const equipment: ReactNode[] = [];
  equipment.push(sec('incl', <>プランに含まれる設備<span className="mm">無料貸し出し・台数はプランで決まります</span></>, (
    <>
      {inclOf(b).map((r, n) => {
        const m = MODEL[r.k], baseM = MODEL[r.baseK];
        if (!m) return null;
        const ch = sizeChoices(m.grp), meals = Number(b.meals || 100);
        return (
          <div key={n} className={`eqrow incl${r.diff ? ' up' : ''}`}>
            <div className="ei">
              <div className="en">
                <span className="idc">{m.code}</span> {m.label}
                {!!r.diff && <span className="bg amb">サイズ差額 +{yen(r.diff)}／月</span>}
              </div>
              <div className="es">{m.spec}{m.cap ? '／最大収納数 ' + m.cap + '個' : ''}</div>
              {ch.length > 1 ? (
                <>
                  <div className="szrow">
                    <span className="szl">サイズ</span>
                    <select className="szsel" value={m.k} onChange={(e) => ops.inclSet(i, m.grp, e.target.value)}>
                      {ch.map((x) => {
                        const ok = capOK(b, x), up = x.fee == null || baseM.fee == null ? 0 : Math.max(0, x.fee - baseM.fee);
                        return (
                          <option key={x.k} value={x.k} disabled={!ok}>
                            {x.label + (x.cap ? '（' + x.cap + '個）' : '') + (ok ? (up ? '　差額 +' + yen(up) + '／月' : '　無料') : '　※' + meals + '個には容量が足りません')}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="szh">無料は <b>{baseM.label}</b>。上のサイズは差額だけご請求します</div>
                </>
              ) : (
                <div className="eh">{p.name} に含まれます</div>
              )}
            </div>
            <div className="ep">{r.diff ? <><b>+{yen(r.diff)}</b>／月</> : <span className="bg grn">無料</span>}</div>
            <div className="eq"><span className="bg mut">{r.qty} {m.unit || '台'}</span></div>
          </div>
        );
      })}
      <div className="note mut" style={{ marginBottom: '0.428571rem' }}>
        {String(b.course || '') === 'スタンダード'
          ? <><b>スタンダードは 冷蔵庫1台＋冷凍庫1台</b>が無料です。</>
          : <><b>ライトは 冷蔵庫1台</b>が無料です（冷凍庫はスタンダードに含まれます）。</>}
        サイズは、ご契約の食数が入るものからお選びいただけます（<b>冷蔵庫はご契約の食数、冷凍庫はそのうち冷凍でお届けする分</b>で判定します）。
      </div>
      <More label="サイズ・台数のきまり">
        <b>台数はご契約のプランで決まります。</b>コースを変えると、無料でお貸し出しする設備も変わります。<br />
        <b>標準より大きいサイズ</b>をお選びの場合は、本体の料金ではなく<b>差額だけ</b>をご請求します（標準より小さいサイズを選んで差額がマイナスになる場合は、ご請求も返金もしません。0円として扱い、マイナスの差額はお出ししません）。<br />
        <b>容量が足りないサイズをご希望の場合も、ご相談いただけます。</b>この画面ではお選びいただけませんが、下の「プラン外の備考」にご記入いただくか、お問い合わせください。お届けの頻度や在庫の置き方によっては、ESキッチンで調整できる場合があります。<br />
        <b>設備には設備ごとの最低利用期間があります。</b>ご契約の途中で設備を入れ替えたり足したりすると、その設備の最低利用期間は<b>設置の日からあらためて数えます</b>。ご契約の満了日より後になることもあり、その場合は満了日より前の解約でその設備ぶんの違約金がかかります。お申し込みの前に、お見積りに出る満了日をご確認ください。
      </More>
    </>
  )));
  equipment.push(sec('add', <>追加でご希望の設備<span className="mm">有料・台数をお選びください</span></>, (
    <>
      <div className="note mut" style={{ marginTop: 0 }}>
        <b>資材ボックス</b>（仕切り皿・深皿・フード類・カゴ）は、<b>初期セットをESキッチンが自動で手配します</b>。この画面では選べません。追加が必要になったときは、ご契約後の「変更のお申し込み（設備の変更）」からお申し込みください。
      </div>
      <EqGroups b={b} i={i} eqOpen={eqOpen} ops={ops} />
    </>
  )));

  const option = [sec('svc', 'その他オプション', (
    <>
      {SVC_OPT.filter((o) => o.dev.indexOf(dev) >= 0).map((o) => {
        const on = !!(b._so || {})[o.k];
        return (
          <label key={o.k} className={`svco${on ? ' on' : ''}`}>
            <input type="checkbox" checked={on} onChange={(e) => ops.svcTog(i, o.k, e.target.checked)} />
            <span className="sl">{o.label}{o.a && o.link ? <i className="svn">拠点の「{o.link}」を「利用する」にします</i> : null}</span>
            <span className="sp">{o.fee === null ? <span className="bg amb">別途見積</span> : (o.once ? '1回 +' : '月額 +') + yen(o.fee)}</span>
          </label>
        );
      })}
      <More label="初期費用について">
        <b>設置代行（税込 22,000円）の要否はESキッチンが確認します。</b>お申し込みの内容を確認したうえで、担当者からご案内します。
      </More>
    </>
  ))];

  const fs = b._files || [];
  const delivery = [
    sec('dest', 'お届け先情報', (
      <>
        <Fields list={destFields(A, i)} store={store} errs={errs.fields} onSet={(f, v) => ops.set(i, f, v)} onZip={ops.zip} />
        <div className="fld wide">
          <div className="fl">お届けできない曜日</div>
          <div className="ckgrp">
            {NG_DAYS.map((d) => (
              <label key={d} className={`ckd${b._ng?.[d] ? ' on' : ''}`}>
                <input type="checkbox" checked={!!b._ng?.[d]} onChange={(e) => ops.ngTog(i, d, e.target.checked)} />{d}
              </label>
            ))}
          </div>
        </div>
      </>
    )),
    sec('file', '搬入経路・添付資料', (
      <div className="fileup">
        <div className="fu">
          <span className="ico">☁</span>JPG・PNG・PDF（最大5MB）をアップロード
          <button type="button" className="btn" style={{ marginLeft: 'auto' }} onClick={() => ops.fileAdd(i)}><span className="ico">＋</span>ファイル選択</button>
        </div>
        <div className="fumeta"><span>{fs.length} / 10 ファイル</span><span>最大10ファイル</span></div>
        {fs.map((f, j) => (
          <div key={j} className="furow">
            <span className="fn">{f.n}</span><span className="fs">{f.s}</span>
            <button type="button" className="fx" onClick={() => ops.fileDel(i, j)}>×</button>
          </div>
        ))}
      </div>
    )),
  ];

  const staff = [sec('staff', '拠点のご担当者', (
    <>
      <label className={`ckline${b._same ? ' on' : ''}`} style={{ marginBottom: '0.642857rem' }}>
        <input type="checkbox" checked={!!b._same} onChange={(e) => ops.sameTog(i, e.target.checked)} />
        <span>
          <b>法人の担当者情報と同じ</b>
          <div style={{ fontWeight: 400, color: '#5A6673', marginTop: 2 }}>チェックすると、法人のご情報で入力する担当者をこの拠点の担当者としても使います。</div>
        </span>
      </label>
      {b._same ? <SameStaffNote A={A} onEdit={ops.gotoCorp} /> : (
        <StaffTable
          scope={'b' + i}
          rows={b._st && b._st.length ? b._st : [{ kind: 'メイン担当者' }]}
          err={errs.staff['b' + i]}
          note={<><b>メイン担当者1名が必須です。</b>ログイン案内メールは、この拠点のメイン・サブ・請求担当者の全員にお送りします。{b.bill === 'この拠点に請求' && <b>請求書がこの拠点あてなので、請求担当者も必要です。</b>}</>}
          onSet={(j, k, v) => ops.staffSet('b' + i, j, k, v)}
          onAdd={() => ops.staffAdd('b' + i)}
          onDel={(j) => ops.staffDel('b' + i, j)}
        />
      )}
    </>
  ))];

  const groups: Record<Group, ReactNode[]> = { base, equipment, option, delivery, staff };
  return (
    <div className={`brc ${b._o ? 'open' : 'closed'}`} data-branch={i}>
      <div className="bh" onClick={() => ops.open(i)}>
        <span className="no">希望プラン {i + 1}</span>
        <span className="nm">{b.name || '（お届け先名 未入力）'}</span>
        {sm && <span className="sm">{sm}</span>}
        <span className={`bg ${dev === 'vm' ? 'amb' : 'blue'}`}>{dev === 'vm' ? '自動販売機' : '冷蔵庫・冷凍庫'}</span>
        <span className="r">
          <span className={`bg ${q.byQuote ? 'amb' : 'grn'}`}>{q.byQuote ? '別途見積' : yen(q.total) + '/月'}</span>
          <button type="button" className="btn sm" onClick={(e) => { e.stopPropagation(); ops.dup(i); }}>複製</button>
          <span className={`bg ${b._o ? 'blue' : 'mut'}`}>{b._o ? '閉じる' : '開く'}</span>
        </span>
      </div>
      <div className="bb">
        <div className="cardnav" data-branch={i}>
          <div className="tabtrack" role="tablist" aria-label="契約の入力項目">
            {GROUPS.map(([g, t], n) => (
              <button key={g} type="button" id={`tab-${i}-${g}`} className={`cnb${active === g ? ' on' : ''}`} role="tab" data-group={g} data-index={n}
                aria-selected={active === g} aria-controls={`panel-${i}-${g}`} onClick={() => ops.section(i, g)}>
                <span className="ni">{n + 1}</span><span className="nt">{t}</span>
              </button>
            ))}
          </div>
        </div>
        {isT && <div className="note mut" style={{ marginTop: 0 }}>お試しキャンペーンの設備は<b>冷蔵庫・冷凍庫</b>です（自動販売機はお選びいただけません）。</div>}
        {GROUPS.map(([g]) => (
          <div key={g} className={`formsection${active === g ? ' on' : ''}`} data-group={g} role="tabpanel" id={`panel-${i}-${g}`} aria-labelledby={`tab-${i}-${g}`} aria-hidden={active !== g}>
            {groups[g]}
            {NEXT[g] && (
              <div className="sectionfoot">
                <a className="lk secnext" onClick={() => ops.section(i, NEXT[g]![0])}>{NEXT[g]![1]} <span aria-hidden="true">›</span></a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** 追加でご希望の設備は種類ごとにまとめる。台数が入っているまとまりは開いたままにする */
function EqGroups({ b, i, eqOpen, ops }: { b: ApplyBranch; i: number; eqOpen: Record<string, boolean>; ops: CardOps }) {
  const ks = addableOf(b);
  return (
    <>
      {EQ_GRP.map((G) => {
        const list = ks.filter((k) => MODEL[k].grp === G.g);
        if (!list.length) return null;
        const picked = list.filter((k) => eqQty(b, k));
        const qty = picked.reduce((t, k) => t + eqQty(b, k), 0);
        const key = i + '_' + G.g;
        const open = eqOpen[key] !== undefined ? eqOpen[key] : qty > 0;
        const lo = list.map((k) => MODEL[k].fee).filter((f): f is number => f != null);
        const mn = Math.min(...lo), mx = Math.max(...lo);
        const price = !lo.length ? '別途見積' : mn === mx ? (mn ? yen(lo[0]) + '／台・月' : '無料') : yen(mn) + '〜' + yen(mx) + '／台・月';
        return (
          <div key={G.g} className={`eqgrp${open ? ' open' : ''}${qty ? ' has' : ''}`}>
            <button type="button" className="egh" onClick={() => ops.eqGrp(i, G.g)}>
              <span className="eg-c">{open ? '−' : '＋'}</span>
              <span className="eg-t">{G.t}</span>
              <span className="eg-n">{list.length}種類</span>
              {qty ? <span className="bg blue">選択中 {qty}</span> : <span className="eg-p">{price}</span>}
            </button>
            {!!qty && <div className="eg-sum">{picked.map((k) => MODEL[k].label + ' × ' + eqQty(b, k)).join('　／　')}</div>}
            <div className="eg-b">
              {list.map((k) => {
                const m = MODEL[k], n = eqQty(b, k);
                let inc = 0;
                inclOf(b).forEach((r) => { if (r.k === k) inc = r.qty; });
                return (
                  <div key={k} className={`eqrow${n ? ' on' : ''}`}>
                    <div className="ei">
                      <div className="en"><span className="idc">{m.code}</span> {m.label}</div>
                      <div className="es">{m.spec}{m.cap ? '／最大収納数 ' + m.cap + '個' : ''}</div>
                      <div className="eh">{inc ? 'プラン込み ' + inc + (m.unit || '台') + ' への追加分／' : ''}最大 {m.max}{m.unit || '台'}{m.term ? '／最低利用期間 ' + m.term + 'ヶ月' : ''}</div>
                    </div>
                    <div className="ep">{m.fee === null ? <span className="bg amb">別途見積</span> : m.fee ? yen(m.fee) + '／' + (m.unit || '台') + '・月' : <span className="bg grn">無料</span>}</div>
                    <div className="eq">
                      <button type="button" className="qb" onClick={() => ops.eqAdd(i, k, -1)}>−</button>
                      <span className="qn">{n}</span>
                      <button type="button" className="qb" onClick={() => ops.eqAdd(i, k, 1)}>＋</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** 「法人の担当者情報と同じ」のときに、その担当者が誰かを出す。法人のご情報は2ステップ目なので、まだ未入力のことがある */
function SameStaffNote({ A, onEdit }: { A: ApplyState; onEdit: () => void }) {
  const m = (A.corp._st || []).find((r) => r.kind === 'メイン担当者' && String(r.name || '').trim());
  if (m) {
    return (
      <div className="note ok" style={{ margin: 0 }}>
        <b>法人のメイン担当者を使います。</b><br />
        <b>{m.name}</b>{m.mail ? '　' + m.mail : ''}{m.tel ? '　' + m.tel : ''}
        　<a className="lk" onClick={onEdit}>法人のご情報を直す</a>
      </div>
    );
  }
  return (
    <div className="note warn" style={{ margin: 0 }}>
      <b>法人のご担当者は、次の「共通情報を設定」でご入力いただきます。</b><br />
      そこで入力された<b>メイン担当者</b>が、この拠点のご担当者になります。この拠点だけ別の方にする場合は、上のチェックを外してご入力ください。
    </div>
  );
}

