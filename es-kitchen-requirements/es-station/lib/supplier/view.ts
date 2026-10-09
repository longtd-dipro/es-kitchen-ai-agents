import type { Order, Supplier } from './types';

/*
 * 仕入先サイトへ返す形（台帳 I「仕入先に見せる金額」：仕入先には金額を見せない）。
 * 仕入単価（Order.unitCostYen・Supplier.products の6番目）と、システムに持たない口座・インボイスは、API の応答に入れない。
 * 運営側は lib/supplier/service.ts の値をそのまま使うので、サーバーの仕入先サイトの API（app/api/supplier）と、ブラウザだけのモックの返し口で通す。
 */
export function orderView(o: Order): Order {
  const { unitCostYen: _cost, ...rest } = o;
  return rest as Order;
}

export function supplierView(s: Supplier): Supplier {
  return {
    ...s,
    invoice: '',
    bank: { name: '', branch: '', type: '', no: '', holder: '' },
    products: (s.products ?? []).map((r) => r.slice(0, 5) as Supplier['products'][number]),
  };
}

/** プロフィールで仕入先が直せる項目（台帳 F 2026-10-07：連絡先〈電話・メール・担当者・住所〉だけ）。ほかは見るだけ */
export const EDITABLE_SUPPLIER_FIELDS = ['zip', 'tel', 'addr', 'factory'] as const;

/** 送られた値のうち、直してよい項目だけを現在の値に重ねる（サーバー・モックの両方で使う） */
export function applyContactEdit(cur: Supplier, patch: Partial<Supplier>): Supplier {
  const next: Supplier = { ...cur };
  for (const k of EDITABLE_SUPPLIER_FIELDS) if (typeof patch[k] === 'string') next[k] = patch[k] as string;
  if (Array.isArray(patch.contacts)) {
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    next.contacts = patch.contacts.slice(0, 20).map((c, i) => ({
      kind: i === 0 ? 'メイン担当者' : 'サブ担当者', name: str(c?.name), kana: str(c?.kana), mail: str(c?.mail), tel: str(c?.tel),
    }));
    if (!next.contacts.length) next.contacts = cur.contacts;
  }
  /* 申込の担当者（平らな pic・mail・picTel）も、メイン担当者に合わせる（運営の一覧が読む） */
  const main = next.contacts[0];
  if (main) Object.assign(next, { pic: main.name, picKana: main.kana, mail: main.mail, picTel: main.tel });
  return next;
}

/** 担当者が空の仕入先（申込から承認した行など）に、申込の担当者（pic・mail・picTel）を「メイン担当者」として入れる（仕入先サイトは contacts[0] を読む） */
export function withMainContact<T extends Supplier>(s: T): T {
  if (s.contacts?.length) return s;
  return { ...s, contacts: [{ kind: 'メイン担当者', name: s.pic ?? '', kana: s.picKana ?? '', mail: s.mail ?? '', tel: s.picTel || s.tel || '' }] };
}
