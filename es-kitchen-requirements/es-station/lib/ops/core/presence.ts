import type { DocRepo } from './area';

/*
 * 「〇〇さんが編集中です」の記録（I02・台帳 K「同時に編集」：ロックしない・先に知らせる）。法人・拠点・子契約（contracts）とマスタ（masters）で共通。
 * 画面は PRESENCE_BEAT_MS ごとに送り、PRESENCE_TTL_MS 音沙汰がなければ編集中でなくなる。時刻は実時間（エポックミリ秒）
 */
export const PRESENCE_BEAT_MS = 30_000;
export const PRESENCE_TTL_MS = 90_000;
export type PresenceRow = { id: string; entity: string; targetId: string; accountId: string; name: string; since: number; at: number };

/** 自分の分を記録（leave なら消す）して、ほかの人の編集中（TTL 以内）を返す。期限切れは片づける */
export function touchPresence(
  repo: DocRepo, collection: string,
  a: { entity: string; id: string; accountId: string; name: string; leave?: boolean; now?: number },
) {
  const now = a.now ?? Date.now();
  const rows = repo.list<PresenceRow>(collection);
  for (const r of rows) if (now - r.at > PRESENCE_TTL_MS) repo.remove(collection, r.id);
  const key = `${a.entity}:${a.id}:${a.accountId}`;
  const mine = rows.find((r) => r.id === key && now - r.at <= PRESENCE_TTL_MS);
  if (a.leave) repo.remove(collection, key);
  else repo.put<PresenceRow>(collection, key, { id: key, entity: a.entity, targetId: a.id, accountId: a.accountId, name: a.name, since: mine?.since ?? now, at: now });
  return rows
    .filter((r) => r.entity === a.entity && r.targetId === a.id && r.accountId !== a.accountId && now - r.at <= PRESENCE_TTL_MS)
    .map((r) => ({ accountId: r.accountId, name: r.name, since: r.since }));
}
