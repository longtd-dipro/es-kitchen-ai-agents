'use client';

import { api } from '@/lib/api/supplier';
import { useSupplier } from '@/lib/supplier/store';

/** 添付・マニュアルのファイルを開く（URL は API からもらう） */
export function useDownload() {
  const { toastError } = useSupplier();
  return async (file: string) => {
    try {
      const url = await api.getFileUrl(file);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      toastError(e);
    }
  };
}
