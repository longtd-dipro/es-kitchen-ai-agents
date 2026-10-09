/** 5つのサイトの入口。done＝画面がある／todo＝まだ作っていない（仕様は 02_デモ の HTML を見る） */
export type Site = {
  key: 'ops' | 'corp' | 'carrier' | 'driver' | 'supplier';
  no: string;
  name: string;
  href: string;
  /** 仕様の参照先（02_デモ のファイル） */
  spec: string;
  status: 'done' | 'todo';
};

export const SITES: Site[] = [
  { key: 'ops', no: '10', name: '運営Web', href: '/ops', spec: '02_デモ/10_運営_まとめ.html', status: 'done' },
  { key: 'corp', no: '20', name: '法人Web', href: '/corp', spec: '02_デモ/20_法人_まとめ.html', status: 'done' },
  { key: 'carrier', no: '30', name: '委託配送先Web', href: '/carrier', spec: '02_デモ/30_委託配送先_まとめ.html', status: 'done' },
  { key: 'driver', no: '40', name: 'ドライバー', href: '/driver', spec: '02_デモ/40_ドライバーブラウザ.html', status: 'done' },
  { key: 'supplier', no: '50', name: '仕入先サイト', href: '/supplier/login', spec: '02_デモ/50_仕入先_まとめ.html', status: 'done' },
];

export const siteOf = (key: Site['key']) => SITES.find((s) => s.key === key)!;
