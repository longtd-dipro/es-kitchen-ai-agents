'use client';

import { OpsCsvImportPage } from '@/app/ops/_ui/CsvImportPage';

const BACK = '/ops/masters/categories';

/** 商品カテゴリ の CSV取込（画面。lib/csv/master.ts の categories。保存は画面と同じ menu.saveCat） */
export default function Page() {
  return (
    <OpsCsvImportPage look="es" crumbs={['マスタ管理', ['商品カテゴリ管理', BACK]]} title="商品カテゴリ CSV取込" back={BACK} entity="categories"
      desc={<>キーは商品カテゴリID（空欄＝新規・採番）。カテゴリ画像は画面で登録した画像の名前（photo:…）を入れます（CSV で画像は送れません）。</>} />
  );
}
