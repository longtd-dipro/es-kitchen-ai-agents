import type { CsvEntity } from '@/lib/domain/csv';
import { branches, contractsEntity, corps, menu, menuRequest, receiving, stockMoves } from './data';
import { carrierEsFees, carriers, categories, devices, discounts, drivers, materials, options, plans, products, suppliers, tags, warehouses } from './master';
import { carrierStaff, supplierAnswers } from './sites';
import { surveyQuestions } from './survey';
import { newApplications } from './apply';
import { discountApply } from './discountApply';
import { migrationContacts, migrationLoans, migrationPrices, migrationSites } from './migrate';

/*
 * CSV のエンティティ（出力の列・取込のテンプレートと保存）の一覧。画面は id で呼ぶ（POST /api/domain/csv/<名前>  args.entity）。
 * 決まり：00_確認してほしい/CSV入出力_定義_20261003.md、仕組み：lib/domain/csv.ts、部品：components/csv/*
 */
export const CSV_ENTITIES: Record<string, CsvEntity> = Object.fromEntries(([
  /* 運営：マスタ */
  products, categories, tags, plans, devices, options, discounts, warehouses, carriers, carrierEsFees, drivers, suppliers, materials, discountApply,
  /* 運営：データ */
  corps, branches, contractsEntity, menu, menuRequest, receiving, stockMoves, surveyQuestions, newApplications,
  /* 既存のお客様の移行（取込だけ・受付簿 No.28） */
  migrationSites, migrationLoans, migrationContacts, migrationPrices,
  /* 仕入先サイト・委託配送先Web */
  supplierAnswers, carrierStaff,
] as CsvEntity[]).map((e) => [e.id, e]));

/** エンティティの id（画面で使う） */
export type CsvEntityId = keyof typeof CSV_ENTITIES;
