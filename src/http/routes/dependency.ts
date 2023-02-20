import { Request, Response } from 'express';
import { dataDirManager } from '../../lib/store/dataDir';
import { jsonify } from '../../lib/utils/object';
import {
  dependencyManager,
  getAllInvalidatedTags,
  getTagParents,
} from '../../lib/store/dependency/dependencyManager';
import {
  dependencyTree,
  getReversedDependencyTree,
  invalidatedTags,
} from '../../lib/store/dependency/dependencyTagger';

const dependencyIndex = (req: Request, res: Response): void => {
  res.render('dependencyIndex', {
    links: {
      '/dependency/tree': 'Dependency tree',
      '/dependency/tree/reversed': 'Reversed dependency tree',
      '/dependency/invalidated/tags': 'Explicitly invalidated tags',
      '/dependency/invalidated/tags/all': 'All invalidated tags in cascade',
      '/dependency/invalidated/filepaths': 'Invalidated filepaths',
      '/dependency/tag/parents': 'Tag parents',
    },
  });
};

const dependencyTreeRoute = (req: Request, res: Response): void => {
  dataDirManager.update();
  const args: any = req.query;
  const response = args?.tag ? dependencyTree.get(args.tag) : dependencyTree;
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(jsonify(response));
};

const dependencyTreeReversed = (req: Request, res: Response): void => {
  dataDirManager.update();
  const reversedDependencyTree = getReversedDependencyTree();
  const args: any = req.query;
  const response = args?.tag
    ? reversedDependencyTree.get(args.tag)
    : reversedDependencyTree;
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(jsonify(response));
};

const dependencyExplicitlyInvalidatedTags = (
  req: Request,
  res: Response,
): void => {
  dataDirManager.update();
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(jsonify(invalidatedTags));
};

const dependencyAllInvalidatedTags = (req: Request, res: Response): void => {
  dataDirManager.update();
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(getAllInvalidatedTags());
};

const dependencyInvalidatedFilepaths = (req: Request, res: Response): void => {
  dataDirManager.update();
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(dependencyManager.getInvalidatedFilepaths());
};

const dependencyTagParents = (req: Request, res: Response): void => {
  dataDirManager.update();
  const args: any = req.query;
  const response = args?.tag ? jsonify(getTagParents(args.tag)) : {};
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

export {
  dependencyIndex,
  dependencyTreeRoute,
  dependencyTreeReversed,
  dependencyExplicitlyInvalidatedTags,
  dependencyAllInvalidatedTags,
  dependencyInvalidatedFilepaths,
  dependencyTagParents,
};
