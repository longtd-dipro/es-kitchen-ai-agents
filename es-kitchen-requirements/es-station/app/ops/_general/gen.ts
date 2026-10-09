/*
 * 一覧だけの画面（元の GEN）の見出し・ボタン・検索条件・列。値は元の最終の形（STEP… の後付けを入れたもの）。
 * 列：[キー, 見出し, 種類]。種類＝link（詳細へのリンク）・u（下線）・num（右寄せ）・clip（省略）・chip・ed/e/d（操作の列のボタン）
 */
import type { GenKey } from '@/lib/ops/general/types';
import type { ListFilter } from './list/types';


export type GenBtn = 'import' | 'csv' | 'new' | 'acct' | 'perm' | 'user';
export type GenCol = [key: string, label: string, type?: string];
export type GenConfig = { crumbs: string[]; title: string; btns: GenBtn[]; tabs?: string[]; filters: ListFilter[] | null; cols: GenCol[] };

export const GEN: Record<GenKey, GenConfig> = {
  product: {
    crumbs: ["マスタ管理","商品マスタ"],
    title: "商品マスタ",
    btns: ["import","csv","new"],
    /* カテゴリ・仕入先の選択肢は画面で共通データから入れ直す（app/ops/masters/products/page.tsx） */
    /* 商品名は管理名（2026/10/03 決定：運営の一覧は管理名＋品番）。コースで絞り込める（RD-MN-004）・賞味期限の列（RD-MN-078） */
    filters: [{"t":"search","ph":"品番・商品名（管理名・公開名）・カテゴリ・仕入先","keys":["id","name","pubName","cat","sup"]},{"t":"select","ph":"全てカテゴリ","col":"cat","opts":[]},{"t":"select","ph":"コース","col":"course","opts":["ライト","スタンダード"]},{"t":"select","ph":"保管方法（管理用）","col":"keepAdmin","opts":["冷蔵","冷凍","常温"]},{"t":"select","ph":"仕入先","col":"sup","opts":[]},{"t":"select","ph":"状態","col":"status","opts":["有効","無効","削除済","すべて"],"init":"有効","all":"すべて"}],
    /* 状態：既定は「有効」だけ。「無効」「削除済」「すべて」で絞り込める（2026-10-06 台帳 F・受付簿 #232）。無効にするのは編集の状態欄（受付簿 #278） */
    cols: [["id","品番","link"],["name","商品名（管理名）","clip"],["nameEn","商品名（英語）"],["cat","カテゴリ"],["course","コース"],["keep","保管情報（表示用）"],["exp","ESの期限"],["sup","仕入先","clip"],["cost","仕入単価（税抜）","num"],["price","販売価格（税込）","num"],["gm","粗利率(%)","num"],["status","状態"],["_act","操作","ed"]],
  },
  consign: {
    crumbs: ["マスタ管理","配送関連","委託配送先"],
    title: "委託配送先",
    btns: ["acct","import","csv","new"],
    /* 列と条件を減らした（hong 2026-10-06）：区分・対応エリア・対応曜日・料金・保冷バッグ・追跡URL は詳細で見る */
    filters: [{"t":"search","ph":"委託配送先ID、委託配送先名、住所","span":2,"keys":["id","name","addr"]},{"t":"select","ph":"ステータス","col":"status","opts":["本登録","未発行","無効"]}],
    cols: [["id","委託配送先ID"],["name","委託配送先名","link"],["addr","住所","clip"],["pic","担当者名"],["tel","担当者の電話番号"],["status","ステータス"],["_act","操作","ed"]],
  },
  warehouse: {
    crumbs: ["マスタ管理","配送関連","倉庫マスタ"],
    title: "倉庫マスタ",
    btns: ["import","csv","new"],
    /* THOMAS連携・倉庫コードの列は外した（hong 2026-10-06。倉庫コードは詳細で見る） */
    filters: [{"t":"search","ph":"倉庫ID、倉庫名","keys":["id","name"]},{"t":"select","ph":"倉庫区分","col":"kind","opts":["ピッキング倉庫","ピッキング倉庫（資材）","中継倉庫","返送先"]},{"t":"select","ph":"ステータス","col":"status","opts":["有効","無効","削除済"]}],
    cols: [["id","倉庫ID"],["name","倉庫名","link"],["kind","倉庫区分"],["addr","住所","clip"],["pic","担当者名"],["tel","担当者の電話番号"],["status","ステータス"],["_act","操作","ed"]],
  },
  driver: {
    crumbs: ["マスタ管理","配送関連","配送スタッフ"],
    title: "配送スタッフ",
    btns: ["new"],
    /* 区分は 個人／会社所属（hong 2026-10-06：自社／委託 から置き換え） */
    filters: [{"t":"search","ph":"配送スタッフID、所属先、配送スタッフ名","keys":["id","org","name"]},{"t":"select","ph":"スタッフ区分","col":"kind","opts":["個人","会社所属"]},{"t":"select","ph":"ステータス","col":"status","opts":["有効","利用停止","免許未登録","無効"]}],
    cols: [["_lic","免許"],["id","配送スタッフID"],["name","配送スタッフ名","link"],["org","所属先"],["kind","区分"],["tel","電話番号"],["status","ステータス"],["_act","操作","ed"]],
  },
  cooler: {
    crumbs: ["マスタ管理","配送関連","保冷バッグ台帳"],
    title: "保冷バッグ台帳",
    btns: ["csv","new"],
    filters: [{"t":"search","ph":"番号、委託配送先名、配送スタッフ","keys":["no","carrier","staff"]},{"t":"select","ph":"都道府県","col":"pref","opts":[]},{"t":"select","ph":"委託配送先","col":"carrier","opts":[]},{"t":"select","ph":"種類","col":"kind","opts":["保冷バッグ","保冷剤"]},{"t":"select","ph":"状態","col":"status","opts":["貸与中","紛失","廃棄"]},{"t":"range","ph":"渡した日","col":"date"}],
    cols: [["no","番号"],["kind","種類"],["qty","数","num"],["carrier","委託配送先"],["pref","都道府県"],["staff","渡した配送スタッフ"],["date","渡した日"],["status","状態"],["memo","メモ","clip"],["_act","操作","e"]],
  },
  supplier: {
    crumbs: ["マスタ管理","仕入先マスタ"],
    title: "仕入先マスタ",
    btns: ["acct","import","csv","new"],
    /* 列と条件を減らした（hong の参考画面・2026-10-06）：発注方法・土日祝を営業日は詳細で見る */
    filters: [{"t":"search","ph":"仕入先ID、仕入先名","span":2,"keys":["id","name"]},{"t":"select","ph":"ステータス","col":"status","opts":["申込中","却下","本登録","未発行"]},{"t":"select","ph":"作れる商品","col":"goods","opts":["惣菜","弁当","肉類","魚類","サラダ・スープ","パン・ごはん","おにぎり・サンドイッチ","甘味・ドリンク","資材（箸・容器など）"]},{"t":"select","ph":"仕入れ先区分","col":"kind","opts":["通常商品","短消費期限商品","資材"]}],
    cols: [["id","仕入先ID"],["name","仕入先名","link u"],["addr","本社住所","clip"],["pic","担当者名"],["tel","担当者の電話番号"],["status","ステータス"],["_act","操作","ed"]],
  },
  perm: {
    crumbs: ["アカウント管理","権限"],
    title: "権限",
    btns: ["perm"],
    filters: [{"t":"search","ph":"権限名、備考","span":2,"keys":["name","note"]},{"t":"select","ph":"状態","col":"status","opts":["有効","削除済"]}],
    cols: [["name","権限名","link u"],["note","備考","clip"],["users","ユーザー数","num"],["status","状態"],["_act","操作","ed"]],
  },
  version: {
    crumbs: ["設定管理","バージョン&強制アップデート"],
    title: "バージョン&強制アップデート",
    btns: ["new"],
    filters: null,
    cols: [["_os","端末OS"],["ver","バージョン名"],["note","管理用備考"],["force","強制アップデート"],["upd","更新日"],["_act","操作","ed"]],
  },
  ip: {
    crumbs: ["設定管理","IPホワイトリスト管理"],
    title: "IPホワイトリスト管理",
    btns: ["new"],
    filters: null,
    cols: [["note","管理用備考"],["ip","IPアドレス"],["_act","操作","d"]],
  },
  notices: {
    crumbs: ["お知らせ設定","お知らせ一覧"],
    title: "お知らせ一覧",
    btns: ["new"],
    filters: [{"t":"search","ph":"お知らせID・タイトル・本文(部分一致)","keys":["id","title","body"]},{"t":"select","ph":"カテゴリ","col":"cat","opts":["お知らせ","メンテナンス","システム更新"]},{"t":"select","ph":"配信対象","col":"tgsTxt","opts":["法人・拠点","アプリユーザー","委託配送先","配送スタッフ","仕入先"]},{"t":"select","ph":"ステータス","col":"status","opts":["公開中","予約中","配信停止","終了","削除済"]},{"t":"range","ph":"配信日","col":"send"}],
    cols: [["id","ID","link u"],["cat","カテゴリ","chip"],["title","タイトル","clip"],["tgsTxt","配信対象","clip"],["how","配信方法"],["att","添付","num"],["upd","最終更新日"],["send","配信日時"],["period","表示期間"],["status","ステータス"],["_act","操作","ed"]],
  },
  accounts: {
    crumbs: ["アカウント管理","アカウント一覧"],
    title: "アカウント一覧",
    btns: [],
    tabs: ["運営","拠点","ユーザー","委託配送","仕入先","配送スタッフ"],
    filters: [{"t":"search","ph":"ユーザーID、ユーザー名","span":2,"keys":["id","name"]},{"t":"select","ph":"ロール","col":"role","opts":[]},{"t":"select","ph":"アカウント状態","col":"status","opts":["有効","無効","利用停止","削除済"]},{"t":"range","ph":"最終ログイン","col":"last"}],
    cols: [["id","ユーザーID"],["name","ユーザー名","link u"],["mail","メール"],["role","ロール"],["status","アカウント状態"],["last","最終ログイン"]],
  },
};
