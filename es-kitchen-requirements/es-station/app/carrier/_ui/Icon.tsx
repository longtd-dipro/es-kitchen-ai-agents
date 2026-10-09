/** 委託配送先Web のアイコン（元の I と ic()。線のアイコン 24×24） */
const I: Record<string, string> = {
  house: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  truck: '<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  clip: '<rect x="5" y="4.5" width="14" height="16.5" rx="1.5"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h7"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 9.5h18M15.5 14h2"/>',
  users: '<circle cx="12" cy="9" r="3"/><circle cx="5.5" cy="8" r="2.2"/><circle cx="18.5" cy="8" r="2.2"/><path d="M6.5 19c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5M2 16.5c.4-2 1.7-3 3.5-3M22 16.5c-.4-2-1.7-3-3.5-3"/>',
  user: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18.5c1.3-2.2 3.2-3.3 5.5-3.3s4.2 1.1 5.5 3.3"/>',
  book: '<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20M15 9.5h3M15 12.5h3"/>',
  down: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m6 15 6-6 6 6"/>', left: '<path d="m15 6-6 6 6 6"/>', right: '<path d="m9 6 6 6-6 6"/>',
  warn: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>',
  fridge: '<rect x="6" y="3" width="12" height="18" rx="1.5"/><path d="M6 10h12M9 6v2M9 13v3"/>',
  box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  dl: '<path d="M12 4v11M7 10.5l5 5 5-5M4 20h16"/>',
  zin: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8v6M8 11h6"/>', zout: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M8 11h6"/>',
  more: '<circle cx="12" cy="5.5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="18.5" r="1"/>',
  trash: '<path d="M4.5 6.5h15M9 6.5V4h6v2.5M6.5 6.5l1 14h9l1-14M10 10.5v6M14 10.5v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', pen: '<path d="m4 20 1-4.5L15.5 5l3.5 3.5L8.5 19z"/><path d="M13.5 7l3.5 3.5"/>',
  upload: '<path d="M12 16V4M7 8.5l5-5 5 5M4 20h16"/>', mail: '<rect x="3" y="5.5" width="18" height="13" rx="1"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  fold: '<path d="M4 6h16M10 10h10M10 14h10M4 18h16M7 10.5 4.5 12 7 13.5"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
};

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <svg className={`ico ${className}`} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: I[name] ?? '' }} />;
}
