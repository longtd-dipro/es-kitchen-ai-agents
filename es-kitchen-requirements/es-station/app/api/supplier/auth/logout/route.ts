import { handle, setSupplierSession } from '@/lib/server/http';

export const POST = () => handle(() => setSupplierSession(null));
