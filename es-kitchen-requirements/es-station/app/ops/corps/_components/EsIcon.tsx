import { ES_ICONS } from './esIcons';

/** ES Kitchen のアイコン（一覧の検索・CSV・編集・ページ送り） */
export function EsIcon({ name, size = 18 }: { name: keyof typeof ES_ICONS | string; size?: number }) {
  const i = ES_ICONS[name];
  if (!i) return null;
  const stroke = i.stroke ? { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const } : { fill: 'currentColor' };
  return <svg className="es-icon" width={size} height={size} viewBox="0 0 32 32" {...stroke} aria-hidden="true" dangerouslySetInnerHTML={{ __html: i.d }} />;
}
