/*
 * アンケート（area: survey）の型と、画面からも使う純粋な関数（状態・入力の確認・CSV の読み取り）。
 * kind：dm.survey.surveys／dm.survey.responses／dm.survey.templates（テンプレート）
 *   回答者＝アプリの利用者（U＋8桁）だけ（2026/10/03 決定：法人・拠点のアカウントには出さない。法人・拠点は利用者を絞る条件）
 *   状態は日時から決める（予定中→公開中→終了）。配信停止・削除済は記録（stoppedAt・deletedAt）から
 */

export type SurveyQType = '単一選択' | '複数選択' | '自由記述';
export const SURVEY_QTYPES: SurveyQType[] = ['単一選択', '複数選択', '自由記述'];
export type SurveyStatus = '予定中' | '公開中' | '終了' | '配信停止' | '削除済';
export const SURVEY_STATUSES: SurveyStatus[] = ['公開中', '予定中', '終了', '配信停止', '削除済'];
/** 配信対象の区分：アプリの利用者だけ（2026/10/03 決定） */
export type SurveyTargetType = 'user';
export const TARGET_LABEL: Record<SurveyTargetType, string> = { user: 'アプリユーザー' };

/** 設問。options は選択肢（自由記述は空）。order は 1 から */
export type SurveyQuestion = { id: string; text: string; type: SurveyQType; required: boolean; options: string[]; order: number };
/**
 * 配信対象。all＝全員（有効な拠点＝本登録・閉鎖予定で契約が有効・解約手続き中の、利用中のアプリの利用者みんな）／pick＝個別選択（利用者。ダイアログで法人・拠点で絞って選ぶ）
 */
export type SurveyTarget = { mode: 'all' | 'pick'; picks: { type: SurveyTargetType; id: string }[] };
export type SurveyHistory = { at: string; what: string; by: string };

/**
 * アンケート（dm.survey.surveys）。ID＝SV-＋4桁。日時は YYYY/MM/DD HH:mm。
 * remind：終了の days 日前に未回答者へ通知（sentAt＝送った日時。survey.tick が送る）
 * openedAt：回答開始のお知らせ（通知）を出した日時（survey.tick）
 */
export type Survey = {
  id: string; name: string; intro: string;
  startAt: string; endAt: string;
  remind: { on: boolean; days: number; sentAt: string };
  target: SurveyTarget;
  questions: SurveyQuestion[];
  openedAt: string;
  stoppedAt: string; deletedAt: string;
  createdAt: string; createdBy: string;
  history: SurveyHistory[];
};

/** 1つの設問の答え。choice＝選んだ選択肢の番号（0 から）、text＝自由記述 */
export type SurveyAnswer = { qid: string; choice?: number[]; text?: string };
/** 回答（dm.survey.responses）。ID＝SR-＋アンケートの番号＋-＋4桁。1人1回 */
export type SurveyResponse = { id: string; surveyId: string; respondent: { type: SurveyTargetType; id: string }; answeredAt: string; answers: SurveyAnswer[] };

/** 登録・編集の画面の入力 */
export type SurveyForm = {
  name: string; intro: string; startAt: string; endAt: string;
  remind: { on: boolean; days: number };
  target: SurveyTarget;
  questions: { id?: string; text: string; type: SurveyQType | ''; required: boolean; options: string[] }[];
};

/**
 * テンプレート（dm.survey.templates）。ID＝ST-＋3桁。「テンプレートから作成」で案内文・設問を写す。builtin＝最初からある（消せない）
 */
export type SurveyTemplate = {
  id: string; name: string; intro: string;
  questions: { text: string; type: SurveyQType; required: boolean; options: string[] }[];
  builtin: boolean; createdAt: string; createdBy: string; fromSurveyId: string;
};

export const SV_KINDS = { surveys: 'dm.survey.surveys', responses: 'dm.survey.responses', templates: 'dm.survey.templates' } as const;
export const INTRO_MAX = 500;
const DT = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/;
export const isSurveyDt = (s: string) => DT.test(s);

/** 状態（now＝YYYY/MM/DD HH:mm） */
export function surveyStatus(s: Pick<Survey, 'startAt' | 'endAt' | 'stoppedAt' | 'deletedAt'>, now: string): SurveyStatus {
  if (s.deletedAt) return '削除済';
  if (s.stoppedAt) return '配信停止';
  if (now < s.startAt) return '予定中';
  if (now <= s.endAt) return '公開中';
  return '終了';
}

/** 回答を受け付けているか */
export const isOpen = (s: Survey, now: string) => surveyStatus(s, now) === '公開中';

export const blankSurveyForm = (): SurveyForm => ({
  name: '', intro: '', startAt: '', endAt: '', remind: { on: false, days: 3 },
  target: { mode: 'all', picks: [] },
  questions: [{ text: '', type: '', required: false, options: ['', ''] }],
});

export const formOf = (s: Survey): SurveyForm => ({
  name: s.name, intro: s.intro, startAt: s.startAt, endAt: s.endAt, remind: { on: s.remind.on, days: s.remind.days },
  target: { mode: s.target.mode, picks: s.target.picks.map((p) => ({ type: 'user', id: p.id })) },
  questions: s.questions.map((q) => ({ id: q.id, text: q.text, type: q.type, required: q.required, options: [...q.options] })),
});

/** 入力の確認。キー＝欄（name・startAt・endAt・remind・target・intro・q<番号>・q<番号>.opts） → 文言 */
export function validateSurvey(f: SurveyForm): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = 'アンケート名を入力してください';
  else if (f.name.length > 100) e.name = 'アンケート名は100文字までです';
  if (f.intro.length > INTRO_MAX) e.intro = `案内文は${INTRO_MAX}文字までです`;
  if (!isSurveyDt(f.startAt)) e.startAt = '回答開始日時を yyyy-mm-dd HH:mm で入力してください';
  if (!isSurveyDt(f.endAt)) e.endAt = '回答終了日時を yyyy-mm-dd HH:mm で入力してください';
  else if (isSurveyDt(f.startAt) && f.endAt <= f.startAt) e.endAt = '回答終了日時は回答開始日時より後にしてください';
  if (f.remind.on && !(Number.isInteger(f.remind.days) && f.remind.days >= 1 && f.remind.days <= 30)) e.remind = 'リマインド通知は 1〜30 日前で入力してください';
  if (f.target.mode === 'pick' && !f.target.picks.length) e.target = '個別選択の対象を選んでください';
  if (!f.questions.length) e.questions = '設問を1つ以上入れてください';
  f.questions.forEach((q, i) => {
    if (!q.text.trim()) e[`q${i}`] = '設問文を入力してください';
    else if (!q.type) e[`q${i}`] = 'カテゴリ（設問タイプ）を選んでください';
    if (q.type && q.type !== '自由記述') {
      const opts = q.options.map((o) => o.trim());
      if (opts.filter(Boolean).length < 2) e[`q${i}.opts`] = '選択肢を2つ以上入力してください';
      else if (opts.some((o) => !o)) e[`q${i}.opts`] = '空の選択肢があります（不要なら削除してください）';
      else if (new Set(opts).size !== opts.length) e[`q${i}.opts`] = '同じ選択肢が2つあります';
    }
  });
  return e;
}

/* ---------- CSV取込（設問の一覧） ---------- */

/** CSV の見出し（1行目）。選択肢は「／」区切り */
export const SURVEY_CSV_HEAD = ['No', '設問文', '設問タイプ', '必須', '選択肢'];
export const SURVEY_CSV_SAMPLE = [
  SURVEY_CSV_HEAD.join(','),
  '1,ESステーションの利用頻度をお選びください。,単一選択,必須,週5回以上／週3〜4回／週1〜2回／月に数回',
  '2,よく選ぶメニューのジャンルをお選びください。,複数選択,必須,和食／洋食／中華／エスニック／デザート',
  '3,価格に見合った内容だと感じますか。,単一選択,必須,とても満足／満足／どちらともいえない／やや不満／不満',
  '4,今後追加してほしいメニューをご記入ください。,自由記述,任意,',
  '5,当社のサービスを何を通じて知りましたか？,複数選択,必須,Webサイト／SNS／友人・知人からの紹介／その他',
].join('\r\n');

/** テンプレートの設問 → 入力の設問 */
export const formFromTemplate = (t: Pick<SurveyTemplate, 'name' | 'intro' | 'questions'>): SurveyForm => ({
  ...blankSurveyForm(), name: t.name, intro: t.intro,
  questions: t.questions.map((q) => ({ text: q.text, type: q.type, required: q.required, options: [...q.options] })),
});

/**
 * 回答が始まったあとの設問の直し（2026/10/03 決定）：文言（設問文・選択肢の文字）の誤字の訂正だけ。
 * 設問の追加・削除・並び・設問タイプ・必須・選択肢の数は変えられない。だめならその理由
 */
export function lockedQuestionChange(before: Pick<SurveyQuestion, 'id' | 'type' | 'required' | 'options'>[], after: { id?: string; type: SurveyQType | ''; required: boolean; options: string[] }[]): string {
  if (before.length !== after.length) return '回答が始まったあとは設問を足す・消すことはできません（文言の修正だけできます）';
  for (let i = 0; i < before.length; i++) {
    const a = before[i], b = after[i];
    if (b.id && b.id !== a.id) return '回答が始まったあとは設問の並びを変えられません（文言の修正だけできます）';
    if (b.type !== a.type) return `回答が始まったあとは設問 ${i + 1} の設問タイプを変えられません`;
    if (b.required !== a.required) return `回答が始まったあとは設問 ${i + 1} の必須回答を変えられません`;
    if ((b.type === '自由記述' ? 0 : b.options.length) !== a.options.length) return `回答が始まったあとは設問 ${i + 1} の選択肢を足す・消すことはできません（文言の修正だけできます）`;
  }
  return '';
}

/** CSV の1行を列に分ける（"…" の中のカンマ・"" に対応） */
export function csvCells(line: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

export type SurveyCsvRow = { line: number; text: string; type: SurveyQType; required: boolean; options: string[] };
export type SurveyCsvResult = { total: number; rows: SurveyCsvRow[]; errors: { line: number; msgs: string[] }[]; fatal: string };

/** CSV を読んで、取り込める設問とエラーの行を返す（何も保存しない） */
export function parseSurveyCsv(csv: string): SurveyCsvResult {
  const lines = csv.replace(/^﻿/, '').split(/\r?\n/);
  const res: SurveyCsvResult = { total: 0, rows: [], errors: [], fatal: '' };
  const head = csvCells(lines[0] ?? '');
  if (head.slice(0, 5).join(',') !== SURVEY_CSV_HEAD.join(',')) {
    res.fatal = `1行目（見出し）が違います。「${SURVEY_CSV_HEAD.join(',')}」にしてください`;
    return res;
  }
  lines.slice(1).forEach((raw, i) => {
    const line = i + 2;
    if (!raw.trim()) return;
    res.total++;
    const [, text = '', type = '', req = '', opts = ''] = csvCells(raw);
    const msgs: string[] = [];
    if (!text) msgs.push('設問文は必須項目です。');
    else if (text.length > 200) msgs.push('設問文は200文字までです。');
    if (!SURVEY_QTYPES.includes(type as SurveyQType)) msgs.push('設問タイプは 単一選択・複数選択・自由記述 のどれかにしてください。');
    if (req && !['必須', '任意'].includes(req)) msgs.push('必須は「必須」か「任意」にしてください。');
    const options = opts ? opts.split(/[／/]/).map((o) => o.trim()).filter(Boolean) : [];
    if (type !== '自由記述' && SURVEY_QTYPES.includes(type as SurveyQType)) {
      if (options.length < 2) msgs.push('選択肢を「／」区切りで2つ以上入れてください。');
      else if (new Set(options).size !== options.length) msgs.push('同じ選択肢が2つあります。');
    }
    if (type === '自由記述' && options.length) msgs.push('自由記述には選択肢を入れないでください。');
    if (msgs.length) res.errors.push({ line, msgs });
    else res.rows.push({ line, text, type: type as SurveyQType, required: req === '必須', options });
  });
  if (!res.total) res.fatal = '設問の行がありません';
  return res;
}
