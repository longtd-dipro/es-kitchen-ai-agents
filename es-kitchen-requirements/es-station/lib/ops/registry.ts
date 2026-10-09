import type { Area } from './core/area';
import applications from './areas/applications';
import billing from './areas/billing';
import contracts from './areas/contracts';
import delivery from './areas/delivery';
import general from './areas/general';
import masters from './areas/masters';
import menu from './areas/menu';
import purchasing from './areas/purchasing';
import reviews from './areas/reviews';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import corpDocs from '@/lib/corp/areas/corp-docs';
import corpOrder from '@/lib/corp/areas/corp-order';
import corpSites from '@/lib/corp/areas/corp-sites';
import carrier from '@/lib/carrier/area';
import driver from '@/lib/driver/area';

/** 全サイトの領域（運営Web・法人Web・委託配送先Web・ドライバー）。新しい領域を作ったらここに足す。法人Web の領域は corp- で始める */
export const AREAS: Record<string, Area> = Object.fromEntries(
  [applications, contracts, masters, billing, delivery, menu, reviews, purchasing, general, corpDelivery, corpSites, corpDocs, corpOrder, carrier, driver].map((a) => [a.name, a as Area]),
);

export const allSeeds = () => Object.values(AREAS).map((a) => a.seed());
