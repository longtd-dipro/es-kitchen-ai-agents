'use client';

import { SortMenu } from '@/components/SortMenu';

import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { MENU_STATUSES, MENU_TONE, menuLabel } from '@/lib/ops/menu/logic';
import type { Menu } from '@/lib/ops/menu/types';
import { today } from '@/lib/supplier/dates';
import { useOpsCsvExport } from '../../_ui/csv';
import { Badge, Button, Card, ConfirmDelete, CsvButton, Dialog, Field, Head, InlineMessage, Pager, RowActions, SearchPanel, Select, Sel, Table, TLink, Td } from '../_components/es';
import { useKeep, useMenu } from '../_components/MenuProvider';
import { api, Loading, useMaster } from '../_components/parts';
import { useCanAct } from '../../_ui/perm';
import { fmtDate } from '@/lib/format/date';
import { yen } from '@/lib/format/money';

type Q = { y?: string; st?: string };
/** CSV出力の1行（メニューの1商品。商品がないメニューは it なしの1行） */
type CsvRow = { m: Menu; it?: NonNullable<Menu['dm']>['items'][number] };
/* 並べ替えの項目（一覧の全列。台帳 K）。初期の並びは対象年月の降順（受付簿 No.240 Q1） */
const SORTS: { k: string; label: string; get: (m: Menu, cats: number) => string | number }[] = [
  { k: 'ym', label: '対象年月', get: (m) => m.ym }, { k: 'items', label: '商品数', get: (m) => m.items.length }, { k: 'cats', label: 'カテゴリ数', get: (_m, c) => c },
  { k: 'pub', label: 'メニュー公開日', get: (m) => m.pub }, { k: 'from', label: 'オーダー受付期間', get: (m) => m.from }, { k: 'status', label: 'ステータス', get: (m) => m.status },
  { k: 'corp', label: '法人向け公開', get: (m) => m.dm?.corpPublish ?? '' }, { k: 'pdf', label: 'メニューPDF', get: (m) => m.dm?.pdfs.length ?? 0 },
  { k: 'avg', label: '平均仕入単価（税抜）', get: (m) => m.avgCost ?? 0 }, { k: 'upd', label: '最終更新', get: (m) => m.upd },
];

/** 月間メニュー（一覧） */
export default function MonthlyListPage() {
  const { toast, toastError, nav } = useMenu();
  const canAct = useCanAct();
  const csvExport = useOpsCsvExport();
  const mm = useMaster();
  const { data: menus } = useQuery(api, 'menuList');
  const { data: months } = useQuery(api, 'newMenuMonths');
  const [q, setQ] = useKeep<Q>('mn.q', {});
  const [qd, setQd] = useKeep<Q>('mn.qd', {});
  /* 並べ替え・ページ（対象年月の降順・1ページ10件。10／20／50） */
  const [sort, setSort] = useKeep<{ k: string; dir: 'asc' | 'desc' }>('mn.sort', { k: 'ym', dir: 'desc' });
  const [pg, setPg] = useKeep<{ page: number; per: number }>('mn.pg', { page: 1, per: 10 });
  const [del, setDel] = useState<string | null>(null);
  const [add, setAdd] = useState<string | null>(null);
  const [addErr, setAddErr] = useState('');
  if (!mm || !menus) return <Loading />;
  const { C } = mm;
  const catsOf = (m: Menu) => new Set(m.items.map((id) => C.prod(id).cat)).size;
  /* 削除済のメニューは、ステータスで「削除済」を選んだときだけ出す（受付簿 No.247） */
  const filtered = menus.filter((m) => (!q.y || m.ym.slice(0, 4) === q.y) && (q.st ? m.status === q.st : m.status !== '削除済'));
  const sk = SORTS.find((x) => x.k === sort.k) ?? SORTS[0];
  const list = [...filtered].sort((a, b) => {
    const x = sk.get(a, catsOf(a)), y = sk.get(b, catsOf(b));
    const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ja');
    return c * (sort.dir === 'desc' ? -1 : 1) || (a.ym < b.ym ? 1 : a.ym > b.ym ? -1 : 0);
  });
  const size = pg.per, pages = Math.max(1, Math.ceil(list.length / size)), cur = Math.min(pg.page, pages);
  const shown = list.slice((cur - 1) * size, cur * size);

  /* 新規登録：年月を選ぶ（まだメニューがない月だけ。受付簿 #276）。作れたら S114 */
  const newMenu = async () => {
    if (!add) { setAddErr('年月を選択してください。'); return; }
    try {
      const ym = await api.action('createMenu', { ym: add });
      setAdd(null);
      /* 前のメニューは複製しない（RD-MN-012・022）。「定番」の自動追加もしない（2026-10-05 台帳 F）。前回の商品は「商品追加」の「前回メニュー」で選ぶ */
      toast(`${ym}のメニューを作りました。商品を追加してください。`);
      nav(`/ops/menu/monthly/${ym}/edit`);
    } catch (e) { toastError(e); }
  };
  /* 削除できるのは、編集中で、オーダーが締まっていない月のメニューだけ（公開中・締切済・配送中・終了は不可。受付簿 #276） */
  const deletable = (m: Menu) => m.status === '編集中' && today() <= m.to;

  return (
    <>
      <Head crumb={['メニュー管理', '月間メニュー']} title="月間メニュー" actions={<>
        <CsvButton onClick={() => csvExport<CsvRow>({
          /* 1行＝メニューの1商品（メニューの列をくり返す。商品の列は取込 CSV と同じ：表示順・品番・商品名（管理名）・公開可能・商品タグ・基準注文数3種類・営業サンプル）。
             検索条件のとおりの全件。削除済のメニューは出さない（受付簿 #240 Q2・Q10・Q15） */
          screen: '月間メニュー', filters: [{ label: '年', value: q.y ?? '' }, { label: 'ステータス', value: q.st ?? '' }],
          rows: list.filter((m) => m.status !== '削除済').flatMap((m): CsvRow[] => (m.dm?.items.length ? m.dm.items.map((it) => ({ m, it })) : [{ m }])),
          columns: [
            { label: 'メニューID', get: (r) => r.m.id }, { label: '対象年月', get: (r) => r.m.ym }, { label: '商品数', type: 'int', get: (r) => r.m.items.length },
            { label: 'カテゴリ数', type: 'int', get: (r) => catsOf(r.m) }, { label: 'メニュー公開日', get: (r) => r.m.pub },
            { label: 'オーダー受付開始', get: (r) => r.m.from }, { label: 'オーダー受付終了', get: (r) => r.m.to }, { label: 'ステータス', get: (r) => menuLabel(r.m.status) },
            { label: 'メニューPDF', type: 'int', get: (r) => r.m.dm?.pdfs.length ?? 0 }, { label: '平均仕入単価（税抜）', type: 'money', get: (r) => r.m.avgCost ?? 0 }, { label: '最終更新', get: (r) => r.m.upd },
            { label: '表示順', type: 'int', get: (r) => (r.it ? r.it.order : '') }, { label: '品番', get: (r) => r.it?.productId ?? '' },
            { label: '商品名（管理名）', get: (r) => { const p = r.it ? C.prod(r.it.productId) : undefined; return p ? p.mgmt || p.name : ''; } },
            { label: '公開可能', get: (r) => (r.it?.publishable ? '1' : '') }, { label: '商品タグ', get: (r) => r.it?.tags.join(';') ?? '' },
            { label: '基準注文数', type: 'int', get: (r) => r.it?.base.std ?? '' }, { label: '短消費期限なし基準注文数', type: 'int', get: (r) => r.it?.base.ns ?? '' },
            { label: '自販機基準注文数', type: 'int', get: (r) => r.it?.base.vm ?? '' }, { label: '営業サンプル', get: (r) => (r.it?.sample ? '1' : '') },
          ],
        })} />
        {canAct(api, 'createMenu') && <Button icon="Plus" size="lg" onClick={() => { setAdd(''); setAddErr(''); }}>新規登録</Button>}
      </>} />
      <Card>
        <InlineMessage tone="info" title="メニューは1ヶ月に1つ（サイクル月ごと）">
          編集中 → 公開中（オーダー受付中） → 締切済 → 配送中 → 終了 の順に進みます。商品・基準注文数（50プランの代表値）を変えられるのは「編集中」と、オーダー締切日までの「公開中」です。法人向けの公開は 非公開／公開／自動公開（メニュー公開日に公開の条件がそろっていれば公開）。
        </InlineMessage>
        <SearchPanel onSearch={() => { setQ({ ...qd }); setPg({ ...pg, page: 1 }); }} onClear={() => { setQ({}); setQd({}); setSort({ k: 'ym', dir: 'desc' }); setPg({ ...pg, page: 1 }); }}>
          <Select placeholder="年" value={qd.y ?? ''} options={[...new Set(menus.map((m) => m.ym.slice(0, 4)))].sort().reverse()} onChange={(v) => setQd({ ...qd, y: v })} />
          <Select placeholder="ステータス" value={qd.st ?? ''} options={MENU_STATUSES.map((v) => ({ value: v, label: menuLabel(v) }))} onChange={(v) => setQd({ ...qd, st: v })} />
          {/* 並べ替え：一覧の全列から選び、昇順・降順を切り替える（台帳 K） */}
          <SortMenu options={SORTS.map((x) => [x.k, x.label])} value={sort.k} dir={sort.dir} onChange={(k, d) => { setSort({ k, dir: d }); setPg({ ...pg, page: 1 }); }} />
        </SearchPanel>
        <Table cls="mm-tbl" empty="表示するデータがありません。"
          cols={[{ label: 'No', w: 48 }, { label: 'メニューID' }, { label: '対象年月' }, { label: '商品数', cls: 'r' }, { label: 'カテゴリ数', cls: 'r' }, { label: 'メニュー公開日' }, { label: 'オーダー受付期間' }, { label: 'ステータス' }, { label: '法人向け公開' }, { label: 'メニューPDF' }, { label: '平均仕入単価（税抜）', cls: 'r' }, { label: '最終更新' }, { label: '操作', w: 96 }]}
          rows={shown.map((m, i) => {
            const gone = m.status === '削除済';
            return (
              <tr key={m.ym + '-' + i}>
                <Td v={(cur - 1) * size + i + 1} />
                <td>{gone ? m.id : <TLink onClick={() => nav(`/ops/menu/monthly/${m.ym}`)}>{m.id}</TLink>}</td>
                <Td v={m.ym} />
                <Td v={m.items.length + '品'} cls="r" />
                <Td v={catsOf(m)} cls="r" />
                <Td v={m.pub} />
                <Td v={<><span className="nw">{fmtDate(m.from)}〜</span><span className="nw">{fmtDate(m.to)}</span></>} />
                <td><Badge tone={MENU_TONE[m.status]}>{menuLabel(m.status)}</Badge></td>
                {/* 自動公開の日＝メニュー公開日（自動公開日付はなくした：受付簿 No.240） */}
                <Td v={m.dm ? <>{m.dm.corpPublish}{m.dm.corpPublish === '自動公開' ? <>{' '}<span className="nw">{fmtDate(m.pub)}</span></> : null}</> : ''} />
                {/* メニューPDF・平均仕入単価（RD-MN-048） */}
                <Td v={m.dm?.pdfs.length ? m.dm.pdfs[0].name + (m.dm.pdfs.length > 1 ? ` ほか${m.dm.pdfs.length - 1}件` : '') : 'なし'} />
                <Td v={yen(m.avgCost ?? 0)} cls="r" />
                <Td v={m.upd ? <>{(/^(\S+ \S+)( .*)?$/.exec(m.upd) ?? [m.upd, m.upd]).slice(1).map((s, k) => <span key={k}>{k ? ' ' : ''}<span className="nw">{(s ?? '').trim()}</span></span>)}</> : ''} cls="mo-sm" />
                <td>
                  {gone ? null
                    /* 編集中・公開中・締切済は 編集（削除は編集中でオーダーが締まっていない月だけ）。配送中・終了は 参照。権限がなければ出さない */
                    : ['編集中', '公開中', '締切済'].includes(m.status)
                      ? <RowActions label={m.id} onEdit={canAct(api, 'saveMenuEdit') ? () => nav(`/ops/menu/monthly/${m.ym}/edit`) : undefined} onDelete={deletable(m) && canAct(api, 'deleteMenu') ? () => setDel(m.ym) : undefined} />
                      : <Button variant="ghost" tone="neutral" size="sm" icon="Eye" aria-label="参照" onClick={() => nav(`/ops/menu/monthly/${m.ym}`)} />}
                </td>
              </tr>
            );
          })}
        />
        <Pager total={list.length} page={cur} per={size} opts={[10, 20, 50]} onPage={(n) => setPg({ ...pg, page: n })} onPer={(n) => setPg({ page: 1, per: n })} />
      </Card>
      {del ? <ConfirmDelete onCancel={() => setDel(null)} onConfirm={async () => {
        const ym = del; setDel(null);
        try { await api.action('deleteMenu', { ym }); toast('削除が完了しました。'); } catch (e) { toastError(e); }
      }} /> : null}
      {add !== null ? (
        <Dialog title="月間メニューの新規登録" width={520} onClose={() => setAdd(null)}
          footer={<div className="mo-row"><Button variant="outline" size="lg" onClick={() => setAdd(null)}>キャンセル</Button><Button size="lg" onClick={newMenu}>作成</Button></div>}>
          <Field label="年月" required error={addErr || undefined} helper="まだメニューがない月だけ選べます。商品は空で作り、あとから追加します">
            <Sel aria-label="年月" value={add} onChange={(e) => { setAdd(e.target.value); setAddErr(''); }} options={[{ value: '', label: '選択してください' }, ...(months ?? [])]} />
          </Field>
        </Dialog>
      ) : null}
    </>
  );
}
