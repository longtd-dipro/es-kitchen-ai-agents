// 仕入先サイトのモックの発注データを、デモ（02_デモ/50_仕入先_まとめ.html の window.S6DATA）から取り出す。
// S6DATA は運営デモの発注データから作られている。見本データを最新にしたいときだけ流す。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, '..', '02_デモ', '50_仕入先_まとめ.html'), 'utf8');
const m = html.match(/window\.S6DATA\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/);
if (!m) throw new Error('S6DATA が見つかりません');
const data = JSON.parse(m[1]);
writeFileSync(join(root, 'mocks', 'supplier', 'orders.source.json'), JSON.stringify(data, null, 1) + '\n');
console.log(`[mock:extract] orders ${data.orders.length} 件を mocks/supplier/orders.source.json に書き出しました`);
