import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp } from '@/lib/supplier/dates';
import { customerOff, customerSendDay, notify } from '../notify';
import { surveySeed } from '../seed/survey';
import {
  isOpen, lockedQuestionChange, surveyStatus, SV_KINDS as K, validateSurvey,
  type Survey, type SurveyAnswer, type SurveyForm, type SurveyQType, type SurveyQuestion, type SurveyResponse, type SurveyTarget, type SurveyTargetType, type SurveyTemplate,
} from '../survey';
import type { AppUser, Branch, Contract, Corp } from '../types';

/*
 * アンケート（area: survey）。kind：dm.survey.surveys／dm.survey.responses（型・状態・入力の確認・CSV は lib/domain/survey.ts）
 *   運営Web のアンケート管理（一覧・登録・編集・集計・CSV取込・テンプレート）が読む。回答者はアプリの利用者だけ（2026/10/03 決定。法人Web の回答の画面はない）。
 *   アプリの利用者の回答は見本だけ（アプリは answer を呼ぶ）。
 *   list        一覧の行（設問数・対象者数・回答数・状態）
 *   get         1件（状態・対象者の一覧・回答数）
 *   candidates  個別選択のダイアログの候補（アプリの利用者・法人・拠点・キーワードで絞る）
 *   audience    配信対象から対象者数を数える（登録画面の「対象者数」）
 *   results     回答の集計（設問ごとの件数・割合、自由記述の一覧。設問文・法人・拠点・設問タイプで絞る）
 *   answersTable 回答の CSV出力の元（1行＝回答者1人、1列＝設問1つ＋法人・拠点・回答日時。法人・拠点で絞る）
 *   templates   テンプレートの一覧（saveTemplate・removeTemplate）
 *   save        登録・更新（始まったあとは回答開始日時・設問の形を変えられない＝文言の修正だけ。回答した人は対象から外せない）
 *               設問の CSV取込は共通の CSV取込（lib/csv の surveyQuestions・取込の記録）で読み、importId を渡して登録
 *   remove      削除（削除済として残す）／stop 配信停止
 *   answer      回答（1人1回・公開中だけ・必須の設問）
 *   tick        毎日（毎時）の処理：回答開始のお知らせ・終了の N 日前のリマインド（未回答者だけ）
 */

/** 回答者（アプリの利用者）の表示用の情報 */
export type SurveyWho = { type: SurveyTargetType; id: string; name: string; corpId: string; corpName: string; branchId: string; branchName: string };

const surveys = (r: DocRepo) => r.list<Survey>(K.surveys);
const responsesOf = (r: DocRepo, surveyId: string) => r.list<SurveyResponse>(K.responses).filter((x) => x.surveyId === surveyId);
const key = (t: { type: string; id: string }) => `${t.type}:${t.id}`;

function mustSurvey(r: DocRepo, id: string) {
  const s = r.get<Survey>(K.surveys, id);
  if (!s) throw new ApiError('アンケートが見つかりません', 404);
  return s;
}

/** 回答者の情報（アプリの利用者でなければ null） */
export function whoOf(r: DocRepo, t: { type: string; id: string }): SurveyWho | null {
  if (t.type !== 'user') return null;
  const u = r.get<AppUser>('dm.app.users', t.id);
  if (!u) return null;
  const b = r.get<Branch>('dm.org.branches', u.branchId);
  const corpName = b?.corpId ? r.get<Corp>('dm.org.corps', b.corpId)?.name ?? '' : '';
  return { type: 'user', id: u.id, name: u.name, corpId: b?.corpId ?? '', corpName, branchId: u.branchId, branchName: b?.name ?? '' };
}

/** 有効な拠点：本登録・閉鎖予定で、親契約が有効・解約手続き中（仮登録・閉鎖・利用休止・終了の拠点の利用者には出さない） */
export function activeBranchIds(r: DocRepo): Set<string> {
  const live = new Set(r.list<Contract>('dm.org.contracts').filter((c) => c.status === '有効' || c.status === '解約手続き中').map((c) => c.branchId));
  return new Set(r.list<Branch>('dm.org.branches').filter((b) => (b.status === '本登録' || b.status === '閉鎖予定') && live.has(b.id)).map((b) => b.id));
}

/** 配信できる人：有効な拠点の、利用中（有効）のアプリの利用者 */
function eligible(r: DocRepo): SurveyWho[] {
  const ok = activeBranchIds(r);
  return r.list<AppUser>('dm.app.users').filter((u) => u.status === '有効' && ok.has(u.branchId)).map((u) => whoOf(r, { type: 'user', id: u.id })).filter((x): x is SurveyWho => !!x);
}

/** 配信対象の人（全員＝配信できる人みんな、個別選択＝選んだ人） */
export function targetsOf(r: DocRepo, t: SurveyTarget): SurveyWho[] {
  if (t.mode === 'all') return eligible(r);
  return t.picks.map((p) => whoOf(r, p)).filter((x): x is SurveyWho => !!x);
}

function counts(r: DocRepo, s: Survey) {
  const targets = targetsOf(r, s.target);
  const tk = new Set(targets.map(key));
  const answered = responsesOf(r, s.id).filter((x) => tk.has(key(x.respondent))).length;
  return { targets, targetCount: targets.length, answered, rate: targets.length ? Math.round((answered / targets.length) * 100) : 0 };
}

const view = (r: DocRepo, s: Survey, now = nowStamp()) => ({ ...s, status: surveyStatus(s, now) });

/** 一覧の行 */
function row(r: DocRepo, s: Survey, now: string) {
  const c = counts(r, s);
  return {
    id: s.id, name: s.name, qCount: `${s.questions.length}問`, startAt: s.startAt, endAt: s.endAt,
    targetCount: c.targetCount, answered: c.answered, progress: `${c.answered}/${c.targetCount} 回答（${c.rate}%）`,
    status: surveyStatus(s, now), startYm: s.startAt.slice(0, 7).replace('/', '-'), endYm: s.endAt.slice(0, 7).replace('/', '-'),
  };
}

const nextId = (r: DocRepo) => `SV-${String(Math.max(1000, ...surveys(r).map((s) => Number(s.id.slice(3)) || 0)) + 1).padStart(4, '0')}`;

/** 入力 → 設問（id は今のものを残し、新しい設問は使っていない Q 番号） */
function questionsOf(f: SurveyForm, cur?: Survey): SurveyQuestion[] {
  const used = new Set([...(cur?.questions ?? []).map((q) => q.id), ...f.questions.map((q) => q.id).filter(Boolean) as string[]]);
  let n = 0;
  const fresh = () => { do n++; while (used.has(`Q${n}`)); used.add(`Q${n}`); return `Q${n}`; };
  return f.questions.map((q, i) => ({
    id: q.id && cur?.questions.some((x) => x.id === q.id) ? q.id : fresh(),
    text: q.text.trim(), type: q.type as SurveyQType, required: q.required,
    options: q.type === '自由記述' ? [] : q.options.map((o) => o.trim()), order: i + 1,
  }));
}

/** 設問が同じか（文・タイプ・必須・選択肢・順） */
const sameQs = (a: SurveyQuestion[], b: SurveyQuestion[]) =>
  JSON.stringify(a.map(({ id, text, type, required, options }) => [id, text, type, required, options])) === JSON.stringify(b.map(({ id, text, type, required, options }) => [id, text, type, required, options]));

function checkForm(f: SurveyForm) {
  const e = validateSurvey(f);
  const first = Object.values(e)[0];
  if (first) throw new ApiError(first, 400);
}

/** 個別選択の対象が実在するか・重なっていないか */
function checkPicks(r: DocRepo, t: SurveyTarget) {
  const seen = new Set<string>();
  for (const p of t.picks) {
    if (p.type !== 'user') throw new ApiError('配信対象はアプリの利用者だけです（法人・拠点は利用者を絞る条件として使ってください）', 400);
    if (!whoOf(r, p)) throw new ApiError(`アプリユーザー ${p.id} が見つかりません`, 400);
    if (seen.has(key(p))) throw new ApiError(`アプリユーザー ${p.id} が2回選ばれています`, 400);
    seen.add(key(p));
  }
}

/** 登録・更新の本体（by＝操作した人、how＝履歴の文言） */
function saveCore(r: DocRepo, a: { id?: string; form: SurveyForm; by?: string; how?: string; template?: string }) {
  const f = a.form;
  checkForm(f);
  checkPicks(r, f.target);
  const by = a.by || 'にっしぐち';
  const now = nowStamp();
  const target: SurveyTarget = f.target.mode === 'all' ? { mode: 'all', picks: [] } : { mode: 'pick', picks: f.target.picks.map((p) => ({ type: 'user', id: p.id })) };
  if (!a.id) {
    const id = nextId(r);
    const s: Survey = {
      id, name: f.name.trim(), intro: f.intro, startAt: f.startAt, endAt: f.endAt,
      remind: { on: f.remind.on, days: f.remind.days, sentAt: '' }, target, questions: questionsOf(f),
      openedAt: '', stoppedAt: '', deletedAt: '', createdAt: now, createdBy: by,
      history: [{ at: now, what: a.how ?? (a.template ? `テンプレート「${a.template}」から登録` : '登録'), by }],
    };
    r.put(K.surveys, id, s);
    return view(r, s);
  }
  const cur = mustSurvey(r, a.id);
  const st = surveyStatus(cur, now);
  if (st === '終了' || st === '削除済') throw new ApiError(`${st}のアンケートは編集できません`, 409);
  const started = cur.startAt <= now || !!cur.openedAt;
  const qs = questionsOf(f, cur);
  const what: string[] = [];
  if (started && f.startAt !== cur.startAt) throw new ApiError('回答が始まったあとは回答開始日時を変えられません', 409);
  /* 回答が始まったあとは文言（設問文・選択肢の文字）の修正だけ（2026/10/03 決定） */
  const lockMsg = started ? lockedQuestionChange(cur.questions.slice().sort((x, y) => x.order - y.order), f.questions) : '';
  if (lockMsg) throw new ApiError(lockMsg, 409);
  if (st === '公開中' && f.endAt < now) throw new ApiError('回答終了日時は今より後にしてください（終わらせるときは「配信停止」）', 400);
  /* 回答した人は対象から外せない */
  const tk = new Set(targetsOf(r, target).map(key));
  const was = new Set(targetsOf(r, cur.target).map(key));
  const lost = responsesOf(r, cur.id).filter((x) => was.has(key(x.respondent)) && !tk.has(key(x.respondent)));
  if (lost.length) throw new ApiError(`回答済みの対象者（${lost.length}名）は配信対象から外せません`, 409);
  if (f.name.trim() !== cur.name) what.push('アンケート名');
  if (f.intro !== cur.intro) what.push('案内文');
  if (f.startAt !== cur.startAt) what.push(`回答開始日時（${cur.startAt} → ${f.startAt}）`);
  if (f.endAt !== cur.endAt) what.push(`回答終了日時（${cur.endAt} → ${f.endAt}）`);
  if (f.remind.on !== cur.remind.on || f.remind.days !== cur.remind.days) what.push(`リマインド通知（${f.remind.on ? `終了の${f.remind.days}日前` : 'なし'}）`);
  const before = counts(r, cur).targetCount;
  if (JSON.stringify(target) !== JSON.stringify(cur.target)) what.push(`配信対象（${before}名 → ${tk.size}名）`);
  if (!sameQs(qs, cur.questions)) {
    const fixed = qs.filter((q) => { const o = cur.questions.find((x) => x.id === q.id); return !!o && (o.text !== q.text || JSON.stringify(o.options) !== JSON.stringify(q.options)); }).map((q) => `Q${q.order}`);
    what.push(started ? `設問の文言（${fixed.join('・')}）` : `設問（${cur.questions.length}問 → ${qs.length}問）`);
  }
  /* リマインドの日を変えたら、まだ送っていなければ新しい日で送る */
  const remind = { on: f.remind.on, days: f.remind.days, sentAt: cur.remind.sentAt };
  const next: Survey = {
    ...cur, name: f.name.trim(), intro: f.intro, startAt: f.startAt, endAt: f.endAt, remind, target, questions: qs,
    history: what.length ? [...cur.history, { at: now, what: `${what.join('・')}を変更`, by }] : cur.history,
  };
  r.put(K.surveys, cur.id, next);
  return view(r, next);
}

/** 回答の中身を確かめる（設問にある・選択肢の番号・単一は1つ・必須） */
export function answerProblems(s: Survey, answers: SurveyAnswer[]): string[] {
  const p: string[] = [];
  const seen = new Set<string>();
  for (const a of answers) {
    const q = s.questions.find((x) => x.id === a.qid);
    if (!q) { p.push(`設問 ${a.qid} がありません`); continue; }
    if (seen.has(a.qid)) p.push(`設問 ${a.qid} の答えが2つあります`);
    seen.add(a.qid);
    if (q.type === '自由記述') {
      if (!a.text?.trim() || a.choice?.length) p.push(`Q${q.order} は文で答えてください`);
      else if (a.text.length > 1000) p.push(`Q${q.order} は1000文字までです`);
    } else {
      const c = a.choice ?? [];
      if (!c.length || c.some((i) => !Number.isInteger(i) || i < 0 || i >= q.options.length) || new Set(c).size !== c.length) p.push(`Q${q.order} の選択肢が違います`);
      if (q.type === '単一選択' && c.length > 1) p.push(`Q${q.order} は1つだけ選んでください`);
    }
  }
  for (const q of s.questions) if (q.required && !seen.has(q.id)) p.push(`Q${q.order}（必須）に答えてください`);
  return p;
}

/** アンケートのお知らせ（アプリの利用者へ・プッシュ） */
const noteTo = (r: DocRepo, w: SurveyWho, n: { templateId: string; title: string; body: string; surveyId: string }) =>
  notify(r, { to: { site: 'app', accountId: w.id, role: '' }, channels: ['site'], templateId: n.templateId, title: n.title, body: n.body, link: { type: 'survey', id: n.surveyId } });

const templates = (r: DocRepo) => r.list<SurveyTemplate>(K.templates);
const nextTplId = (r: DocRepo) => `ST-${String(Math.max(0, ...templates(r).map((t) => Number(t.id.slice(3)) || 0)) + 1).padStart(3, '0')}`;

/** 回答の CSV の1つの答えの文字（選択肢は「;」でつなぐ・自由記述はそのまま） */
const answerText = (q: SurveyQuestion, a?: SurveyAnswer) => (!a ? '' : q.type === '自由記述' ? a.text ?? '' : (a.choice ?? []).map((i) => q.options[i] ?? '').join(';'));

export default defineArea({
  name: 'survey',
  seed: () => { const x = surveySeed(); return { [K.surveys]: toDocs(x.surveys), [K.responses]: toDocs(x.responses), [K.templates]: toDocs(x.templates) }; },
  queries: {
    /** 運営：一覧（削除済も返す。画面で「削除済みを表示しない」） */
    list: (r) => { const now = nowStamp(); return surveys(r).map((s) => row(r, s, now)).sort((a, b) => b.id.localeCompare(a.id)); },
    /** 運営：1件（対象者の一覧つき） */
    get(r, { id }: { id: string }) {
      const s = r.get<Survey>(K.surveys, id);
      if (!s) return null;
      const now = nowStamp();
      const c = counts(r, s);
      const done = new Set(responsesOf(r, id).map((x) => key(x.respondent)));
      return {
        ...view(r, s, now), targets: c.targets.map((w) => ({ ...w, answered: done.has(key(w)) })), targetCount: c.targetCount, answered: c.answered, rate: c.rate,
        /** 始まったか（設問・回答開始日時を変えられない） */
        started: s.startAt <= now || !!s.openedAt,
      };
    },
    /** 個別選択のダイアログの候補（アプリの利用者。q＝ID・名前・法人名・拠点名の部分一致、corpId・branchId で絞る）と絞り込みの選択肢 */
    candidates(r, a: { q?: string; corpId?: string; branchId?: string }) {
      const q = (a?.q ?? '').trim().toLowerCase();
      const all = eligible(r);
      const corps = new Map<string, string>(), branches = new Map<string, { name: string; corpId: string }>();
      for (const w of all) { if (w.corpId) corps.set(w.corpId, w.corpName); branches.set(w.branchId, { name: w.branchName, corpId: w.corpId }); }
      return {
        rows: all.filter((w) => (!a?.corpId || w.corpId === a.corpId) && (!a?.branchId || w.branchId === a.branchId) && (!q || [w.id, w.name, w.corpName, w.branchName].some((v) => v.toLowerCase().includes(q)))),
        corps: [...corps].map(([id, name]) => ({ id, name })).sort((x, y) => x.id.localeCompare(y.id)),
        branches: [...branches].map(([id, b]) => ({ id, ...b })).sort((x, y) => x.id.localeCompare(y.id)),
      };
    },
    /** 配信対象の人数と一覧（登録画面の「対象者数」・選んだ人の表） */
    audience: (r, { target }: { target: SurveyTarget }) => { const t = targetsOf(r, target); return { count: t.length, list: t }; },
    /** 回答の集計 */
    results(r, a: { id: string; q?: string; corpId?: string; branchId?: string; qtype?: SurveyQType | '' }) {
      const s = mustSurvey(r, a.id);
      const rows = responsesOf(r, s.id).map((x) => ({ x, w: whoOf(r, x.respondent) })).filter((y) => y.w && (!a.corpId || y.w.corpId === a.corpId) && (!a.branchId || y.w.branchId === a.branchId));
      const qs = s.questions.filter((q) => (!a.q || q.text.includes(a.q.trim())) && (!a.qtype || q.type === a.qtype)).sort((x, y) => x.order - y.order);
      const targets = targetsOf(r, s.target);
      const corps = new Map<string, string>(), branches = new Map<string, { name: string; corpId: string }>();
      for (const w of [...targets, ...rows.map((y) => y.w!)]) {
        if (w.corpId) corps.set(w.corpId, w.corpName);
        if (w.branchId) branches.set(w.branchId, { name: w.branchName, corpId: w.corpId });
      }
      return {
        respondents: rows.length,
        corps: [...corps].map(([id, name]) => ({ id, name })).sort((x, y) => x.id.localeCompare(y.id)),
        branches: [...branches].map(([id, b]) => ({ id, ...b })).sort((x, y) => x.id.localeCompare(y.id)),
        questions: qs.map((q) => {
          const ans = rows.map((y) => ({ w: y.w!, at: y.x.answeredAt, a: y.x.answers.find((z) => z.qid === q.id) })).filter((z) => z.a);
          const n = ans.length;
          if (q.type === '自由記述') {
            return { ...q, n, options: [], texts: ans.sort((x, y) => y.at.localeCompare(x.at)).map((z) => ({ text: z.a!.text ?? '', name: z.w.name, type: z.w.type, corpName: z.w.corpName, branchName: z.w.branchName, at: z.at })) };
          }
          const cnt = q.options.map((_, i) => ans.filter((z) => z.a!.choice?.includes(i)).length);
          return { ...q, n, options: q.options.map((label, i) => ({ label, count: cnt[i], pct: n ? Math.round((cnt[i] / n) * 100) : 0 })), texts: [] };
        }),
      };
    },
    /**
     * 回答の CSV出力の元（2026/10/03 決定）：1行＝回答者1人、列＝回答者・法人・拠点・回答日時＋設問ごと（選択肢は「;」でつなぐ）。法人・拠点で絞る
     */
    answersTable(r, a: { id: string; corpId?: string; branchId?: string }) {
      const s = mustSurvey(r, a.id);
      const qs = s.questions.slice().sort((x, y) => x.order - y.order);
      const rows = responsesOf(r, s.id).map((x) => ({ x, w: whoOf(r, x.respondent) }))
        .filter((y) => !!y.w && (!a.corpId || y.w.corpId === a.corpId) && (!a.branchId || y.w.branchId === a.branchId))
        .sort((p, q) => p.x.answeredAt.localeCompare(q.x.answeredAt))
        .map(({ x, w }) => ({
          responseId: x.id, userId: w!.id, name: w!.name, corpId: w!.corpId, corpName: w!.corpName, branchId: w!.branchId, branchName: w!.branchName, answeredAt: x.answeredAt,
          answers: Object.fromEntries(qs.map((q) => [q.id, answerText(q, x.answers.find((y) => y.qid === q.id))])),
        }));
      return { name: s.name, questions: qs.map((q) => ({ id: q.id, order: q.order, text: q.text })), rows };
    },
    /** テンプレートの一覧（最初からあるものが先） */
    templates: (r) => templates(r).slice().sort((x, y) => Number(y.builtin) - Number(x.builtin) || x.id.localeCompare(y.id)),
  },
  actions: {
    /** 登録・更新。importId＝設問を CSV取込（共通の取込の記録）で読んだ、template＝テンプレートの名前（変更履歴に書く） */
    save: (r, a: { id?: string; form: SurveyForm; by?: string; importId?: string; template?: string }) =>
      saveCore(r, { ...a, how: !a.id && a.importId ? `CSV取込で登録（${a.importId}・設問 ${a.form.questions.length}問）` : undefined }),
    /** テンプレートとして保存（いまの案内文・設問を写す。surveyId＝元のアンケート） */
    saveTemplate(r, a: { name: string; form: Pick<SurveyForm, 'intro' | 'questions'>; surveyId?: string; by?: string }) {
      const name = (a.name ?? '').trim();
      if (!name) throw new ApiError('テンプレート名を入力してください', 400);
      if (name.length > 100) throw new ApiError('テンプレート名は100文字までです', 400);
      if (templates(r).some((t) => t.name === name)) throw new ApiError(`同じ名前のテンプレート「${name}」があります`, 409);
      const e = validateSurvey({ name, intro: a.form.intro, startAt: '2000/01/01 00:00', endAt: '2000/01/02 00:00', remind: { on: false, days: 3 }, target: { mode: 'all', picks: [] }, questions: a.form.questions });
      const first = Object.values(e)[0];
      if (first) throw new ApiError(first, 400);
      const t: SurveyTemplate = {
        id: nextTplId(r), name, intro: a.form.intro,
        questions: a.form.questions.map((q) => ({ text: q.text.trim(), type: q.type as SurveyQType, required: q.required, options: q.type === '自由記述' ? [] : q.options.map((o) => o.trim()) })),
        builtin: false, createdAt: nowStamp(), createdBy: a.by || 'にっしぐち', fromSurveyId: a.surveyId ?? '',
      };
      r.put(K.templates, t.id, t);
      return t;
    },
    /** テンプレートを消す（最初からあるものは消せない） */
    removeTemplate(r, { id }: { id: string; by?: string }) {
      const t = r.get<SurveyTemplate>(K.templates, id);
      if (!t) throw new ApiError('テンプレートが見つかりません', 404);
      if (t.builtin) throw new ApiError('最初からあるテンプレートは消せません', 409);
      r.remove(K.templates, id);
      return { ok: true };
    },
    /** 削除（削除済として残す。回答も残す） */
    remove(r, { id, by }: { id: string; by?: string }) {
      const s = mustSurvey(r, id);
      if (s.deletedAt) throw new ApiError('すでに削除しています', 409);
      if (surveyStatus(s, nowStamp()) === '終了') throw new ApiError('終了したアンケートは削除できません', 409);
      const at = nowStamp();
      const next: Survey = { ...s, deletedAt: at, history: [...s.history, { at, what: '削除（削除済として残す）', by: by || 'にっしぐち' }] };
      r.put(K.surveys, id, next);
      return view(r, next);
    },
    /** 配信停止（予定中・公開中。回答の受付をやめる。回答は残す） */
    stop(r, { id, by, reason }: { id: string; by?: string; reason?: string }) {
      const s = mustSurvey(r, id);
      const st = surveyStatus(s, nowStamp());
      if (st !== '公開中' && st !== '予定中') throw new ApiError(`${st}のアンケートは配信停止できません`, 409);
      const at = nowStamp();
      const next: Survey = { ...s, stoppedAt: at, history: [...s.history, { at, what: `配信停止${reason?.trim() ? `（${reason.trim()}）` : ''}`, by: by || 'にっしぐち' }] };
      r.put(K.surveys, id, next);
      return view(r, next);
    },
    /** 回答（アプリの利用者。デモの回答は見本だけ） */
    answer(r, a: { surveyId: string; respondent: { type: SurveyTargetType; id: string }; answers: SurveyAnswer[] }) {
      const s = mustSurvey(r, a.surveyId);
      if (a.respondent?.type !== 'user') throw new ApiError('アンケートに答えられるのはアプリの利用者だけです', 403);
      const now = nowStamp();
      if (!isOpen(s, now)) throw new ApiError('このアンケートは回答を受け付けていません', 409);
      if (!targetsOf(r, s.target).some((w) => key(w) === key(a.respondent))) throw new ApiError('このアンケートの対象ではありません', 403);
      const all = r.list<SurveyResponse>(K.responses);
      if (all.some((x) => x.surveyId === s.id && key(x.respondent) === key(a.respondent))) throw new ApiError('このアンケートには回答済みです', 409);
      const answers = (a.answers ?? []).filter((x) => (x.choice?.length ?? 0) > 0 || !!x.text?.trim()).map((x) => (x.text !== undefined ? { qid: x.qid, text: x.text.trim() } : { qid: x.qid, choice: [...(x.choice ?? [])].sort((p, q) => p - q) }));
      const bad = answerProblems(s, answers);
      if (bad.length) throw new ApiError(bad[0], 400);
      const n = all.filter((x) => x.surveyId === s.id).length + 1;
      let id = `SR-${s.id.slice(3)}-${String(n).padStart(4, '0')}`;
      for (let k = n + 1; r.get(K.responses, id); k++) id = `SR-${s.id.slice(3)}-${String(k).padStart(4, '0')}`;
      const x: SurveyResponse = { id, surveyId: s.id, respondent: { type: 'user', id: a.respondent.id }, answeredAt: now, answers };
      r.put(K.responses, id, x);
      return x;
    },
    /**
     * 毎日（毎時）の処理（開発中は POST /api/domain/survey/tick、now＝YYYY/MM/DD HH:mm を渡せる）。
     *   ・回答開始日時を過ぎた公開中のアンケート：対象者に「アンケートのお願い」（1回だけ）
     *   ・リマインド通知あり：終了の N 日前を過ぎたら、まだ回答していない対象者に通知（1回だけ）
     */
    tick(r, a?: { now?: string }) {
      const now = a?.now ?? nowStamp();
      const out = { now, opened: [] as string[], reminded: [] as { id: string; n: number }[] };
      for (const s of surveys(r)) {
        if (surveyStatus(s, now) !== '公開中') continue;
        let cur = s;
        const targets = targetsOf(r, s.target);
        if (!cur.openedAt) {
          targets.forEach((w) => noteTo(r, w, { templateId: 'survey_open', title: `アンケートのお願い：${s.name}`, body: `${s.endAt} までにご回答ください。`, surveyId: s.id }));
          cur = { ...cur, openedAt: now, history: [...cur.history, { at: now, what: `回答開始のお知らせを送信（${targets.length}名）`, by: 'システム' }] };
          out.opened.push(s.id);
        }
        if (cur.remind.on && !cur.remind.sentAt && remindDue(r, cur, now)) {
          const done = new Set(responsesOf(r, s.id).map((x) => key(x.respondent)));
          const rest = targets.filter((w) => !done.has(key(w)));
          rest.forEach((w) => noteTo(r, w, { templateId: 'survey_remind', title: `【リマインド】アンケートのお願い：${s.name}`, body: `回答期限は ${s.endAt} です。まだの方はご回答ください。`, surveyId: s.id }));
          cur = { ...cur, remind: { ...cur.remind, sentAt: now }, history: [...cur.history, { at: now, what: `リマインド通知を送信（未回答者 ${rest.length}名）`, by: 'システム' }] };
          out.reminded.push({ id: s.id, n: rest.length });
        }
        if (cur !== s) r.put(K.surveys, s.id, cur);
      }
      return out;
    },
  },
});

/**
 * リマインドを送るか（2026/10/03 決定：お客様の休み（土日祝）にあたるなら前の営業日に前倒し）。
 * 休みの日には送らない（次の営業日が回答の終了より後のときだけ送る）
 */
function remindDue(r: DocRepo, s: Survey, now: string) {
  const at = remindAt(s), day = now.slice(0, 10), send = customerSendDay(r, at.slice(0, 10));
  if (!(send < at.slice(0, 10) ? day >= send : now >= at)) return false;
  if (!customerOff(r, day)) return true;
  let next = addDays(day, 1);
  for (let i = 0; i < 14 && customerOff(r, next); i++) next = addDays(next, 1);
  return next > s.endAt.slice(0, 10);
}

/** リマインドを送る日時（終了の days 日前の同じ時刻） */
export function remindAt(s: Pick<Survey, 'endAt' | 'remind'>) {
  const d = new Date(Date.UTC(+s.endAt.slice(0, 4), +s.endAt.slice(5, 7) - 1, +s.endAt.slice(8, 10) - s.remind.days));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}/${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())} ${s.endAt.slice(11)}`;
}
