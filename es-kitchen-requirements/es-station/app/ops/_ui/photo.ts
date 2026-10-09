import { PHOTO_MAX_SIDE } from '@/lib/ops/general/productCheck';

/*
 * 運営Web の写真のアップロードの部品（商品マスタの商品写真・資材マスタの写真で同じ）。
 * 形式は PNG・JPEG・WebP、1枚 5MB 以内、長い辺 1200px 以内（エラーは E268）。縮小はしない（受付簿 #236）
 */
export const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const PHOTO_BYTES = 5 * 1024 * 1024;
/** 形式と大きさ（バイト）が決まりに合うか（長い辺は readPhoto が確かめる） */
export const photoFileOk = (f: File) => PHOTO_TYPES.includes(f.type) && f.size <= PHOTO_BYTES;

/** 選んだ写真を data URL にする（縮小しない：2026-10-06 受付簿 #236）。長い辺が 1200px をこえるときは null */
export async function readPhoto(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (Math.max(img.width, img.height) > PHOTO_MAX_SIDE) return null;
  } finally { URL.revokeObjectURL(url); }
  return await new Promise<string>((ok, ng) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => ng(r.error); r.readAsDataURL(file); });
}
