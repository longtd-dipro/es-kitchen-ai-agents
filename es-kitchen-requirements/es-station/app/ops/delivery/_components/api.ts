import { areaApi } from '@/lib/ops/core/client';
import delivery from '@/lib/ops/areas/delivery';

/** 配送管理の領域を呼ぶ口 */
export const api = areaApi(delivery);
