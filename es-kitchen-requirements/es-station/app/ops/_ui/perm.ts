'use client';

import { usePathname } from 'next/navigation';
import { activeOf } from '@/lib/ops/menu';
import { ruleOf } from '@/lib/ops/apiPerm';
import { can, MENU_FEATURES, type Grants, type PermOp } from '@/lib/ops/permissions';
import { useOps } from './OpsProvider';

/*
 * 運営Web の権限による出し分け（lib/ops/permissions.ts）。API はサーバーでも確かめる（lib/server/access.ts）。
 *   メニュー：その画面の機能のどれかの閲覧があれば出す（lib/ops/menu.ts の visibleMenu）
 *   画面の中のボタン：useScreenCan()('create') など（今の画面の機能のどれかでできれば出す）
 *   書き換えを呼ぶボタン：const canAct = useCanAct();  {canAct(api, 'save') && <button …>}（API と同じ表：lib/ops/apiPerm.ts）
 *   新規登録（…/new）・編集（…/edit）の画面は、その画面の機能の 作成・編集 ができなければ開けない（OpsShell）
 */

/** メニューの画面（key）の機能。メニューにない画面は null（出し分けない） */
export const featuresOfLeaf = (key: string | undefined) => (key ? MENU_FEATURES[key] ?? null : null);

/** メニューの画面を見られるか */
export const canSee = (g: Grants, key: string) => (featuresOfLeaf(key) ?? []).some((f) => can(g, f, 'read'));

/** 今の画面の機能 */
export function useScreenFeatures() {
  return featuresOfLeaf(activeOf(usePathname()).leaf?.key);
}

/** 今の画面で操作ができるか（feature を渡すとその機能で確かめる） */
export function useScreenCan() {
  const { grants } = useOps();
  const fs = useScreenFeatures();
  return (op: PermOp, feature?: string) => (feature ? can(grants, feature, op) : !fs || fs.some((f) => can(grants, f, op)));
}

/** 書き換えの API を呼べるか（サーバーの確かめと同じ表）。参照のみのアカウントは書き換えできない */
export function useCanAct() {
  const { grants, account } = useOps();
  return (api: { area: { name: string }; kind: 'ops' | 'domain' }, op: string, args?: unknown) => {
    const r = ruleOf(api.kind, api.area.name, op, true, args);
    if (account?.readOnly) return false;
    return r === 'any' || can(grants, r.feature, r.op);
  };
}

/** 新規登録（…/new）・編集（…/edit）・CSV取込（…/import…）の画面を開けるか（開けなければ OpsShell が「この画面を見る権限がありません」を出す） */
export function canOpenPath(g: Grants, path: string, features: string[] | null) {
  if (!features) return true;
  const op: PermOp | null = /\/new$/.test(path) ? 'create' : /\/edit$/.test(path) ? 'update' : /\/import(-[a-z]+)?(\/[^/]+)?$/.test(path) ? 'csvImport' : null;
  return !op || features.some((f) => can(g, f, op));
}
