import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import { activeBranchIds, answerProblems, targetsOf, whoOf } from './areas/survey';
import { isSurveyDt, surveyStatus, SV_KINDS, validateSurvey, type Survey, type SurveyResponse, type SurveyTemplate } from './survey';
import type { AppUser } from './types';

/*
 * check.run の続き：アンケート（dm.survey）。
 *   対象者が実在する・回答はそのアンケートの対象者と設問に合う・必須に答えている・1人1回・
 *   状態と日時が合う（回答は回答期間の中・配信停止の前、予定中に回答はない、リマインドは終了の N 日前〜終了）
 *   2026/10/03 決定：対象・回答者はアプリの利用者だけ（法人・拠点のアカウントはない）、全員＝有効な拠点の利用中の利用者、テンプレートの設問が正しい
 */

export const SURVEY_COUNT_KINDS = [SV_KINDS.surveys, SV_KINDS.responses, SV_KINDS.templates];

export function surveyProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const now = nowStamp();
  const surveys = r.list<Survey>(SV_KINDS.surveys);
  const responses = r.list<SurveyResponse>(SV_KINDS.responses);

  for (const s of surveys) {
    need(/^SV-\d{4}$/.test(s.id), `アンケート ${s.id} の ID の形が違う（SV-＋4桁）`);
    need(!!s.name.trim(), `アンケート ${s.id} の名前がない`);
    need(isSurveyDt(s.startAt) && isSurveyDt(s.endAt) && s.startAt < s.endAt, `アンケート ${s.id} の回答期間 ${s.startAt}〜${s.endAt} が違う`);
    /* 設問 */
    need(s.questions.length > 0, `アンケート ${s.id} に設問がない`);
    need(new Set(s.questions.map((q) => q.id)).size === s.questions.length, `アンケート ${s.id} の設問の ID が重なっている`);
    need(s.questions.map((q) => q.order).sort((a, b) => a - b).every((o, i) => o === i + 1), `アンケート ${s.id} の設問の順が 1 から続いていない`);
    for (const q of s.questions) {
      if (q.type === '自由記述') need(!q.options.length, `アンケート ${s.id} の ${q.id}（自由記述）に選択肢がある`);
      else need(q.options.length >= 2 && new Set(q.options).size === q.options.length && q.options.every((o) => !!o.trim()), `アンケート ${s.id} の ${q.id} の選択肢が2つ未満・空・重なりがある`);
    }
    /* 配信対象 */
    if (s.target.mode === 'pick') {
      need(s.target.picks.length > 0, `アンケート ${s.id} の個別選択の対象がない`);
      need(new Set(s.target.picks.map((x) => `${x.type}:${x.id}`)).size === s.target.picks.length, `アンケート ${s.id} の個別選択の対象が重なっている`);
      for (const x of s.target.picks) need(x.type === 'user' && !!whoOf(r, x), `アンケート ${s.id} の対象 ${x.type} ${x.id} がアプリの利用者でない・いない`);
    }
    need(!('types' in (s.target as object)) || !((s.target as { types?: string[] }).types ?? []).some((t) => t !== 'user'), `アンケート ${s.id} の配信対象に法人・拠点の区分が残っている`);
    /* 状態と日時 */
    if (s.stoppedAt) need(isSurveyDt(s.stoppedAt) && s.stoppedAt <= s.endAt, `アンケート ${s.id} の配信停止 ${s.stoppedAt} が終了より後`);
    if (s.openedAt) need(s.openedAt >= s.startAt && s.openedAt <= s.endAt, `アンケート ${s.id} の回答開始のお知らせ ${s.openedAt} が回答期間の外`);
    need(Number.isInteger(s.remind.days) && s.remind.days >= 1 && s.remind.days <= 30, `アンケート ${s.id} のリマインドの日数 ${s.remind.days} が違う`);
    if (s.remind.sentAt) {
      need(s.remind.on && s.remind.sentAt <= s.endAt && s.remind.sentAt >= s.startAt, `アンケート ${s.id} のリマインドの送信 ${s.remind.sentAt} が回答期間の外・リマインドなし`);
    }
    const st = surveyStatus(s, now);
    const mine = responses.filter((x) => x.surveyId === s.id);
    if (st === '予定中') need(!mine.length, `アンケート ${s.id} は予定中なのに回答がある`);
    need(s.history.length > 0, `アンケート ${s.id} の変更履歴がない`);
  }

  /* 回答 */
  const seen = new Set<string>();
  for (const x of responses) {
    const s = surveys.find((y) => y.id === x.surveyId);
    if (!s) { p.push(`回答 ${x.id} のアンケート ${x.surveyId} がない`); continue; }
    const k = `${x.surveyId}|${x.respondent.type}:${x.respondent.id}`;
    need(!seen.has(k), `アンケート ${x.surveyId} に ${x.respondent.id} の回答が2つある`);
    seen.add(k);
    need(!!whoOf(r, x.respondent), `回答 ${x.id} の回答者 ${x.respondent.type} ${x.respondent.id} がない`);
    /* 対象者か（全員：その区分の人。個別選択：選んだ人。利用停止になった人の回答も残る） */
    need(x.respondent.type === 'user', `回答 ${x.id} の回答者 ${x.respondent.type} ${x.respondent.id} がアプリの利用者でない`);
    const inTarget = s.target.mode === 'all' ? x.respondent.type === 'user' : s.target.picks.some((y) => y.type === x.respondent.type && y.id === x.respondent.id);
    need(inTarget, `回答 ${x.id} の回答者 ${x.respondent.id} がアンケート ${s.id} の対象でない`);
    need(isSurveyDt(x.answeredAt) && x.answeredAt >= s.startAt && x.answeredAt <= s.endAt, `回答 ${x.id} の日時 ${x.answeredAt} が回答期間の外`);
    if (s.stoppedAt) need(x.answeredAt <= s.stoppedAt, `回答 ${x.id} が配信停止 ${s.stoppedAt} より後`);
    if (s.deletedAt) need(x.answeredAt <= s.deletedAt, `回答 ${x.id} が削除 ${s.deletedAt} より後`);
    for (const m of answerProblems(s, x.answers)) p.push(`回答 ${x.id}：${m}`);
  }
  /* 個別選択のアンケート：回答者はいまも対象の一覧にいる */
  for (const s of surveys.filter((y) => y.target.mode === 'pick')) {
    const keys = new Set(targetsOf(r, s.target).map((w) => `${w.type}:${w.id}`));
    for (const x of responses.filter((y) => y.surveyId === s.id)) need(keys.has(`${x.respondent.type}:${x.respondent.id}`), `回答 ${x.id} の回答者がアンケート ${s.id} の対象の一覧にいない`);
  }
  /* 全員の対象＝有効な拠点の利用中の利用者（ほかの拠点・利用停止の利用者は入らない） */
  const ok = activeBranchIds(r);
  for (const s of surveys.filter((y) => y.target.mode === 'all').slice(0, 1)) {
    for (const w of targetsOf(r, s.target)) {
      const u = r.get<AppUser>('dm.app.users', w.id);
      need(!!u && u.status === '有効' && ok.has(u.branchId), `アンケート（全員）の対象 ${w.id} が有効な拠点の利用中の利用者でない`);
    }
  }
  /* テンプレート */
  const tpls = r.list<SurveyTemplate>(SV_KINDS.templates);
  need(new Set(tpls.map((t) => t.name)).size === tpls.length, 'アンケートのテンプレートの名前が重なっている');
  for (const t of tpls) {
    need(/^ST-\d{3}$/.test(t.id), `テンプレート ${t.id} の ID の形が違う（ST-＋3桁）`);
    const e = validateSurvey({ name: t.name, intro: t.intro, startAt: '2000/01/01 00:00', endAt: '2000/01/02 00:00', remind: { on: false, days: 3 }, target: { mode: 'all', picks: [] }, questions: t.questions });
    for (const m of Object.values(e)) p.push(`テンプレート ${t.id}：${m}`);
  }
  return p;
}
