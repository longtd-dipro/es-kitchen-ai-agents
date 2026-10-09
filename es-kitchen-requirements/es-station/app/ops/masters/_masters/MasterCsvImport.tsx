"use client";

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { CsvImportModal } from '@/components/csv/CsvImportModal';
import { specOf } from '@/lib/ops/masters/logic';
import type { MasterKind } from '@/lib/ops/masters/types';
import { OPS_CSV_UI, OPS_ID } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useScreenCan } from '../../_ui/perm';
import { DemoTop } from './DemoTop';
import { BASE, DETAIL_CLS } from './routes';

/*
 * マスタの CSV取込の画面（モーダルではなく1つの画面。hong 2026/10/05「アンケートの CSV取込と同じように画面にする」）。
 *   上：見出し（パンくず・画面名・キャンセル／登録）
 *   1. ファイルを選ぶ → 2. 確認・登録（components/csv/CsvImportModal の中身をそのまま。枠だけ画面用）
 *   CSVの列（テンプレートの定義：列名・必須・長さ・チェック）は画面には出さない。画面設計書の項目定義に書く（hong 2026/10/05。API csv.columns は設計書を作るときに使う）
 * entity：kind（plans／devices／options／discounts）か discountApply（値引きの適用）
 */
export default function MasterCsvImport({ kind, entity, title }: { kind: MasterKind; entity?: string; title?: string }) {
  const router = useRouter();
  const { account, toast } = useOps();
  const can = useScreenCan();
  const spec = specOf(kind);
  const ent = entity ?? kind;
  const label = title ?? `${spec.list.title.replace(/一覧$/, '')} CSV取込`;
  const listUrl = BASE[kind];
  useEffect(() => { if (!can('csvImport')) router.replace(listUrl); }, [can, router, listUrl]);

  /* CsvImportModal の枠：モーダルではなく画面。アンケートの CSV取込と同じ形（.ph の見出し＋ボタン、手順はカードの外の中央、カードに見出し。hong 2026/10/05「UI/UX 改善」） */
  const Frame = ({ footer, step, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode; step: 1 | 2 }) => (
    <>
      <div className="csvph">
        <div>
          <div className="crumb"><span>{spec.list.crumb0}</span><span><a href="#" className="lnk" onClick={(e) => { e.preventDefault(); router.push(listUrl); }}>{spec.list.title}</a></span><span>{label}</span></div>
          <h1>{label}</h1>
        </div>
        <div className="btns">{footer}</div>
      </div>
      <ol className="steps" aria-label="取込の手順" style={{ justifyContent: 'center' }}>
        <li className={step === 2 ? 'done' : 'cur'}><i>1</i>ファイルを選ぶ</li>
        <li className={step === 2 ? 'cur' : ''}><i>2</i>確認・登録</li>
      </ol>
      <div className="card" id="sec-csv">
        <div className="ch">{step === 2 ? '確認・登録' : 'ファイルを選ぶ'}</div>
        <div className="cb">{children}</div>
      </div>
    </>
  );

  return (
    <div className="wrap">
      <DemoTop kind={kind} />
      <section className={`screen s-${DETAIL_CLS[kind]} csvpage`}>
        <CsvImportModal
          ui={{ ...OPS_CSV_UI, Frame, stepsInFrame: true, pri: 'btn pri lg', out: 'btn out lg' }} entity={ent} title={label} by={account?.id ?? OPS_ID} notify={toast}
          onClose={() => router.push(listUrl)}
          desc={kind === 'plans' && ent === 'plans'
            ? <>1つのファイルに プラン／コース／価格／設備 の行を入れます（決定 28-183）。プランID なら上書き、仮キー（例：新規1）なら新規。価格の行は「削除」＝1 で削除（使われていない世代だけ）。設備の行はプラン×コースごとに入れ替えます。</>
            : ent === 'discountApply'
              ? <>1行＝値引き × 拠点 × 適用開始月。適用開始月から先（適用終了月まで。空欄＝ずっと）の子契約に値引きを付け、終了月より後は外します。確定・請求済の月は変えません。</>
              : undefined}
        />
      </section>
    </div>
  );
}
