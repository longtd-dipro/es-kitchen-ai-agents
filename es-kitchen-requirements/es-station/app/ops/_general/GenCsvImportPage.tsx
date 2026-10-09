'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { GenKey } from '@/lib/ops/general/types';
import { OpsCsvImportPage } from '../_ui/CsvImportPage';
import { GEN } from './gen';
import { GEN_CSV } from './GenListPage';

/**
 * 一覧だけの画面（GenListPage）の CSV取込の画面（…/import）。パンくず・画面名は gen.ts、取込の種類（lib/csv のエンティティ）は GEN_CSV。
 *   <GenCsvImportPage genKey="product" />
 */
export function GenCsvImportPage({ genKey, desc }: { genKey: GenKey; desc?: ReactNode }) {
  const g = GEN[genKey];
  const entity = GEN_CSV[genKey]?.entity;
  const back = usePathname().replace(/\/import$/, '');
  if (!entity) return null;
  const crumbs = g.crumbs.map((c, i) => (i === g.crumbs.length - 1 ? ([c, back] as [string, string]) : c));
  return <OpsCsvImportPage crumbs={crumbs} title={`${g.title} CSV取込`} back={back} entity={entity} desc={desc} />;
}
