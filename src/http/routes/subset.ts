import { Request, Response } from 'express';
import { StoreSubsetOptions } from 'lib/store/store.types';
import { store } from '../../lib/store';
import { dataDirManager } from '../../lib/store/dataDir';

const subset = (req: Request, res: Response): void => {
  dataDirManager.update();
  const options: StoreSubsetOptions = {};
  if (req.query.dir) {
    options.dir = req.query.dir as string;
  }
  if (req.query.variant) {
    if (req.query.variant === 'null') {
      options.variant = undefined;
    } else {
      options.variant = req.query.variant as string;
    }
  }
  if (req.query.ext) {
    options.ext = req.query.ext as string;
  }
  if (req.query.recursive) {
    options.recursive = req.query.recursive === 'true';
  }

  const returnedSubset = store.data.subset(options);
  let result;
  if (req.query.as === 'url') {
    result = returnedSubset.items
      .map(item => item.data?.content?.url?.path)
      .filter(path => !!path);
  } else {
    result = returnedSubset.filenames;
  }

  res.status(200);
  res.set({
    'Content-Type': 'application/json',
  });
  res.send(result);
};

export { subset };
