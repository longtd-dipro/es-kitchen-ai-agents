'use client';

import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { Icon } from '@/app/ops/_ui/Icon';

/*
 * 選ぶドロップダウン（Phase 1 画面 09 の商品タグと同じ形）：選んだものはチップで出し、開くとチェックの一覧。
 *   single＝1つだけ選ぶ（税率）
 *   onAdd＝一覧の下の入力欄からその場で足す（商品タグ・税率はマスタに足す、特殊指示はこの商品だけ）
 *   onRemove＝使っていない選択肢をごみ箱で消す（使っていれば 409 のエラーを一覧の下に出す）
 *   onEdit＝鉛筆でその場で直す（税率マスタ：表示・％。エラーは一覧の下に出す）
 *   kind＝足す・消す操作の名前（例 商品タグ）。入力欄・追加・削除のボタンの aria-label に使う。addMax＝選択肢がこの数になったら足せない
 */
export type DropOpt = { value: string; label: string; /** 消せる（使っている商品がない） */ removable?: boolean; /** 使っている商品の数（ヒント） */ used?: number; /** 消せないときの説明（省くと「使っている商品があるため削除できません」） */ lockedTip?: string };

export function MultiDrop({ value, opts, onChange, disabled, single, onAdd, onRemove, onEdit, addPh = '新しい項目', ph = '選択してください', err, label, kind, addMax }: {
  value: string[];
  opts: DropOpt[];
  onChange?: (v: string[]) => void;
  disabled?: boolean;
  single?: boolean;
  onAdd?: (text: string) => Promise<string | void> | string | void;
  onRemove?: (value: string) => Promise<void>;
  onEdit?: (value: string, text: string) => Promise<void>;
  addPh?: string;
  ph?: string;
  err?: boolean;
  label?: string;
  kind?: string;
  addMax?: number;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  /* 直している選択肢と入力 */
  const [ed, setEd] = useState<{ v: string; t: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  useEffect(() => { if (!open) { setMsg(''); setEd(null); } }, [open]);

  const labelOf = (v: string) => opts.find((o) => o.value === v)?.label ?? v;
  const toggle = (v: string) => {
    if (single) { onChange?.([v]); setOpen(false); return; }
    onChange?.(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  const add = async () => {
    const t = text.trim();
    if (!t || !onAdd) return;
    if (addMax !== undefined && opts.length >= addMax) { setMsg(`${kind ?? '選択肢'}は ${addMax}個までです（使っていないものを消してから足してください）`); return; }
    setBusy(true); setMsg('');
    try {
      const v = (await onAdd(t)) ?? t;
      setText('');
      if (single) onChange?.([v]); else if (!value.includes(v)) onChange?.([...value, v]);
    } catch (e) { setMsg(errorMessage(e)); } finally { setBusy(false); }
  };
  const saveEdit = async () => {
    if (!ed || !onEdit || !ed.t.trim()) return;
    setBusy(true); setMsg('');
    try { await onEdit(ed.v, ed.t.trim()); setEd(null); } catch (e) { setMsg(errorMessage(e)); } finally { setBusy(false); }
  };
  const remove = async (v: string) => {
    if (!onRemove) return;
    setBusy(true); setMsg('');
    try { await onRemove(v); } catch (e) { setMsg(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <div className={`pm-drop-sel${disabled ? ' dis' : ''}${err ? ' err' : ''}${open ? ' open' : ''}`} ref={ref}>
      <button type="button" className="pm-drop-btn" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(!open)}>
        <span className="pm-chips">
          {value.length ? value.map((v) => <span key={v} className="pm-chip">{labelOf(v)}</span>) : <span className="pm-phd">{disabled ? '' : ph}</span>}
        </span>
        {!disabled && <Icon name="chev" />}
      </button>
      {open && !disabled && (
        <div className="pm-menu" role="listbox" aria-multiselectable={!single}>
          {opts.map((o) => {
            const on = value.includes(o.value);
            if (ed?.v === o.value) return (
              <div key={o.value} className="pm-add">
                <input className="inp" value={ed.t} autoFocus aria-label={`${o.label}を直す`} onChange={(e) => setEd({ v: o.value, t: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') { e.preventDefault(); setEd(null); } }} />
                <button type="button" className="btn pri sm" disabled={busy || !ed.t.trim()} onClick={saveEdit}>保存</button>
                <button type="button" className="btn sm ghost" disabled={busy} onClick={() => setEd(null)}>やめる</button>
              </div>
            );
            return (
              <div key={o.value} className={`pm-opt${on ? ' on' : ''}`} role="option" aria-selected={on}>
                <label>
                  <input type={single ? 'radio' : 'checkbox'} checked={on} onChange={() => toggle(o.value)} />
                  <span>{o.label}</span>
                  {o.used !== undefined && <small className="muted">{o.used}件</small>}
                </label>
                {onEdit && (
                  <button type="button" className="pm-opt-del pm-opt-edit" disabled={busy} title="直す" aria-label={`${o.label}を直す`}
                    onClick={() => { setMsg(''); setEd({ v: o.value, t: o.label }); }}><Icon name="edit" /></button>
                )}
                {onRemove && (
                  <button type="button" className="pm-opt-del" disabled={busy || !o.removable || on}
                    title={on ? '選択中のため削除できません' : o.removable ? '削除' : o.lockedTip ?? '使っている商品があるため削除できません'}
                    aria-label={kind ? `${kind}「${o.label}」を削除` : `${o.label}を削除`} onClick={() => remove(o.value)}><Icon name="trash" /></button>
                )}
              </div>
            );
          })}
          {!opts.length && <div className="pm-opt muted">選択肢がありません</div>}
          {onAdd && (
            <div className="pm-add">
              <input className="inp" value={text} placeholder={addPh} aria-label={kind ? `新しい${kind}の名前` : undefined} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
              <button type="button" className="btn pri sm" disabled={busy || !text.trim()} aria-label={kind ? `${kind}を追加` : undefined} onClick={add}><Icon name="plus" />追加</button>
            </div>
          )}
          {msg && <div className="pm-msg txt-ng" role="alert">{msg}</div>}
        </div>
      )}
    </div>
  );
}
