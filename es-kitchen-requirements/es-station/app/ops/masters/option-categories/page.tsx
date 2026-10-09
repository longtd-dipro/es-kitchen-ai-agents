'use client';

import { useState } from 'react';
import master from '@/lib/domain/areas/master';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { Option, OptionCategory } from '@/lib/domain/types';
import { Badge, Button, Card, ConfirmDiscard, Dialog, Field, Head, Inp, Pager, RowActions, Sel, Table, Td } from '../../menu/_components/es';
import { useKeep, useMenu } from '../../menu/_components/MenuProvider';
import { Loading } from '../../menu/_components/parts';
import { useCanAct } from '../../_ui/perm';
import { useOps } from '../../_ui/OpsProvider';
import { esTone } from '@/lib/format/status';

/*
 * マスタ管理 ＞ オプション区分マスタ（台帳 F「オプション区分の持ち方」2026-10-05・受付簿 #117）。
 *   名前・並び順・使用中／終了。オプションマスタの「オプション区分」はここから選ぶ（使用中だけ）。運営（システム管理）が足せる。
 *   選択肢・請求書の並びは 並び順 → オプションID（「表示順」の欄は持たない：受付簿 #118）。
 *   削除は置かない（使っているオプションがあるため「終了」にする）。データは共通データ dm.master.optionCategories（master.create／update）
 */
const api = domainApi(master);
const KIND = 'optionCategories' as const;
type Draft = { id: string; name: string; sortNo: string; status: OptionCategory['status'] };
type ModalS = null | { type: 'edit'; d: Draft; orig: Draft | null; err: Record<string, string> } | { type: 'discard'; back: { d: Draft; orig: Draft | null; err: Record<string, string> } };

const nextId = (list: OptionCategory[]) => `OC${String(Math.max(0, ...list.map((c) => Number(c.id.slice(2)) || 0)) + 1).padStart(6, '0')}`;

export default function OptionCategoriesPage() {
  const { toast, toastError } = useMenu();
  const { account } = useOps();
  const canAct = useCanAct();
  const { data: cats } = useDomainQuery(api, 'list', { kind: KIND });
  const { data: opts } = useDomainQuery(api, 'list', { kind: 'options', includeDeleted: true });
  const [pg, setPg] = useKeep('optcat.pg', 1);
  const [per, setPer] = useKeep('optcat.per', 10);
  const [modal, setModal] = useState<ModalS>(null);
  if (!cats || !opts) return <Loading />;
  const list = ([...(cats as OptionCategory[])]).sort((a, b) => a.sortNo - b.sortNo || a.id.localeCompare(b.id));
  const shown = list.slice((pg - 1) * per, pg * per);
  const used = (name: string) => (opts as Option[]).filter((o) => o.category === name && o.status !== '削除済').length;
  const close = () => setModal(null);
  const blank = (): Draft => ({ id: '', name: '', sortNo: String((Math.max(0, ...list.map((c) => c.sortNo)) || 0) + 10), status: '使用中' });
  const draftOf = (c: OptionCategory): Draft => ({ id: c.id, name: c.name, sortNo: String(c.sortNo), status: c.status });
  const canWrite = canAct(api, 'update', { kind: KIND });

  const save = async (m: { d: Draft; orig: Draft | null; err: Record<string, string> }) => {
    const err: Record<string, string> = {};
    const name = m.d.name.trim(), sortNo = Number(m.d.sortNo);
    if (!name) err.name = 'オプション区分の名前は必須項目です。';
    else if (list.some((c) => c.id !== m.d.id && c.name === name)) err.name = `オプション区分「${name}」はもうあります。`;
    if (m.d.sortNo.trim() === '' || !Number.isInteger(sortNo) || sortNo < 0) err.sortNo = '並び順は 0以上の整数で入力してください。';
    if (Object.keys(err).length) { setModal({ type: 'edit', ...m, err }); return; }
    try {
      if (m.orig) await api.action('update', { kind: KIND, id: m.d.id, patch: { name, sortNo, status: m.d.status }, by: account?.id ?? '運営' });
      else await api.action('create', { kind: KIND, data: { id: nextId(list), name, sortNo, status: m.d.status }, by: account?.id ?? '運営' });
      close();
      toast('データの保存が正常に完了しました。');
    } catch (e) { toastError(e); }
  };

  return (
    <>
      <Head crumb={['マスタ管理', 'オプション区分マスタ']} title="オプション区分マスタ" actions={<>
        {/* 権限がなければ出さない（プラン管理の作成） */}
        {canAct(api, 'create', { kind: KIND }) && <Button icon="Plus" size="lg" onClick={() => setModal({ type: 'edit', d: blank(), orig: null, err: {} })}>新規登録</Button>}
      </>} />
      <Card>
        <p className="mo-note">オプションマスタの「オプション区分」の選択肢です（使用中だけ選べます）。オプションの選択肢・請求書の並びは、区分の並び順 → オプションID です。使っているオプションがある区分は削除せず「終了」にします。</p>
        <Table
          cols={[{ label: 'No', w: 48 }, { label: 'オプション区分ID' }, { label: '名前' }, { label: '並び順', cls: 'r' }, { label: '状態' }, { label: '使っているオプション', cls: 'r' }, { label: '操作', w: 96 }]}
          rows={shown.map((c, i) => (
            <tr key={c.id}>
              <Td v={(pg - 1) * per + i + 1} />
              <Td v={c.id} cls="es-mono" />
              <Td v={<b>{c.name}</b>} />
              <Td v={c.sortNo} cls="r" />
              <Td v={<Badge tone={esTone(c.status)}>{c.status}</Badge>} />
              <Td v={`${used(c.name)}件`} cls="r" />
              <td><RowActions label={c.name} onEdit={canWrite ? () => setModal({ type: 'edit', d: draftOf(c), orig: draftOf(c), err: {} }) : undefined} /></td>
            </tr>
          ))}
        />
        <Pager total={list.length} page={pg} per={per} onPage={setPg} onPer={(n) => { setPer(n); setPg(1); }} />
      </Card>

      {modal?.type === 'edit' ? (
        <EditDialog m={modal} set={(m) => setModal({ type: 'edit', ...m })} onClose={close} onDiscard={(m) => setModal({ type: 'discard', back: m })} onSave={save} blank={blank()} />
      ) : null}
      {modal?.type === 'discard' ? <ConfirmDiscard onCancel={() => setModal({ type: 'edit', ...modal.back })} onConfirm={close} /> : null}
    </>
  );
}

/** オプション区分 登録・編集 */
function EditDialog({ m, set, onClose, onDiscard, onSave, blank }: {
  m: { d: Draft; orig: Draft | null; err: Record<string, string> }; set: (m: { d: Draft; orig: Draft | null; err: Record<string, string> }) => void;
  onClose: () => void; onDiscard: (m: { d: Draft; orig: Draft | null; err: Record<string, string> }) => void; onSave: (m: { d: Draft; orig: Draft | null; err: Record<string, string> }) => void; blank: Draft;
}) {
  const d = m.d, isNew = !m.orig;
  const up = (p: Partial<Draft>) => set({ ...m, d: { ...d, ...p } });
  const tryClose = () => { if (JSON.stringify(d) !== JSON.stringify(m.orig || blank)) onDiscard(m); else onClose(); };
  return (
    <Dialog title={isNew ? 'オプション区分 登録' : 'オプション区分 編集'} width={560} onClose={tryClose}
      footer={<div className="mo-row mo-right"><Button variant="outline" onClick={tryClose}>キャンセル</Button><Button onClick={() => onSave(m)}>{isNew ? '登録する' : '保存'}</Button></div>}>
      <div className="od-dlg">
        <Field label="オプション区分ID"><Inp value={d.id} disabled placeholder="登録時に自動で採番します" /></Field>
        <Field label="名前" required error={m.err.name}><Inp value={d.name} placeholder="例）配送" maxLength={40} onChange={(e) => up({ name: e.target.value })} /></Field>
        <Field label="並び順" required error={m.err.sortNo} helper="小さい順に並びます（同じ並び順はオプションID 順）"><Inp inputMode="numeric" value={d.sortNo} onChange={(e) => up({ sortNo: e.target.value.replace(/\D/g, '') })} /></Field>
        <Field label="状態" required helper="終了にすると、オプションマスタの選択肢に出なくなります（登録済みのオプションはそのまま）">
          <Sel value={d.status} options={['使用中', '終了']} onChange={(e) => up({ status: e.target.value as Draft['status'] })} />
        </Field>
      </div>
    </Dialog>
  );
}
