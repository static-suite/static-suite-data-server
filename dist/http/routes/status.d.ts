import { Request, Response } from 'express';
declare const statusIndex: (req: Request, res: Response) => void;
declare const statusBasic: (req: Request, res: Response) => void;
declare const statusIndexUrl: (req: Request, res: Response) => void;
declare const statusIndexUuid: (req: Request, res: Response) => void;
declare const statusIndexInclude: (req: Request, res: Response) => void;
declare const statusIndexCustom: (req: Request, res: Response) => void;
declare const statusDiff: (req: Request, res: Response) => void;
declare const statusDiffTracker: (req: Request, res: Response) => void;
export { statusIndex, statusBasic, statusIndexUrl, statusIndexUuid, statusIndexInclude, statusIndexCustom, statusDiff, statusDiffTracker, };
//# sourceMappingURL=status.d.ts.map