'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { DEMO } from '@/lib/demo';
import { catErrors, clone, type CatDraft } from '@/lib/ops/menu/logic';
import type { Category } from '@/lib/ops/menu/types';
import { useOpsCsvExport } from '../../_ui/csv';
import { isStale } from '@/lib/api/errors';
import { Area, Button, Card, ConfirmDelete, CsvButton, ConfirmDiscard, Dialog, Field, Head, Icon, Inp, Modal, Pager, RowActions, SaveErrorBar, Table, Td } from '../../menu/_components/es';
import { useKeep, useMenu } from '../../menu/_components/MenuProvider';
import { api, Loading, Thumb, useMaster } from '../../menu/_components/parts';
import { catImg } from '../../menu/_components/photo';
import { useCanAct, useScreenCan } from '../../_ui/perm';

type CatModal = { d: CatDraft; orig: (CatDraft & { ver?: string }) | null; err: Record<string, string> };
type ModalS = null | ({ type: 'cat' } & CatModal) | { type: 'catImg'; back: CatModal; src: string } | { type: 'catDiscard'; back: CatModal } | { type: 'delCat'; id: string } | { type: 'noDel'; n: number } | { type: 'stale'; back: CatModal };

/** マスタ管理 ＞ 商品カテゴリ管理 */
export default function CategoriesPage() {
  const { toast, toastError } = useMenu();
  const mm = useMaster();
  const canAct = useCanAct();
  const { data: cats } = useQuery(api, 'cats');
  const [pg, setPg] = useKeep('cat.pg', 1);
  const [per, setPer] = useKeep('cat.per', 10);
  const [modal, setModal] = useState<ModalS>(null);
  const router = useRouter();
  const csvExport = useOpsCsvExport();
  /* CSV取込は、この画面の「CSV取込」の権限があるときだけ出す */
  const canImport = useScreenCan()('csvImport');
  if (!mm || !cats) return <Loading />;
  const list = cats, shown = list.slice((pg - 1) * per, pg * per);
  const close = () => setModal(null);
  const blank = (): CatDraft => ({ id: '', name: '', order: list.length + 1, note: '', img: '' });

  async function saveCat(m: CatModal, force = false) {
    const err = catErrors(m.d, list);
    if (Object.keys(err).length) { setModal({ type: 'cat', ...m, err }); return; }
    try { await api.action('saveCat', { d: m.d, baseVersion: m.orig ? m.orig.ver ?? '0' : undefined, ...(force ? { force: true } : {}) }); close(); toast(m.orig ? '保存しました。' : '登録しました。'); }
    catch (e) {
      /* 他の人が先に保存していた（E31）：警告のモーダル。「上書きして保存」は force で送り直す */
      if (isStale(e)) setModal({ type: 'stale', back: m });
      else toastError(e);
    }
  }

  return (
    <>
      <Head crumb={['マスタ管理', '商品カテゴリ管理']} title="商品カテゴリ管理" actions={<>
        {/* CSV（lib/csv/master.ts の categories。保存は画面と同じ menu.saveCat）。取込はモーダルではなく画面（…/import） */}
        {canImport && <CsvButton kind="import" onClick={() => router.push('/ops/masters/categories/import')} />}
        <CsvButton onClick={() => csvExport<Category>({ screen: '商品カテゴリ管理', entity: 'categories', rows: list, keys: (c) => c.id })} />
        {canAct(api, 'saveCat') && <Button icon="Plus" size="lg" onClick={() => setModal({ type: 'cat', d: blank(), orig: null, err: {} })}>新規登録</Button>}
      </>} />
      <Card>
        <Table
          cols={[{ label: 'No', w: 48 }, { label: 'カテゴリ画像', w: 96 }, { label: '商品カテゴリID' }, { label: '商品カテゴリ名' }, { label: '登録商品数', cls: 'r' }, { label: '表示順', cls: 'r' }, { label: '備考' }, { label: '操作', w: 96 }]}
          rows={shown.map((c, i) => {
            /* 登録商品数＝このカテゴリを付けた商品（無効を含み、削除済を除く）。商品はカテゴリを ID で持つ（受付簿 #233） */
            const n = mm.M.products.filter((p) => !p.off && (p.catId ? p.catId === c.id : p.cat === c.name)).length;
            return (
              <tr key={c.id}>
                <Td v={(pg - 1) * per + i + 1} />
                <td>{c.img ? <Thumb src={catImg(c.img)} /> : '—'}</td>
                <Td v={c.id} cls="es-mono" />
                <Td v={<b>{c.name}</b>} />
                <Td v={n} cls="r" />
                <Td v={c.order} cls="r" />
                <td className="w">{c.note || '—'}</td>
                {/* 権限がなければ出さない */}
                <td><RowActions label={c.name} onEdit={canAct(api, 'saveCat') ? () => setModal({ type: 'cat', d: clone(c), orig: clone(c), err: {} }) : undefined}
                  onDelete={canAct(api, 'deleteCat') ? () => { if (n) setModal({ type: 'noDel', n }); else setModal({ type: 'delCat', id: c.id }); } : undefined} /></td>
              </tr>
            );
          })}
        />
        <Pager total={list.length} page={pg} per={per} opts={[10, 20, 50]} onPage={setPg} onPer={(n) => { setPer(n); setPg(1); }} />
        {DEMO ? <p className="mo-note">カテゴリの名前は「サラダ・果物」「飲料・甘味」（2026-10-06 客先確認）。カテゴリは法人Webの月次注文（商品の検索・AI の提案）でも同じものを使います。</p> : null}
      </Card>

      {modal?.type === 'cat' ? <CatDialog m={modal} list={list} blank={blank()} set={(m) => setModal({ type: 'cat', ...m })} onClose={close}
        onDiscard={(m) => setModal({ type: 'catDiscard', back: m })} onImg={(m, src) => setModal({ type: 'catImg', back: m, src })} onSave={saveCat} /> : null}
      {modal?.type === 'catImg' ? (
        <Dialog title="カテゴリ画像" width={560} onClose={() => setModal({ type: 'cat', ...modal.back })} footer={<Button variant="outline" onClick={() => setModal({ type: 'cat', ...modal.back })}>閉じる</Button>}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="mo-imgbig"><img src={modal.src} alt="" /></div>
        </Dialog>
      ) : null}
      {modal?.type === 'catDiscard' ? <ConfirmDiscard onCancel={() => setModal({ type: 'cat', ...modal.back })} onConfirm={close} /> : null}
      {/* 登録商品があるカテゴリは削除できない（E271。確認は出さず、理由のモーダルだけ：受付簿 #274） */}
      {modal?.type === 'noDel' ? (
        <Dialog title="削除できません" width={480} onClose={close} footer={<Button variant="outline" onClick={close}>閉じる</Button>}>
          <p className="mo-nodel">登録商品が{modal.n}件あるため削除できません。</p>
        </Dialog>
      ) : null}
      {modal?.type === 'stale' ? (
        <Modal title="内容が更新されています" confirmLabel="上書きして保存" cancelLabel="キャンセル" onCancel={() => setModal({ type: 'cat', ...modal.back })} onConfirm={() => { void saveCat(modal.back, true); }}>
          他のユーザーにより内容が更新されています。上書きすると保存されます。
        </Modal>
      ) : null}
      {modal?.type === 'delCat' ? <ConfirmDelete onCancel={close} onConfirm={async () => {
        const id = modal.id; close();
        try { await api.action('deleteCat', { id }); toast('削除が完了しました。'); } catch (e) { toastError(e); }
      }} /> : null}
    </>
  );
}

/** 商品カテゴリ登録・編集 */
function CatDialog({ m, list, blank, set, onClose, onDiscard, onImg, onSave }: { m: CatModal; list: Category[]; blank: CatDraft; set: (m: CatModal) => void; onClose: () => void; onDiscard: (m: CatModal) => void; onImg: (m: CatModal, src: string) => void; onSave: (m: CatModal) => void }) {
  const d = m.d, isNew = !m.orig, max = list.length + (isNew ? 1 : 0);
  const up = (p: Partial<CatDraft>) => set({ ...m, d: { ...d, ...p } });
  const tryClose = () => { if (JSON.stringify(d) !== JSON.stringify(m.orig || blank)) onDiscard(m); else onClose(); };
  /* 形式・5MB・長い辺 1200px を外れたファイルは追加しない（E268）。縮小はしない（受付簿 #236） */
  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const ng = () => set({ ...m, err: { ...m.err, img: 'PNG・JPEG・WebPの5MB以内・長い辺1200px以内にしてください。' } });
    if (!/image\/(png|jpeg|webp)/.test(f.type) || f.size > 5 * 1024 * 1024) { ng(); return; }
    const url = URL.createObjectURL(f);
    try {
      const im = new Image(); im.src = url; await im.decode();
      if (Math.max(im.width, im.height) > 1200) { ng(); return; }
    } catch { ng(); return; } finally { URL.revokeObjectURL(url); }
    const r = new FileReader();
    r.onload = () => { const { img: _drop, ...err } = m.err; void _drop; set({ ...m, d: { ...d, img: String(r.result) }, err }); };
    r.readAsDataURL(f);
  }
  return (
    <Dialog title={isNew ? '商品カテゴリ登録' : '商品カテゴリ編集'} width={680} onClose={tryClose}
      footer={<div className="mo-row mo-right"><Button variant="outline" onClick={tryClose}>キャンセル</Button><Button onClick={() => onSave(m)}>{isNew ? '登録する' : '保存'}</Button></div>}>
      <div className="od-dlg mo-catf">
        <SaveErrorBar n={Object.keys(m.err).length} />
        <Field label="商品カテゴリID"><Inp value={d.id} disabled placeholder="登録時に自動で採番します" /></Field>
        <Field label="商品カテゴリ名" required error={m.err.name}><Inp value={d.name} placeholder="商品カテゴリ名" onChange={(e) => up({ name: e.target.value })} /></Field>
        <Field label="表示順" required error={m.err.order} helper={'※現在の末尾：' + list.length + '番　※途中に追加すると、以降のカテゴリは自動的に繰り下がります。'}>
          <Inp type="number" min={1} max={max} value={d.order} onChange={(e) => up({ order: e.target.value })} />
        </Field>
        <Field label="備考" error={m.err.note}><Area value={d.note} placeholder="備考" onChange={(e) => up({ note: e.target.value })} /></Field>
        <Field label={<span>カテゴリ画像<small className="mo-upnote">アップロード可能形式：PNG・JPEG・WebP（最大5MB・長い辺 1200px 以内・1枚まで）</small></span>} required error={m.err.img}>
          {d.img ? (
            <div className="mo-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={catImg(d.img)} alt="" />
              <div className="mo-img__ov">
                <button type="button" aria-label="拡大して見る" onClick={() => onImg(m, catImg(d.img))}><Icon name="Eye" size={20} /></button>
                <button type="button" aria-label="画像を削除" onClick={() => up({ img: '' })}><Icon name="Trash" size={20} /></button>
              </div>
            </div>
          ) : (
            <label className="mo-up"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} /><Icon name="Plus" size={28} /><span>追加</span></label>
          )}
        </Field>
      </div>
    </Dialog>
  );
}
