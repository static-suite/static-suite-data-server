// import microtime from 'microtime';
import { Request, Response } from 'express';
import { dataDirManager } from '@lib/store/dataDir';
import { queryRunner } from '@lib/query';
import { config } from '@lib/config';
import { cache } from '@lib/utils/cache';
import { store } from '@lib/store';
import { jsonify } from '@lib/utils/object';
import { diffManager } from '@lib/store/diff/diffManager';
import { ObjectType } from '@lib/utils/object/object.types';
import { tracker } from '@lib/store/diff/tracker';

const statusIndex = (req: Request, res: Response): void => {
  res.render('statusIndex', {
    links: {
      '/status/basic': 'Basic status info',
      '/status/index/url': 'List of indexed URLs',
      '/status/index/uuid': 'List of indexed UUIDs by language',
      '/status/index/include': 'List of indexed includes',
      '/status/index/custom': 'List of custom indexes',
      '/status/diff': 'Diff info',
      '/status/diff/tracker': 'Diff tracker info',
    },
  });
};

const statusBasic = (req: Request, res: Response): void => {
  const response = {
    config,
    dataDirLastUpdate: dataDirManager.getModificationDate(),
    query: {
      numberOfExecutions: queryRunner.getCount(),
      numberOfCachedQueries: cache.bin('query').size,
    },
  };
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

const statusIndexUrl = (req: Request, res: Response): void => {
  const response = Array.from(store.index.url.keys());
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

const statusIndexUuid = (req: Request, res: Response): void => {
  const response: ObjectType = {};
  store.index.uuid.forEach((uuids: Map<string, any>, langcode: string) => {
    response[langcode] = Array.from(uuids.keys());
  });

  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

const statusIndexInclude = (req: Request, res: Response): void => {
  const response = jsonify(store.index.include);
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

const statusIndexCustom = (req: Request, res: Response): void => {
  const response = Array.from(store.index.custom.keys());
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

const statusDiff = (req: Request, res: Response): void => {
  const response = jsonify(diffManager.getDiff());
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

const statusDiffTracker = (req: Request, res: Response): void => {
  const response = {
    changedFiles: jsonify(tracker.getChangedFiles()),
  };
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

export {
  statusIndex,
  statusBasic,
  statusIndexUrl,
  statusIndexUuid,
  statusIndexInclude,
  statusIndexCustom,
  statusDiff,
  statusDiffTracker,
};
