'use client';

import driver from '@/lib/driver/area';
import type { DeliveryView, PointView } from '@/lib/driver/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useDriverSignedIn } from './DriverProvider';

export const driverApi = () => areaApi(driver);

/** 今日の受取地点・配送（自分の担当分だけ） */
export function useDay() {
  const { staff } = useDriverSignedIn();
  const q = useQuery(driverApi(), 'day', { staff });
  const d = q.data;
  return {
    ...q,
    data: d,
    ptOf: (id: string): PointView | undefined => d?.points.find((p) => p.id === id),
    delsOf: (id: string): DeliveryView[] => d?.dels.filter((x) => x.pt === id) ?? [],
  };
}
