import type { DeliveryView, PointView } from '@/lib/driver/types';

/** 受取地点の画面（倉庫・中継先） */
export const ptHref = (p: Pick<PointView, 'id' | 'type'>) => `/driver/receive${p.type === 'hub' ? '/hub' : ''}?id=${encodeURIComponent(p.id)}`;
/** 配送の画面（ES配送便・COOL便） */
export const delHref = (d: Pick<DeliveryView, 'no' | 'type'>) => `/driver/${d.type === 'es' ? 'es' : 'cool'}/${encodeURIComponent(d.no)}`;
