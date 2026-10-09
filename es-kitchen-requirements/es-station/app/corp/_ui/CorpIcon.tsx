import { CORP_ICONS } from '@/lib/corp/icons';

/** 法人Web の枠のアイコン（lib/corp/icons.ts の SVG をそのまま出す） */
export function CorpIcon({ name }: { name: string }) {
  const svg = CORP_ICONS[name];
  if (!svg) return null;
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
