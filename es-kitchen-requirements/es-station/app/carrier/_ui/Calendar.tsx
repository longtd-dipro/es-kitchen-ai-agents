'use client';

import { useRouter } from 'next/navigation';
import type { CalCell } from '@/lib/carrier/logic';
import { Icon } from './Icon';
import { Tags } from './parts';

/** 曜日の見出し（月曜始まり。土日の色分けはしない：デザインシステムの CalendarGrid） */
export function Dow({ boxed }: { boxed?: boolean }) {
  const st = boxed ? { border: '1px solid var(--line)', borderRadius: 4 } : undefined;
  return (
    <div className="dow">
      {['月', '火', '水', '木', '金'].map((d) => <div key={d} style={st}>{d}</div>)}
      <div className="sat" style={st}>土</div><div className="sun" style={st}>日</div>
    </div>
  );
}

/** カレンダーのマス（元の calCell。home＝ホームの小さいカレンダー） */
export function CalDay({ c, mode }: { c: CalCell; mode?: 'home' }) {
  const router = useRouter();
  const cls = ['day', c.other ? 'other' : '', c.un ? 'unset' : '', c.today ? 'today' : ''].join(' ');
  const top = <div className="d"><span className="num">{c.d}</span>{c.un ? <span className="badge b-warn"><Icon name="warn" />未 {c.un}件</span> : null}</div>;
  const cnt = c.t.f + c.t.r + c.t.m;
  const cy = c.cy ? <div className="cy">{c.mo}サイクル<b className={`wk-${c.w}`}>{c.cy}</b></div> : null;
  if (mode === 'home') {
    return (
      <button type="button" className={cls} onClick={() => router.push('/carrier/schedule')}>
        {top}{c.cy ? <>{cy}{cnt ? <div className="cnt num">配送：{cnt}件</div> : null}</> : <span className="off">休</span>}
      </button>
    );
  }
  return (
    <button type="button" className={cls} onClick={() => router.push('/carrier/deliveries')}>
      {top}{cy ?? <div className="cy">サイクル休止</div>}<div className="tags"><Tags t={c.t} /></div>
    </button>
  );
}

/** 凡例（元の legend） */
export function Legend() {
  const dot = (bg: string, extra?: React.CSSProperties) => <i className="dot" style={{ background: bg, ...extra }} />;
  return (
    <div className="legend">
      <b style={{ fontWeight: 500 }}>凡例</b>
      <div className="row"><span>◯月サイクル ＝当月サイクル</span><span style={{ opacity: 0.6 }}>◯月サイクル ＝他月サイクル</span><span>サイクル休止 ＝サイクルなし</span></div>
      <div className="row">
        <span>{dot('var(--wk-a)')}今月のA週</span><span>{dot('var(--wk-b)')}今月のB週</span><span>{dot('var(--wk-c)')}今月のC週</span><span>{dot('var(--wk-d)')}今月のD週</span>
        <span>{dot('var(--line)')}先月・来月</span><span>{dot('var(--red)')}祝・休日</span>
        <span><span className="badge b-warn"><Icon name="warn" /></span> 配送スタッフ未設定</span>
        <span><i className="dot" style={{ border: '2px solid var(--green)', borderRadius: 2 }} />当日</span>
      </div>
      <div className="row">
        <span className="tag t-f"><Icon name="snow" /></span> ＝冷凍配送 <span className="tag t-r"><Icon name="fridge" /></span> ＝冷蔵配送 <span className="tag t-m"><Icon name="box" /></span> ＝資材配送
      </div>
    </div>
  );
}
