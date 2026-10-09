'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '../../_ui/Icon';
import { useScreenCan } from '../../_ui/perm';
import { PageHead } from '../../_ui/ui';
import { MIG_BASE, MIG_FILES, MIG_IMPORT, MIG_ORDER, SampleRows } from '../_components/MigrationImport';

/**
 * 移行CSV取込（既存のお客様・約600社。受付簿 No.28・契約_01 §9-1）：取り込むファイルを選ぶ画面。
 * ファイルは4つ（A 法人・拠点・契約／B 設備／C 担当者／D 企業独自価格）。どれも「1. ファイルを選ぶ → 2. 確認・登録」の2段階の画面（…/import/<ファイル>）。
 * キーはフェーズ1の ID。取り込むと利用中の法人・拠点・契約が直接できる（受付・承認なし・メールなし）。足りない項目は「移行の要補完」に出る。
 */
export default function Page() {
  const router = useRouter();
  const can = useScreenCan();
  return (
    <>
      <PageHead crumbs={['法人・契約管理', '移行の要補完', '移行CSV取込']} title="移行CSV取込">
        <button className="btn out lg" onClick={() => router.push(MIG_BASE)}>移行の要補完へ戻る</button>
      </PageHead>
      <div className="card">
        <p className="hint" style={{ margin: '0 0 0.857143rem', lineHeight: 1.7 }}>
          フェーズ1にいる既存のお客様（約600社）をまとめて入れます。IDはフェーズ1の ID のまま（法人・拠点とも CU＋5桁）で、同じキーのファイルは何度でも取り込み直せます（更新）。
          受付・承認は通らず、法人・拠点・親契約・子契約は<b>利用中</b>で作ります（フェーズ1の状態が仮登録のお客様は仮登録のまま取り込み、申込の受付に載せます。休止中は利用休止。解約済・削除済は取り込みません。メールは送りません）。足りない項目は空のまま取り込めて、「移行の要補完」に出ます。
          配送（枠・倉庫・配送会社）はフェーズ1から出せないため入れません（移行のあとで運営が入れます）。
        </p>
        <p className="hint" style={{ margin: '0 0 0.857143rem', lineHeight: 1.7 }}>取り込む順番：<b>A → B・C・D</b>（B〜D は A で作った拠点IDに結びつけます）。</p>
        <div style={{ display: 'grid', gap: '1.142857rem' }}>
          {MIG_ORDER.map((k) => {
            const f = MIG_FILES[k];
            return (
              <section key={k} className="card" style={{ margin: 0 }} aria-label={`${f.mark}. ${f.title}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.142857rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.285714rem', margin: 0 }}>{f.mark}. {f.title}</h2>
                    <div className="hint">{f.unit}・キー＝{f.key}</div>
                  </div>
                  <button className="btn csv lg" disabled={!can('csvImport')} onClick={() => router.push(`${MIG_IMPORT}/${k}`)}><Icon name="upl" />{f.mark} を取り込む</button>
                </div>
                <p className="hint" style={{ margin: '0.571429rem 0 0', lineHeight: 1.7 }}>{f.lead}</p>
                <SampleRows entity={f.entity} />
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
