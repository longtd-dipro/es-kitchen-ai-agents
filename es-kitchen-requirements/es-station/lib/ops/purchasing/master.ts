import { addDays, parseDate, today } from '@/lib/supplier/dates';
import { mockSuppliers } from '@/mocks/supplier/suppliers';
import M from './master.json';
import type { Demand, Mat, MenuMonth, Prod } from './types';
import { fmtYm } from '@/lib/format/date';

/*
 * 発注・入荷で使うマスタ（見るだけ）。値は元のデモ（10_運営_まとめ.html の ORD・OPS_DEM・OPS_MO・SMP）のまま。
 * 本番では商品マスタ・資材マスタ・仕入先マスタ・倉庫マスタ・月間メニュー・商品注文管理・資材注文管理から読む。
 */

export const PRODS = M.prods as Prod[];
export const MATS = M.mats as Mat[];
export const SUP = M.sup as Record<string, string>;
/** 仕入先Webのアカウントの状態（未発行の仕入先はシステムで発注できない） */
export const SUP_ST = M.supSt as Record<string, string>;
/** 土日祝を営業日とするか（仕入先マスタ。本発注のアラートの数え方） */
export const SUP_BIZ = M.supBiz as Record<string, string>;
export const MENU = M.menu as Record<string, MenuMonth>;
/** 発注のメニュー年月（新しい順。先頭が翌月のメニュー） */
export const MONTHS = M.months as string[];
export const IN_MENU = M.inMenu as Record<string, string[]>;
export const WH = M.wh as string[];
export const WH_CODE = M.whCode as Record<string, string>;
export const DEM = M.dem as unknown as Demand;
/** 資材注文管理の月の合計（年月 → 資材ID → 数） */
export const MO = M.mo as Record<string, Record<string, number>>;
/** 代替品設定で直した発注の必要数（ALT-MORE-20261001） */
export const ALT = M.alt as Record<string, Record<string, { n: number; no: string; why: string }>>;
export const SMP = M.smp as unknown as {
  quota: Record<string, number>; flag: Record<string, number>; wh: Record<string, string[]>; lead: Record<string, number>;
  ng: string[]; ngDates: Record<string, string>; pauses: [string, string, string][]; a1: [string, string][];
};
export const WH_ROWS = M.whRows as { id: string; name: string; kind: string; status: string }[];

/** 仕入先サイト（共通 DB）にいる仕入先。この仕入先への発注は仕入先サイトと同じ発注データに入れる */
export const SHARED_SUPS = new Set(Object.keys(mockSuppliers()));

export const CATS = ['肉', '魚', '惣菜', '主食', '汁物', 'サラダ・果物', '飲料・甘味'];
/** 入荷希望日（ピッキング日の何日前か）。初期値は当日（決定 R10） */
export const WISH: [string, string][] = [['0', '当日'], ['1', '前日'], ['2', '2日前']];
export const GROUPS: Record<string, [number, number][]> = { '4': [[0, 6], [7, 13], [14, 20], [21, 27]], '2': [[0, 13], [14, 27]], '1': [[0, 27]] };
/** 分納は3回まで（仮・運営の設定。決定 C2） */
export const SPLIT_MAX = 3;
/** 資材の納品先（倉庫マスタ WH00004） */
export const MAT_WH = 'ES事務所（資材）';
/** 資材の発注のメニュー年月（決定 R5：随時・本発注だけ） */
export const MAT_YM = '2026-10';
export const OPS_USER = 'にっしぐち（運営）';

export const prod = (id: string) => PRODS.find((p) => p.id === id);
export const mat = (id: string) => MATS.find((m) => m.id === id);
export const supName = (id: string) => SUP[id] ?? id;
export const supOK = (pid: string) => SUP_ST[prod(pid)?.sup ?? ''] !== '未発行';
/** 仕入時の商品名（決定 R12） */
export const pname = (pid: string) => prod(pid)?.pname ?? mat(pid)?.name ?? pid;

/* ===== 日付（ORD は YYYY/MM/DD、営業サンプルは YYYY-MM-DD） ===== */
export const WD = ['日', '月', '火', '水', '木', '金', '土'];
export const TODAY = () => today();
export const iso = (s: string) => (s ?? '').replace(/\//g, '-');
export const slash = (s: string) => (s ?? '').replace(/-/g, '/');
export const wdOf = (s: string) => WD[parseDate(slash(s)).getDay()];
/** 表示用 'MM-DD (曜)'（共通の表示ルール・決定 8-1。dFmt は発注データの納品期間の文字に使うので元のまま） */
export const dShow = (s: string, wd = true) => dFmt(s, wd).replace('/', '-');
/** MM/DD (曜) */
export const dFmt = (s: string, wd = true) => `${s.slice(5, 7)}/${s.slice(8, 10)}${wd ? ` (${wdOf(s)})` : ''}`;
export const SLOT = (k: number) => 'ABCD'[Math.floor(k / 7)] + (k % 7 + 1);
export const slotK = (slot: string) => 'ABCD'.indexOf(slot[0]) * 7 + Number(slot.slice(1)) - 1;
/** 顧客納品日（A1 から k 日目） */
export const slotDate = (ym: string, k: number) => addDays(MENU[ym].a1, k);
/** ピッキング日（顧客納品日の前日） */
export const pickDate = (ym: string, k: number) => addDays(slotDate(ym, k), -1);
/** 入荷希望日（ピッキング日の w 日前） */
export const wishDate = (ym: string, k: number, w: string) => addDays(pickDate(ym, k), -(+w || 0));
export const daysBetween = (a: string, b: string) => Math.round((parseDate(slash(b)).getTime() - parseDate(slash(a)).getTime()) / 86400000);
export const ymL = (ym: string) => fmtYm(ym);
export const lotUp = (v: number, lot: number) => (v <= 0 ? 0 : Math.ceil(v / lot) * lot);
export const n = (v: number) => v.toLocaleString('ja-JP');
