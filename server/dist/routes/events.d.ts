import { Response } from 'express';
declare const router: import("express-serve-static-core").Router;
export declare const sseClients: Set<Response>;
export declare function broadcastSSE(event: string, data: unknown): void;
export default router;
//# sourceMappingURL=events.d.ts.map