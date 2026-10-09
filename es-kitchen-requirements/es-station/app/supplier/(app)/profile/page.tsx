'use client';

import { useState } from 'react';
import { api } from '@/lib/api/supplier';
import { MAIL_RE } from '@/lib/supplier/orders';
import { useSignedIn } from '@/lib/supplier/store';
import type { Supplier } from '@/lib/supplier/types';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { DiscardModal } from '../../_components/modals';
import { Badge, Field, Icon, Notice, PageHead } from '../../_components/ui';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

type TextKey = { [K in keyof Supplier]-?: Supplier[K] extends string ? K : never }[keyof Supplier];

/** S08 プロフィール（運営の仕入先マスタと同じ項目）。編集は写しに書き、入力チェックを通ったら保存（RV-SUP S-a） */
export default function ProfilePage() {
  const { me, setMe, toast, toastError, openModal } = useSignedIn();
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Supplier | null>(null);
  const [e, setE] = useState<Record<string, string>>({});
  const ed = !!draft && draft.id === me.id;
  const s = ed ? draft! : me;
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：編集で変えて保存していないとき（キャンセル・サイドメニュー・ブラウザを閉じる） */
  const dirty = ed && JSON.stringify(draft) !== JSON.stringify(me);
  useLeaveGuard(dirty);
  const cancel = () => { const go = () => { setDraft(null); setE({}); }; if (dirty) openModal(<DiscardModal onOk={go} />); else go(); };
  const lockHint = ed ? '運営で管理している項目です（変更は運営へご連絡ください）' : '';

  const setField = (k: TextKey, v: string) => setDraft({ ...s, [k]: v });
  const setContact = (i: number, k: 'name' | 'kana' | 'mail' | 'tel', v: string) =>
    setDraft({ ...s, contacts: s.contacts.map((c, j) => (j === i ? { ...c, [k]: v } : c)) });

  const f = (k: TextKey, l: string, o: { lock?: boolean; req?: boolean; full?: boolean } = {}) => (
    <Field label={l} req={o.req && ed} err={e[k]} hint={o.lock ? lockHint : ''} full={o.full}>
      <input className={`inp ${e[k] ? 'err' : ''}`} value={s[k]} readOnly={!ed || o.lock} onChange={(ev) => setField(k, ev.target.value)} />
    </Field>
  );
  const locked = (l: string, v: string) => (
    <Field label={l} hint={lockHint}><input className="inp" readOnly value={v} /></Field>
  );

  const save = async () => {
    const t = (v: string) => v.trim();
    const x: Supplier = { ...s, contacts: s.contacts.map((c) => ({ ...c, name: t(c.name), kana: t(c.kana), mail: t(c.mail), tel: t(c.tel) })) };
    (['zip', 'tel', 'addr', 'factory'] as const).forEach((k) => (x[k] = t(x[k])));
    const er: Record<string, string> = {};
    (['zip', 'tel', 'addr', 'factory'] as const).forEach((k) => { if (!x[k]) er[k] = '入力してください'; });
    x.contacts.forEach((c, i) => {
      (['name', 'kana', 'mail', 'tel'] as const).forEach((k) => { if (!c[k]) er['c' + i + k] = '入力してください'; });
      if (c.mail && !MAIL_RE.test(c.mail)) er['c' + i + 'mail'] = '形式が正しくありません';
    });
    setE(er);
    if (Object.keys(er).length) return setDraft(x);
    setBusy(true);
    try {
      setMe(await api.updateSupplier(x));
      setDraft(null);
      toast('プロフィールを保存しました（運営の仕入先マスタに反映）');
    } catch (ex) {
      toastError(ex);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead crumbs={['プロフィール']} title="プロフィール">
        {!ed && <button className="btn pri" onClick={() => { setDraft(structuredClone(me)); setE({}); }}>編集する</button>}
      </PageHead>
      <Notice kind="pur">
        運営の「仕入先マスタ」に登録されている内容です。
        {ed ? '編集できるのは、白い入力欄の項目です。' : '「編集する」で、連絡先（電話・メール・担当者・住所）を更新できます（保存すると運営のマスタに反映されます）。'}
      </Notice>

      <div className="card">
        <h2>基本情報</h2>
        <div className="fg c3">
          {f('id', '仕入先ID', { lock: true })}{f('name', '会社名（仕入先名）', { lock: true })}{f('kana', '会社名フリガナ', { lock: true })}
          {f('rep', '代表者名', { lock: true })}{f('corpNo', '法人番号', { lock: true })}{f('status', 'ステータス', { lock: true })}
          {locked('取引開始日', fmtDate(s.since))}{locked('最終ログイン', fmtDateTime(s.lastLogin))}
        </div>
      </div>

      <div className="card">
        <h2>仕入れ先の区分・取扱</h2>
        <div className="fg">{f('kind', '仕入れ先区分', { lock: true })}{f('goods', '作れる商品', { lock: true })}</div>
        <div className="hint" style={{ marginTop: '0.571429rem' }}>
          区分は商品ごとに決まります（通常商品＝サイクル×倉庫で発注、短消費期限商品＝1倉庫×1納品日で発注、資材＝随時）。1社で通常商品と短消費期限商品の両方を扱えます。
        </div>
        <div className="fg" style={{ marginTop: '0.857143rem' }}>{f('cert', '保有している許可・認証', { lock: true, full: true })}</div>
      </div>

      <div className="card">
        <h2>会社情報</h2>
        <div className="fg c3">
          {f('zip', '郵便番号', { req: true })}{f('tel', '代表電話番号', { req: true })}<div />
          <div style={{ gridColumn: '1/-1' }}>{f('addr', '本社住所', { req: true })}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.857143rem', marginBottom: '0.857143rem' }}>
          <h2 style={{ margin: 0 }}>担当者情報</h2>
          <span style={{ flex: 1 }} />
          {ed && <button className="btn sm out" onClick={() => setDraft({ ...s, contacts: [...s.contacts, { kind: 'サブ担当者', name: '', kana: '', mail: '', tel: '' }] })}>+ サブ担当者を追加</button>}
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>区分</th><th>担当者名</th><th>フリガナ</th><th>メールアドレス</th><th>電話番号</th><th /></tr></thead>
            <tbody>
              {s.contacts.map((c, i) => (
                <tr key={i}>
                  <td><Badge v={c.kind} cls={c.kind === 'メイン担当者' ? 'b-pur' : 'b-mute'} /></td>
                  {(['name', 'kana', 'mail', 'tel'] as const).map((k) => (
                    <td key={k}>
                      <input className={`inp ${e['c' + i + k] ? 'err' : ''}`} value={c[k]} readOnly={!ed} style={{ minWidth: k === 'mail' ? '15.714286rem' : '9.285714rem' }} onChange={(ev) => setContact(i, k, ev.target.value)} />
                      {e['c' + i + k] && <div className="errmsg">{e['c' + i + k]}</div>}
                    </td>
                  ))}
                  <td>
                    {ed && c.kind !== 'メイン担当者' && (
                      <button className="icon-btn" aria-label="削除" onClick={() => setDraft({ ...s, contacts: s.contacts.filter((_, j) => j !== i) })}><Icon name="x" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hint" style={{ marginTop: '0.571429rem' }}>発注・本発注・お知らせのメール通知は、メイン担当者に届きます（サブ担当者にも届けるかは要確認）。</div>
      </div>

      <div className="card">
        <h2>出荷・納品の条件</h2>
        <div className="fg">
          {f('factory', '出荷元（製造所・倉庫）の住所', { req: true, full: true })}
          {f('days', '出荷できる曜日', { lock: true })}
          {locked('納品できる倉庫', s.whs)}
          {locked('標準の配送方法', s.defMethod)}
          {locked('標準の運送会社', s.defCarrier)}
          {locked('土日祝を営業日とするか', s.bizDay)}
        </div>
      </div>

      <div className="card">
        <h2>取引・支払条件</h2>
        <div className="fg c3">
          {locked('締め日', s.close)}{locked('支払条件', s.pay)}
        </div>
      </div>

      <div className="card">
        <h2>取扱商品（商品マスタ）</h2>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>品番</th><th>商品名</th><th>保管方法</th><th>区分</th><th className="num">入り数（ロット）</th></tr></thead>
            <tbody>
              {s.products.map(([id, n, k, t, lot]) => (
                <tr key={id}>
                  <td className="mono">{id}</td>
                  <td>{n}</td>
                  <td>{k}</td>
                  <td>
                    <Badge v={t.startsWith('短') ? '短消費期限' : t === '資材' ? '資材' : '通常'} />
                    {t.startsWith('短') && <span className="muted"> {t.slice(4)}</span>}
                  </td>
                  <td className="num">{lot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hint" style={{ marginTop: '0.571429rem' }}>商品の追加・変更は運営が行います。</div>
      </div>

      {ed ? (
        <div style={{ display: 'flex', gap: '0.857143rem', justifyContent: 'flex-end' }}>
          <button className="btn lg" onClick={cancel}>キャンセル</button>
          <button className="btn pri lg" disabled={busy} onClick={save}>保存する</button>
        </div>
      ) : (
        <div className="hint">パスワードを変えたいときは、ログイン画面の「パスワードを忘れた方」から再設定してください（認証コード：4桁・有効期限5分）。</div>
      )}
    </>
  );
}
