'use client';

import { useRouter } from 'next/navigation';
import { type ComponentProps, type ReactNode } from 'react';
import { CsvImportModal } from '@/components/csv/CsvImportModal';
import { OPS_CSV_UI, OPS_ID } from './csv';
import { useOps } from './OpsProvider';
import { useScreenCan } from './perm';

/*
 * CSV取込の画面（モーダルではなく1つの画面。hong 2026/10/05・台帳 F「CSV取込の画面」）。マスタの MasterCsvImport と同じ形：
 *   上：見出し（パンくず・画面名・キャンセル／登録）
 *   1. ファイルを選ぶ → 2. 確認・登録（components/csv/CsvImportModal の中身をそのまま。枠だけ画面用）
 *   CSVの列（テンプレートの定義）の表は画面に出さない（台帳 F「CSVテンプレートの定義の置き場」）
 * 一覧の「CSV取込」→ この画面（…/import）。キャンセル・登録のあとは back（元の一覧）へ戻る。
 * 権限：今の画面の「CSV取込」がなければ開けない（OpsShell が「この画面を見る権限がありません」を出す。ここでは何も出さない）
 *   look='ops'：運営の標準の見出し（.ph）＋ .card ／ look='es'：ES Kitchen の見た目（法人・メニュー・カテゴリ）
 */
export type OpsCsvImportPageProps = Omit<ComponentProps<typeof CsvImportModal>, 'ui' | 'by' | 'onClose' | 'notify'> & {
  /** パンくず（画面名の前まで。[名前, URL] はリンク） */
  crumbs: (string | [string, string])[];
  title: string;
  /** 戻り先（元の一覧・編集の画面） */
  back: string;
  look?: 'ops' | 'es';
  /** 権限の確かめに使う機能（省略＝今の画面の機能） */
  feature?: string;
};

export function OpsCsvImportPage({ crumbs, title, back, look = 'ops', feature, ...p }: OpsCsvImportPageProps) {
  const router = useRouter();
  const { account, toast } = useOps();
  const can = useScreenCan();
  const allowed = can('csvImport', feature);
  const go = (href: string) => router.push(href);
  const crumb = (c: string | [string, string], i: number) =>
    typeof c === 'string' ? <span key={i}>{c}</span> : <span key={i}><button type="button" className="lnk u" onClick={() => go(c[1])}>{c[0]}</button></span>;

  const Frame = look === 'es'
    ? ({ footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) => (
      <>
        <header className="es-pagehead">
          <div className="es-pagehead__text">
            <nav className="es-breadcrumb" aria-label="パンくず">
              {crumbs.map((c, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  {typeof c === 'string' ? <span>{c}</span> : <a href={c[1]} onClick={(e) => { e.preventDefault(); go(c[1]); }}>{c[0]}</a>}
                  <span className="es-breadcrumb__sep">/</span>
                </span>
              ))}
              <span className="es-breadcrumb__cur">{title}</span>
            </nav>
            <h1 className="es-pagehead__title">{title}</h1>
          </div>
          <div className="es-pagehead__actions">{footer}</div>
        </header>
        <section className="es-card">{children}</section>
      </>
    )
    : ({ footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) => (
      <>
        <div className="ph">
          <div>
            <div className="crumb">{crumbs.map(crumb)}<span>{title}</span></div>
            <h1>{title}</h1>
          </div>
          <div className="btns">{footer}</div>
        </div>
        <div className="card">{children}</div>
      </>
    );

  if (!allowed) return null;
  return <CsvImportModal ui={{ ...OPS_CSV_UI, Frame }} by={account?.id ?? OPS_ID} notify={toast} onClose={() => go(back)} title={title} {...p} />;
}

/** 画面の中に埋め込む CSV取込（アンケートの CSV取込の ① のように、見出しは画面が持つとき）。カードの中に手順・ファイル選択・確認、下にボタン */
export function OpsCsvImportCard(p: Omit<ComponentProps<typeof CsvImportModal>, 'ui' | 'by' | 'notify'>) {
  const { account, toast } = useOps();
  const Frame = ({ footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) => (
    <div className="card">
      {children}
      <div className="btns" style={{ display: 'flex', gap: '0.571429rem', justifyContent: 'flex-end', marginTop: '0.857143rem' }}>{footer}</div>
    </div>
  );
  return <CsvImportModal ui={{ ...OPS_CSV_UI, Frame }} by={account?.id ?? OPS_ID} notify={toast} {...p} />;
}
