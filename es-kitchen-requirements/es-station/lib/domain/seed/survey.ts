import type { Survey, SurveyAnswer, SurveyQuestion, SurveyResponse, SurveyTargetType, SurveyTemplate } from '../survey';
import { APP_USERS } from './app';

/*
 * アンケートの見本（今日＝2026/10/05）。
 *   SV-1020 削除済（下書きのまま削除）
 *   SV-1021 終了   9月メニュー満足度（アプリの利用者みんな・リマインド送信済）
 *   SV-1023 配信停止 アプリ使い勝手（3日で配信停止）
 *   SV-1024 公開中 月間ランチメニュー（10月）（全員＝有効な拠点のアプリの利用者）
 *   SV-1025 公開中 配送・お届け（大阪支店・ことぶき商会 本店 などの拠点の利用者を個別選択。一部は未回答）
 * 回答者はアプリの利用者だけ（2026/10/03 決定：法人・拠点のアカウントには出さない）。テンプレート ST-001〜003 は最初からある（消せない）
 *   SV-1026 予定中 年末年始メニューのご希望（本社・大阪支店の利用者を個別選択）
 * 回答は決まった乱数で作る（何度作っても同じ）
 */

/** 決まった乱数（mulberry32） */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pad = (n: number, w = 2) => String(n).padStart(w, '0');
/** 'YYYY/MM/DD HH:mm' ⇔ 分 */
const toMin = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10), +s.slice(11, 13), +s.slice(14, 16)) / 60000;
const ofMin = (m: number) => { const d = new Date(m * 60000); return `${d.getUTCFullYear()}/${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };

const SAT = ['とても満足', '満足', 'どちらともいえない', 'やや不満', '不満'];
const GENRE = ['和食', '洋食', '中華', 'エスニック', 'デザート'];
const Q = (id: string, order: number, text: string, type: SurveyQuestion['type'], required: boolean, options: string[] = []): SurveyQuestion => ({ id, order, text, type, required, options });

/** 自由記述の答えの見本 */
const FREE: Record<string, string[]> = {
  menu: [
    'エスニックのメニューをもっと試してみたいです。', 'デザート付きのプランが気に入っています。継続してほしいです。', '和食の煮物をもう少し増やしてほしいです。',
    '野菜の多いメニューがうれしいです。', 'ご飯の量を選べるとありがたいです。', '魚料理の種類が増えると助かります。', 'カレーの辛さを選べるようにしてほしいです。',
    '季節のメニューが楽しみです。', '温め時間の目安をパッケージに大きく書いてほしいです。', '麺類のメニューがあるとうれしいです。',
  ],
  want: ['鍋焼きうどん', '親子丼', 'ガパオライス', '豚の生姜焼き', 'サバの味噌煮', 'ビビンバ', 'ハンバーグ（デミグラス）', 'グリーンカレー', '筑前煮', '麻婆豆腐'],
  app: ['決済までの画面を減らしてほしいです。', '商品の写真をもっと大きく見たいです。', 'お気に入りから直接買えると便利です。', '在庫切れの表示が分かりやすいと助かります。'],
  deliv: ['お届けの時間の連絡が前日にあると助かります。', 'ドライバーさんの対応がいつも丁寧です。', '冷蔵庫の補充を昼前に終えてほしいです。', '資材の補充をもう少し多めにお願いします。'],
  year: ['おせち風の詰め合わせがあるとうれしいです。', '年明けは軽めのメニューを希望します。', '年越しそばを出してほしいです。'],
};

type Ans = (q: SurveyQuestion, rnd: () => number) => SurveyAnswer | null;
/** 重みつきで1つ選ぶ */
const pick = (w: number[], rnd: () => number) => { const t = w.reduce((a, b) => a + b, 0); let x = rnd() * t; for (let i = 0; i < w.length; i++) { x -= w[i]; if (x < 0) return i; } return w.length - 1; };
const single = (w: number[]): Ans => (q, rnd) => ({ qid: q.id, choice: [pick(w, rnd)] });
const multi = (p: number[], skip = 0): Ans => (q, rnd) => {
  if (!q.required && rnd() < skip) return null;
  const c = p.map((x, i) => (rnd() < x ? i : -1)).filter((i) => i >= 0);
  return { qid: q.id, choice: c.length ? c : [Math.floor(rnd() * p.length)] };
};
const free = (pool: string[], rate: number): Ans => (q, rnd) => (rnd() < rate ? { qid: q.id, text: pool[Math.floor(rnd() * pool.length)] } : null);

type Def = { s: Survey; ans: Record<string, Ans>; who: { type: SurveyTargetType; id: string }[]; until: string; seed: number };

const base = (p: Partial<Survey> & Pick<Survey, 'id' | 'name' | 'intro' | 'startAt' | 'endAt' | 'target' | 'questions'>): Survey => ({
  remind: { on: false, days: 3, sentAt: '' }, openedAt: '', stoppedAt: '', deletedAt: '',
  createdAt: '2026/08/20 10:00', createdBy: 'にっしぐち', history: [], ...p,
});

const activeUsers = APP_USERS.filter((u) => u.status === '有効');
const users = (pred: (i: number) => boolean) => activeUsers.filter((_, i) => pred(i)).map((u) => ({ type: 'user' as const, id: u.id }));
/** 配送・お届けのアンケート（SV-1025）の対象：大阪支店・ことぶき商会 本店などの拠点の利用者 */
const DELIVERY_BRANCHES = ['CU00871', 'CU00961', 'CU00950', 'CU01901', 'CU01903'];
const deliveryUsers = activeUsers.filter((u) => DELIVERY_BRANCHES.includes(u.branchId));

function defs(): Def[] {
  const s1020 = base({
    id: 'SV-1020', name: '試食会の参加希望（下書き）', intro: '11月の試食会の参加希望をうかがいます。',
    startAt: '2026/11/10 10:00', endAt: '2026/11/20 18:00',
    target: { mode: 'pick', picks: activeUsers.filter((u) => u.branchId === 'CU00643').slice(0, 3).map((u) => ({ type: 'user', id: u.id })) },
    questions: [Q('Q1', 1, '試食会に参加しますか。', '単一選択', true, ['参加する', '参加しない', '未定'])],
    createdAt: '2026/09/15 11:20', deletedAt: '2026/09/18 10:12',
    history: [{ at: '2026/09/15 11:20', what: '登録', by: 'にっしぐち' }, { at: '2026/09/18 10:12', what: '削除（削除済として残す）', by: 'にっしぐち' }],
  });
  const s1021 = base({
    id: 'SV-1021', name: '9月メニュー満足度アンケート', intro: '9月の月間メニューについてのアンケートです。所要時間は約2分です。回答期限は 2026/09/20 18:00 です。',
    startAt: '2026/09/01 08:00', endAt: '2026/09/20 18:00', remind: { on: true, days: 3, sentAt: '2026/09/17 09:00' }, openedAt: '2026/09/01 08:00',
    target: { mode: 'all', picks: [] },
    questions: [
      Q('Q1', 1, '9月のメニューに満足していますか。', '単一選択', true, SAT),
      Q('Q2', 2, 'よく選んだメニューのジャンルをお選びください。', '複数選択', true, GENRE),
      Q('Q3', 3, '1食の量はいかがでしたか。', '単一選択', true, ['多い', 'ちょうどよい', '少ない']),
      Q('Q4', 4, 'ご意見・ご要望があればご記入ください。', '自由記述', false),
    ],
    createdAt: '2026/08/25 15:00',
    history: [{ at: '2026/08/25 15:00', what: '登録', by: 'にっしぐち' }, { at: '2026/09/01 08:00', what: '回答開始のお知らせを送信', by: 'システム' }, { at: '2026/09/17 09:00', what: 'リマインド通知を送信（未回答者）', by: 'システム' }],
  });
  const s1023 = base({
    id: 'SV-1023', name: 'アプリ使い勝手アンケート', intro: 'アプリの使いやすさについて教えてください。',
    startAt: '2026/09/25 09:00', endAt: '2026/10/10 18:00', openedAt: '2026/09/25 09:00', stoppedAt: '2026/09/28 15:20',
    target: { mode: 'all', picks: [] },
    questions: [
      Q('Q1', 1, 'アプリは使いやすいですか。', '単一選択', true, ['とても使いやすい', '使いやすい', 'ふつう', '使いにくい']),
      Q('Q2', 2, 'よく使う機能をお選びください。', '複数選択', false, ['商品を探す', 'お気に入り', '購入履歴', 'レビュー']),
      Q('Q3', 3, '改善してほしい点をご記入ください。', '自由記述', false),
    ],
    createdAt: '2026/09/20 10:00',
    history: [{ at: '2026/09/20 10:00', what: '登録', by: 'にっしぐち' }, { at: '2026/09/25 09:00', what: '回答開始のお知らせを送信', by: 'システム' }, { at: '2026/09/28 15:20', what: '配信停止（設問の見直しのため）', by: 'にっしぐち' }],
  });
  const s1024 = base({
    id: 'SV-1024', name: '月間ランチメニューアンケート（10月）', intro: '10月の月間ランチメニューについてのアンケートです。目的：メニューの改善／所要時間：約3分／回答期限：2026/10/20 18:00。',
    startAt: '2026/10/01 08:00', endAt: '2026/10/20 18:00', remind: { on: true, days: 3, sentAt: '' }, openedAt: '2026/10/01 08:00',
    target: { mode: 'all', picks: [] },
    questions: [
      Q('Q1', 1, '現在ご利用中のメニューに満足していますか。', '単一選択', true, SAT),
      Q('Q2', 2, 'よく選ぶメニューのジャンルをお選びください。', '複数選択', true, GENRE),
      Q('Q3', 3, '価格に見合った内容だと感じますか。', '単一選択', true, SAT),
      Q('Q4', 4, 'サービス全体についてご意見・ご要望があればご記入ください。', '自由記述', false),
      Q('Q5', 5, '当社のサービスを何を通じて知りましたか？', '複数選択', true, ['Webサイト', 'SNS', '友人・知人からの紹介', '会社からの案内', 'その他']),
      Q('Q6', 6, '今後追加してほしいメニューをご記入ください。', '自由記述', false),
    ],
    createdAt: '2026/09/22 14:30',
    history: [
      { at: '2026/09/22 14:30', what: '登録', by: 'にっしぐち' },
      { at: '2026/09/24 10:05', what: '設問を変更（Q6 を追加）', by: 'にっしぐち' },
      { at: '2026/10/01 08:00', what: '回答開始のお知らせを送信', by: 'システム' },
    ],
  });
  const s1025 = base({
    id: 'SV-1025', name: '配送・お届けに関するアンケート', intro: 'ご利用の拠点へのお届けについてのアンケートです。お届けの時間・ドライバーの対応についてお聞かせください（約2分）。',
    startAt: '2026/10/01 09:00', endAt: '2026/10/31 18:00', remind: { on: true, days: 5, sentAt: '' }, openedAt: '2026/10/01 09:00',
    target: { mode: 'pick', picks: deliveryUsers.map((u) => ({ type: 'user' as const, id: u.id })) },
    questions: [
      Q('Q1', 1, 'お届けの時間に満足していますか。', '単一選択', true, SAT),
      Q('Q2', 2, 'ドライバーの対応はいかがですか。', '単一選択', true, SAT),
      Q('Q3', 3, 'この3か月で困ったことをお選びください。', '複数選択', false, ['お届けの遅れ', '数量の違い', '商品の破損', '連絡がない', '特になし']),
      Q('Q4', 4, 'お届けについてのご要望をご記入ください。', '自由記述', false),
    ],
    createdAt: '2026/09/26 16:10',
    history: [{ at: '2026/09/26 16:10', what: '登録', by: 'にっしぐち' }, { at: '2026/10/01 09:00', what: '回答開始のお知らせを送信', by: 'システム' }],
  });
  const s1026 = base({
    id: 'SV-1026', name: '年末年始メニューのご希望調査', intro: '12月・1月のメニュー作りの参考にします。',
    startAt: '2026/11/01 08:00', endAt: '2026/11/15 18:00',
    target: { mode: 'pick', picks: activeUsers.filter((u) => ['CU00643', 'CU00871'].includes(u.branchId)).map((u) => ({ type: 'user', id: u.id })) },
    questions: [
      Q('Q1', 1, '年末年始もサービスを利用しますか。', '単一選択', true, ['利用する', '利用しない', '未定']),
      Q('Q2', 2, '食べたいメニューのジャンルをお選びください。', '複数選択', true, GENRE),
      Q('Q3', 3, 'ご希望があればご記入ください。', '自由記述', false),
    ],
    createdAt: '2026/10/02 11:00',
    history: [{ at: '2026/10/02 11:00', what: '登録', by: 'にっしぐち' }],
  });

  return [
    { s: s1020, ans: {}, who: [], until: '', seed: 1 },
    {
      s: s1021, seed: 21, until: '2026/09/20 17:00',
      who: users((i) => i % 10 < 7),
      ans: { Q1: single([12, 20, 8, 4, 2]), Q2: multi([0.6, 0.45, 0.35, 0.2, 0.25]), Q3: single([3, 14, 5]), Q4: free(FREE.menu, 0.35) },
    },
    {
      s: s1023, seed: 23, until: '2026/09/28 15:00',
      who: users((i) => i % 9 === 0),
      ans: { Q1: single([2, 5, 4, 2]), Q2: multi([0.7, 0.5, 0.4, 0.2], 0.2), Q3: free(FREE.app, 0.5) },
    },
    {
      s: s1024, seed: 24, until: '2026/10/04 20:00',
      who: users((i) => i % 5 < 3),
      ans: { Q1: single([10, 25, 5, 6, 2]), Q2: multi([0.55, 0.5, 0.3, 0.25, 0.3]), Q3: single([6, 18, 10, 6, 2]), Q4: free(FREE.menu, 0.45), Q5: multi([0.3, 0.2, 0.25, 0.6, 0.05]), Q6: free(FREE.want, 0.4) },
    },
    {
      s: s1025, seed: 25, until: '2026/10/04 18:00',
      who: deliveryUsers.filter((_, i) => i % 3 !== 0).map((u) => ({ type: 'user' as const, id: u.id })),
      ans: { Q1: single([3, 5, 2, 1, 0]), Q2: single([5, 4, 1, 0, 0]), Q3: multi([0.3, 0.2, 0.1, 0.1, 0.4], 0.2), Q4: free(FREE.deliv, 0.7) },
    },
    { s: s1026, ans: {}, who: [], until: '', seed: 26 },
  ];
}

/** テンプレート（最初からある3つ。「テンプレートから作成」・2026/10/03 決定） */
const T = (id: string, name: string, intro: string, questions: SurveyTemplate['questions']): SurveyTemplate => ({ id, name, intro, questions, builtin: true, createdAt: '2026/10/03 10:00', createdBy: 'システム', fromSurveyId: '' });
const TEMPLATES: SurveyTemplate[] = [
  T('ST-001', '満足度調査', 'サービス全体の満足度についてのアンケートです。所要時間は約2分です。', [
    { text: 'サービス全体に満足していますか。', type: '単一選択', required: true, options: SAT },
    { text: '価格に見合った内容だと感じますか。', type: '単一選択', required: true, options: SAT },
    { text: 'ほかの方にすすめたいと思いますか。', type: '単一選択', required: true, options: ['ぜひすすめたい', 'すすめたい', 'どちらともいえない', 'あまりすすめたくない', 'すすめたくない'] },
    { text: 'ご意見・ご要望があればご記入ください。', type: '自由記述', required: false, options: [] },
  ]),
  T('ST-002', 'メニュー評価', '今月の月間メニューについてのアンケートです。メニューの改善に使います（約2分）。', [
    { text: '今月のメニューに満足していますか。', type: '単一選択', required: true, options: SAT },
    { text: 'よく選んだメニューのジャンルをお選びください。', type: '複数選択', required: true, options: GENRE },
    { text: '1食の量はいかがでしたか。', type: '単一選択', required: true, options: ['多い', 'ちょうどよい', '少ない'] },
    { text: '今後追加してほしいメニューをご記入ください。', type: '自由記述', required: false, options: [] },
  ]),
  T('ST-003', 'アプリ使い勝手', 'アプリの使いやすさについてのアンケートです（約1分）。', [
    { text: 'アプリは使いやすいですか。', type: '単一選択', required: true, options: ['とても使いやすい', '使いやすい', 'ふつう', '使いにくい'] },
    { text: 'よく使う機能をお選びください。', type: '複数選択', required: false, options: ['商品を探す', 'お気に入り', '購入履歴', 'レビュー'] },
    { text: '改善してほしい点をご記入ください。', type: '自由記述', required: false, options: [] },
  ]),
];

export function surveySeed(): { surveys: Survey[]; responses: SurveyResponse[]; templates: SurveyTemplate[] } {
  const surveys: Survey[] = [];
  const responses: SurveyResponse[] = [];
  for (const d of defs()) {
    surveys.push(d.s);
    const rnd = rng(d.seed);
    const from = toMin(d.s.startAt), to = d.until ? toMin(d.until) : from;
    d.who.forEach((w, i) => {
      const answers = d.s.questions.map((q) => d.ans[q.id]?.(q, rnd) ?? null).filter((x): x is SurveyAnswer => !!x);
      const at = ofMin(from + 5 + Math.floor(rnd() * Math.max(1, to - from - 5)));
      responses.push({ id: `SR-${d.s.id.slice(3)}-${pad(i + 1, 4)}`, surveyId: d.s.id, respondent: w, answeredAt: at, answers });
    });
  }
  return { surveys, responses, templates: TEMPLATES };
}
