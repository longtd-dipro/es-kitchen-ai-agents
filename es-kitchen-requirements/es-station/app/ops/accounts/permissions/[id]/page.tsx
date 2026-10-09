'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import accountArea from '@/lib/domain/areas/account';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { OP_LABEL, PERM_FEATURES, type PermOp } from '@/lib/ops/permissions';
import { ListTable, useList, type ListCol } from '@/app/ops/_general/list';
import { Loading } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Badge, Field, PageHead } from '@/app/ops/_ui/ui';
import { BASIC } from '../_ui/RoleEditor';
import { useDeleteRole } from '../_ui/useDeleteRole';

const api = domainApi(accountArea);
const GROUPS = [...new Set(PERM_FEATURES.map((f) => f.group))];
type Acc = { id: string; name: string; status: string };
const ACC_COLS: ListCol<Acc>[] = [
  { key: 'id', label: 'ユーザーID', td: (r) => <td className="mono">{r.id}</td> },
  { key: 'name', label: 'ユーザー名' },
  { key: 'status', label: 'アカウント状態', td: (r) => <td><Badge v={r.status} /></td> },
];

/**
 * 権限の詳細（AW_PERM_002・表示だけ。台帳 F 2026-10-06）。基本情報・系統ごとの 機能×操作（✓）・この権限を持つアカウント（10件／ページ）。
 * 編集（…/edit）・削除は「権限付与」の編集・削除ができる人だけ
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useOps();
  const deleteRole = useDeleteRole();
  const { data: roles } = useDomainQuery(api, 'roles', { site: 'ops', all: true });
  const { data: accounts } = useDomainQuery(api, 'list', { site: 'ops' });
  const list = useList(`perm-accounts:${id}`);
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  if (!roles || !accounts) return <Loading />;
  const role = roles.find((r) => r.id === id);
  if (!role) return <div className="card"><p>権限が見つかりません（{id}）</p></div>;
  const grants = role.grants ?? {};
  const rows: Acc[] = accounts.filter((a) => a.roleIds.includes(id) && a.status !== '削除済');
  const deleted = role.status === '削除済';
  const back = '/ops/accounts/permissions';
  return (
    <>
      <PageHead crumbs={['アカウント管理', '権限', role.name]} title={role.name}>
        <Link className="btn lg" href={back}>一覧へ戻る</Link>
        {!deleted && can('grant', 'update') && <Link className="btn pri lg" href={`${back}/${encodeURIComponent(id)}/edit`}>編集</Link>}
        {!deleted && can('grant', 'delete') && <button className="btn dan-solid lg" onClick={() => deleteRole(id, () => router.push(back))}>削除</button>}
      </PageHead>
      <div className="card">
        <div className="fg c2">
          <Field label="権限名"><span>{role.name}</span></Field>
          <Field label="備考"><span>{role.note || '—'}</span></Field>
          <Field label="ユーザー数"><span>{role.users}</span></Field>
          <Field label="状態"><Badge v={role.status ?? '有効'} /></Field>
          <Field label="最終更新"><span>{role.updatedAt ? `${role.updatedAt.slice(0, 16).replaceAll("/", "-")}${role.updatedBy ? `　${role.updatedBy}` : ''}` : '—'}</span></Field>
        </div>
      </div>
      {GROUPS.map((g) => {
        const gfs = PERM_FEATURES.filter((f) => f.group === g);
        const gcount = gfs.filter((f) => grants[f.key]?.length).length;
        const isClosed = !!closed[g];
        return (
          <div key={g} className="card">
            <h3 style={{ margin: '0 0 0.571429rem', fontSize: '1.142857rem' }}>
              <button type="button" className="btn ghost" aria-expanded={!isClosed} aria-controls={`perm-${g}`} onClick={() => setClosed((c) => ({ ...c, [g]: !c[g] }))}
                style={{ fontSize: 'inherit', fontWeight: 'inherit', padding: 0, gap: '0.428571rem' }}>
                <span aria-hidden="true">{isClosed ? '▶' : '▼'}</span>{g}
              </button>
              <span className="hint" style={{ marginLeft: '0.857143rem', fontWeight: 'normal' }}>{gcount}／{gfs.length}機能で操作あり</span>
            </h3>
            {!isClosed && (
              <div className="tbl-wrap" id={`perm-${g}`}>
                <table className="tbl" style={{ tableLayout: 'fixed', minWidth: '56rem' }}>
                  <colgroup>
                    <col style={{ width: '28%' }} />
                    {BASIC.map((o) => <col key={o} style={{ width: '5.142857rem' }} />)}
                    <col />
                  </colgroup>
                  <thead>
                    <tr><th>機能</th>{BASIC.map((o) => <th key={o} style={{ textAlign: 'center' }}>{OP_LABEL[o]}</th>)}<th>その他</th></tr>
                  </thead>
                  <tbody>
                    {gfs.map((f) => {
                      const has = (o: PermOp) => !!grants[f.key]?.includes(o);
                      return (
                        <tr key={f.key}>
                          <td>
                            <b>{f.label}</b>
                            <div className="hint">{f.screens.length ? f.screens.join('・') : '（画面は準備中）'}</div>
                          </td>
                          {BASIC.map((o) => <td key={o} style={{ textAlign: 'center' }}>{f.ops.includes(o) ? (has(o) ? <span aria-label={`${f.label}：${OP_LABEL[o]}あり`}>✓</span> : '') : <span className="hint">—</span>}</td>)}
                          <td>{f.ops.filter((o) => !BASIC.includes(o) && has(o)).map((o) => <span key={o} style={{ marginRight: '0.857143rem', whiteSpace: 'nowrap' }}>✓ {OP_LABEL[o]}</span>)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      <div className="card">
        <h3 style={{ margin: '0 0 0.571429rem', fontSize: '1.142857rem' }}>この権限を持つアカウント</h3>
        {rows.length ? <ListTable list={list} cols={ACC_COLS} rows={rows} noNo rowKey={(r) => r.id} /> : <p className="muted" style={{ margin: 0 }}>表示するデータがありません。</p>}
      </div>
    </>
  );
}
