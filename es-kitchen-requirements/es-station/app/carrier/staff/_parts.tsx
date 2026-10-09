'use client';

import type { Errors } from '@/lib/carrier/logic';
import type { StaffDraft } from '@/lib/carrier/types';
import { Icon } from '../_ui/Icon';
import { useCarrier } from '../_ui/CarrierProvider';
import { Collap, Lic, Modal } from '../_ui/parts';

/**
 * 配送スタッフの基本情報・ログイン情報（元の staffForm）。
 * edit＝入力できる、isNew＝登録（IDは自動採番・ログインIDと最終ログインは出さない）
 */
export function StaffForm({ s, id, last, edit, isNew, errs, onChange, org }: {
  s: StaffDraft; id?: string; last?: string; edit: boolean; isNew?: boolean; errs: Errors; org: string; onChange: (p: Partial<StaffDraft>) => void;
}) {
  const err = (k: string) => (errs[k] ? <span className="err">{errs[k]}</span> : null);
  const f = (l: string, k: 'name' | 'kana' | 'tel' | 'email', req: boolean, ph?: string) => (
    <div className="fld">
      <label htmlFor={`sf_${k}`}>{l}{req && <span className="req">*</span>}</label>
      <input className="inp" id={`sf_${k}`} readOnly={!edit} value={s[k] ?? ''} placeholder={ph ?? l} onChange={(e) => onChange({ [k]: e.target.value })} />
      {err(`sf_${k}`)}
    </div>
  );
  const sel = (l: string, k: 'kbn' | 'st', opts: string[]) => (
    <div className="fld">
      <label htmlFor={`sf_${k}`}>{l}<span className="req">*</span></label>
      <select className="inp" id={`sf_${k}`} disabled={!edit} value={s[k]} onChange={(e) => onChange({ [k]: e.target.value })}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );
  const licBox = isNew || edit ? (
    <label className="licup" htmlFor="sf_lic">
      {s.lic ? <Lic on big /> : <><Icon name="plus" /><span>写真を追加</span></>}
      <input type="file" id="sf_lic" accept="image/*" hidden onChange={(e) => { if (e.target.files?.[0]) onChange({ lic: 1 }); }} />
    </label>
  ) : <Lic on={s.lic} big />;
  return (
    <>
      <Collap title="基本情報">
        <div className="grid3">
          <div className="fld"><span className="lb">配送スタッフID</span><input className="inp" readOnly value={isNew ? '' : id ?? ''} placeholder="配送スタッフID（自動採番）" aria-label="配送スタッフID" /></div>
          {f('配送スタッフ名', 'name', true)}{f('配送スタッフ名カナ', 'kana', true)}
          <div className="fld"><span className="lb">所属先・区分</span><input className="inp" readOnly value={org} aria-label="所属先・区分" /></div>
          {sel('雇用形態', 'kbn', ['社員', '個人事業主'])}{sel('ステータス', 'st', ['有効', '無効', '利用停止', '免許未登録'])}{f('電話番号', 'tel', false)}
          <div className="fld span3"><span className="lb">免許証<span className="req">*</span></span>{licBox}{err('sf_lic')}</div>
        </div>
      </Collap>
      <Collap title="ログイン情報">
        <div className="grid3">
          {!isNew && <div className="fld"><span className="lb">ログインID</span><input className="inp" readOnly value={id ?? ''} aria-label="ログインID" /></div>}
          {f('メールアドレス', 'email', true, 'sample@email.com')}
          {!isNew && <div className="fld"><span className="lb">最終ログイン日時</span><input className="inp" readOnly value={last ?? ''} aria-label="最終ログイン日時" /></div>}
        </div>
      </Collap>
    </>
  );
}

/** 削除の確認（RV-CARRIER-20261002 K-c：担当中の配送・貸与中の保冷バッグがあると削除できない） */
export function StaffDeleteModal({ name, id, block, onClose, onOk }: { name: string; id: string; block: string; onClose: () => void; onOk: () => void }) {
  useCarrier();
  if (block) {
    return (
      <Modal onClose={onClose} cls="sm">
        <div className="mb" style={{ paddingTop: '1.714286rem' }}>
          <div className="big-ic" style={{ background: 'color-mix(in srgb,var(--amber) 18%,transparent)', color: 'var(--amber)' }}><Icon name="warn" /></div>
          <b>{name}（{id}）は削除できません</b>
          <p style={{ margin: 0, fontSize: '0.928571rem' }}>{block}があるため削除できません。先に付け替えてください。</p>
        </div>
        <footer style={{ border: 0 }}><button type="button" className="btn pri" style={{ flex: 1 }} onClick={onClose}>閉じる</button></footer>
      </Modal>
    );
  }
  return (
    <Modal onClose={onClose} cls="sm">
      <div className="mb" style={{ paddingTop: '1.714286rem' }}>
        <div className="big-ic" style={{ background: 'color-mix(in srgb,var(--red) 15%,transparent)', color: 'var(--red)' }}><Icon name="trash" /></div>
        <b>{name}（{id}）を削除しますか？</b>
        <p style={{ margin: 0, fontSize: '0.928571rem' }}>削除すると無効になり、このスタッフには配送を割り当てられなくなります（論理削除。一覧には「削除済」で残ります）。</p>
      </div>
      <footer style={{ border: 0 }}>
        <button type="button" className="btn" style={{ flex: 1 }} onClick={onClose}>キャンセル</button>
        <button type="button" className="btn pri" style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }} onClick={onOk}>削除する</button>
      </footer>
    </Modal>
  );
}
