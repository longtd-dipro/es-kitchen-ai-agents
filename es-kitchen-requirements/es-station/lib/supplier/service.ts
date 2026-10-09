import { ApiError } from '@/lib/api/errors';
import { isCode } from '@/lib/auth/rules';
import type { AnswerInput, ApplicationForm, HonInput, Manual, ShipmentInput } from '@/lib/api/supplier';
import { addDays as addDaysSlash, nowStamp, today } from './dates';
import { nShipped, qtyOf, syncOrder, validateShip } from './orders';
import { applyContactEdit } from './view';
import type { Notice, OpsOp, Order, OrderRow, Supplier } from './types';

/*
 * 発注の書き換え（仕入先・運営の両方）。データの置き場所（Repo）だけを差し替えて、
 * ブラウザだけのモック（メモリ）と共通 DB（SQLite・app/api）で同じ動きにする。
 * 本物のバックエンドを作るときも、この動きに合わせる。
 */

/** データの置き場所。get で返した値を書き換えてから save に渡す */
export interface SupplierRepo {
  getSupplier(id: string): Supplier | undefined;
  saveSupplier(s: Supplier): void;
  listOrders(supplierId?: string): Order[];
  getOrder(no: string): Order | undefined;
  saveOrder(o: Order): void;
  /** 新しい発注を足す（運営の仮発注・追加発注・資材の発注）。ない Repo では発注を作れない */
  addOrder?(o: Order): void;
  /** 本発注したときに写す仕入単価（共通データの商品マスタ）。ない Repo では写さない（lib/domain/snapshot.ts の stampUnitCost） */
  unitCost?(o: Order): number | undefined;
  listNotices(): Notice[];
  listManuals(): Manual[];
  addApplication(receiptNo: string, form: ApplicationForm): void;
  /** 受付番号の続きの元（SA-日付-NNNN の、その日のいちばん大きい NNNN。sqlite は共通データの仕入先の申込から） */
  countApplications(): number;
  /** 書き換えのたびに増える番号（ほかの画面・サイトが変更に気づくため） */
  version(): number;
  /** まとめて書き換える（途中で失敗したら全部取り消す） */
  transaction<T>(fn: () => T): T;
}

const HISTORY_OPS = '運営';

export function supplierService(repo: SupplierRepo) {
  const find = (no: string) => {
    const o = repo.getOrder(no);
    if (!o) throw new ApiError(`発注が見つかりません（${no}）`, 404);
    return o;
  };
  /** 本発注したら仕入単価を写す（写しがあれば変えない。影響一覧 A5） */
  const stampCost = (o: Order) => {
    if (o.type === '資材' || !(o.hon > 0) || o.unitCostYen !== undefined || !repo.unitCost) return;
    const c = repo.unitCost(o);
    if (c !== undefined) o.unitCostYen = c;
  };
  const save = (o: Order) => {
    stampCost(o);
    syncOrder(o);
    repo.saveOrder(o);
    return o;
  };
  /** 回答できる（納期回答待ち、または回答済みでまだ出荷していない＝回答の修正） */
  const canAnswer = (o: Order) => o.ans === '納期回答待ち' || (o.ans === '納期回答済' && nShipped(o) === 0);
  const log = (o: Order, t: string, who = HISTORY_OPS) => {
    o.hist = [...(o.hist ?? []), { at: nowStamp(), who, t }];
  };

  const svc = {
    /* ===== 仕入先サイト ===== */
    login(loginId: string, password: string) {
      /* 申込中・却下・削除済の仕入先はログインできない（本登録だけ。運営の仕入先マスタと同じ行・課題 11） */
      const s = repo.getSupplier(loginId);
      if (!s || s.status !== '本登録' || !password) throw new ApiError('ログインIDまたはパスワードが正しくありません', 401);
      return { supplierId: loginId };
    },
    /** パスワード再設定の認証コード（4桁・5分）。見本では形だけ確かめる */
    verifyResetCode(code: string) {
      if (!isCode(code)) throw new ApiError('認証コード（4桁）が正しくありません', 400);
      return { token: 'mock-token' };
    },
    submitApplication(form: ApplicationForm) {
      return repo.transaction(() => {
        const receiptNo = `SA-${today().replace(/\//g, '')}-${String(repo.countApplications() + 1).padStart(4, '0')}`;
        repo.addApplication(receiptNo, form);
        return { receiptNo };
      });
    },
    getSupplier(id: string) {
      const s = repo.getSupplier(id);
      if (!s) throw new ApiError('仕入先が見つかりません', 404);
      return s;
    },
    updateSupplier(s: Supplier) {
      if (!repo.getSupplier(s.id)) throw new ApiError('仕入先が見つかりません', 404);
      repo.saveSupplier(s);
      return s;
    },
    /** 仕入先サイトのプロフィール保存：連絡先（電話・メール・担当者・住所）だけ反映する。ほかの項目は送られても無視 */
    updateSupplierContact(id: string, patch: Partial<Supplier>) {
      const cur = repo.getSupplier(id);
      if (!cur) throw new ApiError('仕入先が見つかりません', 404);
      const next = applyContactEdit(cur, patch);
      repo.saveSupplier(next);
      return next;
    },
    listNotices: () => [...repo.listNotices()].sort((a, b) => b.date.localeCompare(a.date)),
    listManuals: () => repo.listManuals(),
    listOrders: (supplierId: string) => repo.listOrders(supplierId),

    markSeen(no: string) {
      const o = find(no);
      o.seen = true;
      return save(o);
    },
    answerOrders(items: AnswerInput[]) {
      return repo.transaction(() =>
        items.map(({ no, parts, comment }) => {
          const o = find(no);
          if (!canAnswer(o)) throw new ApiError(`この発注は回答できません（${no}）`, 409);
          o.parts = parts.map((p) => ({ eta: p.eta, qty: p.qty, st: '未出荷' as const })).sort((a, b) => a.eta.localeCompare(b.eta));
          if (comment !== undefined) o.comment = comment;
          o.ans = '納期回答済';
          o.re = null;
          return save(o);
        }),
      );
    },
    rejectOrder(no: string, reason: string, comment: string) {
      const o = find(no);
      if (!canAnswer(o)) throw new ApiError('この発注は回答できません', 409);
      o.ans = '受注不可';
      o.reject = { reason, comment };
      o.parts = [];
      return save(o);
    },
    approveHon(items: HonInput[]) {
      return repo.transaction(() =>
        items.map(({ no, parts }) => {
          const o = find(no);
          if (o.honAck) throw new ApiError(`この本発注はすでに承認済みです（${no}）`, 409);
          /* 賞味期限（必須・台帳 E 2026-10-05。REQ-PO-606）は出荷報告の初期値になる。資材は持たない */
          if (o.type !== '資材' && parts.some((x) => !x.bb)) throw new ApiError(`${o.type === '短消費期限' ? '消費期限' : '賞味期限'}を入力してください（${no}）`, 400);
          o.parts = parts.map(({ bb, ...x }) => ({ ...x, ...(bb && o.type !== '資材' ? { bb } : {}), st: '未出荷' as const })).sort((a, b) => a.eta.localeCompare(b.eta));
          o.honAck = true;
          o.honAckAt = nowStamp();
          return save(o);
        }),
      );
    },
    reportShipment({ no, partIndex, ...v }: ShipmentInput) {
      const o = find(no);
      const p = o.parts[partIndex];
      if (!p || p.st !== '未出荷') throw new ApiError('この回はすでに出荷報告済みです', 409);
      Object.assign(p, v, { st: '出荷済' });
      if (o.type === '資材') delete p.bb;
      if (o.parts.every((x) => x.st === '出荷済')) {
        o.ans = '出荷済';
        o.recv = '未入荷';
      }
      /* 前回の配送方法・運送会社を覚える（REQ-PO-619：次の出荷報告の初期値） */
      const s = repo.getSupplier(o.sup);
      if (s && (s.lastMethod !== (v.method || s.lastMethod) || s.lastCarrier !== (v.carrier || s.lastCarrier))) {
        repo.saveSupplier({ ...s, lastMethod: v.method || s.lastMethod, lastCarrier: v.carrier || s.lastCarrier });
      }
      return save(o);
    },
    /** 出荷一覧の入力をまとめて保存（出荷済みにはしない・REQ-PO-621）。出荷済みの回は直せない */
    saveShipDrafts(items: ShipmentInput[]) {
      return repo.transaction(() => {
        const out = new Map<string, Order>();
        for (const { no, partIndex, ...v } of items) {
          const o = out.get(no) ?? find(no);
          const p = o.parts[partIndex];
          if (!p) throw new ApiError(`出荷の回が見つかりません（${no}）`, 404);
          if (p.st !== '未出荷') throw new ApiError(`この回はすでに出荷報告済みです（${no}）`, 409);
          Object.assign(p, v);
          if (o.type === '資材') delete p.bb;
          out.set(no, o);
        }
        return [...out.values()].map(save);
      });
    },
    /** チェックした回をまとめて出荷済みにする（REQ-PO-621）。1件でも失敗したら全部取り消す */
    reportShipments(items: ShipmentInput[]) {
      return repo.transaction(() => {
        const out = new Map<string, Order>();
        for (const x of items) out.set(x.no, svc.reportShipment(x));
        return [...out.values()];
      });
    },

    /* ===== 運営Web（発注管理） ===== */
    listAllOrders: () => repo.listOrders(),
    /** 本発注を出す（仕入先の「本発注の承認待ち」に出る）。rows＝本発注数の明細（なければ今の明細のまま） */
    issueHon(no: string, qty: number, rows?: OrderRow[]) {
      const o = find(no);
      if (!['納期回答待ち', '納期回答済'].includes(o.ans) || o.hon > 0) throw new ApiError(`仮発注済みで、本発注がまだの発注だけ本発注できます（${no}）`, 409);
      if (!(qty > 0)) throw new ApiError('本発注の数量は1以上にしてください', 400);
      o.hon = qty;
      if (rows) o.rows = rows;
      o.honAt = nowStamp();
      o.honAck = false;
      o.honAckAt = '';
      o.seen = false;
      log(o, `本発注（${qty}${o.unit}）`);
      return save(o);
    },
    /** 仮発注の数量を変える（仕入先は再回答が必要になり「納期回答待ち」に戻る） */
    changeKari(no: string, qty: number) {
      const o = find(no);
      if (!['納期回答待ち', '納期回答済'].includes(o.ans) || o.hon > 0) throw new ApiError('本発注の前の発注だけ数量を変えられます', 409);
      if (!(qty > 0) || qty === o.kari) throw new ApiError('いまと違う1以上の数量にしてください', 400);
      o.re = { prev: o.re?.prev ?? o.kari };
      o.kari = qty;
      o.ans = '納期回答待ち';
      o.parts = [];
      o.seen = false;
      log(o, `仮発注の数量変更（${o.re.prev} → ${qty}${o.unit}）`);
      return save(o);
    },
    /** キャンセル（受注不可と回答された発注も、取り消して出し直せる） */
    cancelOrder(no: string, reason: string) {
      const o = find(no);
      if (['出荷済', 'キャンセル'].includes(o.ans) || o.recv === '入荷済') throw new ApiError(`この発注はキャンセルできません（${no}）`, 409);
      if (!reason.trim()) throw new ApiError('キャンセルの理由を入力してください', 400);
      o.ans = 'キャンセル';
      o.cancel = { at: nowStamp(), by: HISTORY_OPS, reason };
      o.parts = [];
      o.seen = false;
      log(o, 'キャンセル');
      return save(o);
    },
    /** 入荷の確認（倉庫）。date＝入荷日（なければ今日） */
    receiveOrder(no: string, date?: string) {
      const o = find(no);
      /* 運営の入荷登録（課題 2-3）は仕入先の出荷報告がなくても入れる。取消・受注不可・本発注前は入荷にしない */
      if (!(o.hon > 0) || ['キャンセル', '受注不可'].includes(o.ans) || o.recv === '入荷済') throw new ApiError('本発注済みで未入荷の発注だけ入荷にできます', 409);
      o.recv = '入荷済';
      o.recvDate = date || today();
      log(o, '入荷確認');
      return save(o);
    },

    /** 運営Web（発注・入荷）の書き換え。まとめて1つのトランザクションで動かす */
    runOps(op: OpsOp): Order[] {
      return repo.transaction(() => {
        switch (op.op) {
          case 'create':
            return op.orders.map((src) => {
              if (repo.getOrder(src.no)) throw new ApiError(`同じ発注番号がすでにあります（${src.no}）`, 409);
              if (!(src.kari > 0)) throw new ApiError(`数量は1以上にしてください（${src.no}）`, 400);
              if (!repo.addOrder) throw new ApiError('この環境では発注を作れません', 501);
              const o = structuredClone(src);
              stampCost(o);
              syncOrder(o);
              repo.addOrder(o);
              return o;
            });
          case 'reviseKari': {
            const o = find(op.no);
            if (!['納期回答待ち', '納期回答済'].includes(o.ans) || o.hon > 0) throw new ApiError(`本発注の前の発注だけ直せます（${op.no}）`, 409);
            const qty = op.rows.reduce((a, r) => a + r.qty, 0);
            if (!(qty > 0)) throw new ApiError('仮発注の数量は1以上にしてください', 400);
            const prev = o.kari;
            o.rows = op.rows;
            o.kari = qty;
            if (op.wishBB !== undefined) o.wishBB = op.wishBB;
            if (op.reanswer) {
              if (qty !== prev) o.re = { prev: o.re?.prev ?? prev };
              o.ans = '納期回答待ち';
              o.parts = [];
              o.seen = false;
            }
            log(o, qty !== prev ? `仮発注の数量変更（${prev} → ${qty}${o.unit}）` : '仮発注の更新（入荷希望日など）');
            return [save(o)];
          }
          case 'issueHon':
            return op.items.map((x) => svc.issueHon(x.no, x.qty, x.rows));
          case 'changeHon': {
            const o = find(op.no);
            if (!(o.hon > 0) || o.honAck || o.ans === '出荷済' || o.ans === 'キャンセル') throw new ApiError('仕入先が本発注を承認する前だけ直せます', 409);
            if (!(op.qty > 0)) throw new ApiError('1以上の数を入れてください', 400);
            const prev = o.hon;
            o.hon = op.qty;
            if (op.rows) o.rows = op.rows;
            o.seen = false;
            log(o, `本発注数 ${prev} → ${op.qty}`);
            return [save(o)];
          }
          case 'cancel':
            return op.nos.map((no) => svc.cancelOrder(no, op.reason));
          case 'receive':
            return [svc.receiveOrder(op.no, op.date)];
          case 'proxyAnswer': {
            const o = find(op.no);
            if (!canAnswer(o)) throw new ApiError('この発注は回答できません', 409);
            o.parts = [{ eta: op.eta, qty: qtyOf(o), st: '未出荷' }];
            o.ans = '納期回答済';
            o.re = null;
            o.proxy = `${nowStamp()} 運営が代理入力（${op.how}で受付）`;
            log(o, `納期回答を代理入力（${op.eta}）`);
            return [save(o)];
          }
          case 'proxyHon': {
            const o = find(op.no);
            if (!(o.hon > 0) || o.honAck) throw new ApiError('この本発注は承認を入力できません', 409);
            if (!op.dlv || !(op.box > 0)) throw new ApiError('納品日と入荷箱数を入れてください', 400);
            /* 賞味期限（消費期限）は必須（資材は持たない・台帳 E 2026-10-05） */
            if (o.type !== '資材' && !op.bb) throw new ApiError(`${o.type === '短消費期限' ? '消費期限' : '賞味期限'}を入れてください`, 400);
            o.parts = [{ eta: o.eta || addDaysSlash(op.dlv, -1), dlv: op.dlv, qty: o.hon, box: op.box, ...(o.type !== '資材' && op.bb ? { bb: op.bb } : {}), st: '未出荷' }];
            if (o.ans === '納期回答待ち') o.ans = '納期回答済';
            o.honAck = true;
            o.honAckAt = nowStamp();
            o.proxy = `${nowStamp()} 運営が本発注の承認を代理入力`;
            log(o, '本発注の承認を代理入力');
            return [save(o)];
          }
          case 'proxyShip': {
            const o = find(op.no);
            if (!o.honAck || o.ans === '出荷済' || o.ans === 'キャンセル' || o.ans === '受注不可') throw new ApiError('この発注は出荷報告を入力できません（本発注の承認後・出荷前だけ）', 409);
            const i = o.parts.findIndex((p) => p.st === '未出荷');
            if (i < 0) throw new ApiError('出荷していない回がありません', 409);
            const p = o.parts[i];
            /* 仕入先の出荷報告と同じ確かめ（配送方法・出荷日・送り状番号の形式・賞味期限）。賞味期限は本発注の承認で入れた値が初期値 */
            const method = op.method || p.method || '直送（運送会社利用）';
            const bb = op.bb || p.bb || '';
            const er = Object.values(validateShip(o, { method, ship: op.ship, carrier: op.carrier, slip: op.slip, bb, note: p.note ?? '' }))[0];
            if (er) throw new ApiError(er, 400);
            const out = svc.reportShipment({ no: op.no, partIndex: i, method, ship: op.ship, carrier: op.carrier, slip: op.slip, bb: o.type === '資材' ? undefined : bb, note: p.note ?? '' });
            out.proxy = `${nowStamp()} 運営が出荷報告を代理入力`;
            log(out, `出荷報告を代理入力（${op.ship}${op.slip ? `・送り状 ${op.slip}` : ''}）`);
            return [save(out)];
          }
          case 'simAnswer':
            return svc.answerOrders([{ no: op.no, parts: [{ eta: op.eta, qty: qtyOf(find(op.no)) }] }]);
          case 'simHon': {
            const o = find(op.no);
            if (o.ans === '納期回答待ち') {
              o.ans = '納期回答済';
              save(o);
            }
            return svc.approveHon([{ no: op.no, parts: op.parts }]);
          }
          case 'simShip': {
            const o = find(op.no);
            if (!o.parts.length) o.parts = [{ eta: op.ship, qty: qtyOf(o), st: '未出荷' }];
            save(o);
            let out = o;
            o.parts.forEach((p, i) => {
              if (p.st !== '未出荷') return;
              out = svc.reportShipment({ no: op.no, partIndex: i, method: '直送（運送会社利用）', ship: op.ship, carrier: op.carrier, slip: op.slip, bb: op.bb, note: '' });
            });
            return [out];
          }
          case 'simReject':
            return [svc.rejectOrder(op.no, op.reason, op.comment)];
        }
      });
    },

    version: () => repo.version(),
  };
  return svc;
}

export type SupplierService = ReturnType<typeof supplierService>;
