import { Request, Response } from 'express';
declare const dependencyIndex: (req: Request, res: Response) => void;
declare const dependencyTreeRoute: (req: Request, res: Response) => void;
declare const dependencyTreeReversed: (req: Request, res: Response) => void;
declare const dependencyExplicitlyInvalidatedTags: (req: Request, res: Response) => void;
declare const dependencyAllInvalidatedTags: (req: Request, res: Response) => void;
declare const dependencyInvalidatedFilepaths: (req: Request, res: Response) => void;
declare const dependencyTagParents: (req: Request, res: Response) => void;
export { dependencyIndex, dependencyTreeRoute, dependencyTreeReversed, dependencyExplicitlyInvalidatedTags, dependencyAllInvalidatedTags, dependencyInvalidatedFilepaths, dependencyTagParents, };
//# sourceMappingURL=dependency.d.ts.map