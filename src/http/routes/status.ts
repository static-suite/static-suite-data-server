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
// import { Json } from '@lib/utils/object/object.types';

const statusIndex = (req: Request, res: Response): void => {
  res.render('statusIndex', {
    links: {
      'status/basic': 'Basic status info',
      'status/index/url': 'List of indexed URLs',
      'status/index/uuid': 'List of indexed UUIDs by language',
      'status/index/include': 'List of indexed includes',
      'status/index/custom': 'List of custom indexes',
    },
  });
};

const statusBasic = (req: Request, res: Response): void => {
  /*   cache.bin('query').clear();
  const startDate = microtime.now();
  const dynamicIncludes: string[] = [];
  store.data.forEach((file: Json) => {
    if (file.metadata?.includes?.dynamic && file.data?.content?.isPublished) {
      dynamicIncludes.push(JSON.stringify(file));
    }
  }); */

  const response = {
    /*     dyn: {
      ms: (microtime.now() - startDate) / 1000,
      num: dynamicIncludes.length,
    }, */
    config,
    dataDirLastUpdate: dataDirManager.getModificationDate(),
    query: {
      numberOfExecutions: queryRunner.getCount(),
      numberOfCachedQueries: cache.bin('query').size,
    },
    diff: jsonify(diffManager.getDiff()),
  };
  // includeDiffManager.resetDiff(new Date());
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

export {
  statusIndex,
  statusBasic,
  statusIndexUrl,
  statusIndexUuid,
  statusIndexInclude,
  statusIndexCustom,
};
