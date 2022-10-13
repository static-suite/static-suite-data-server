import fs from 'fs';
import { Request, Response } from 'express';
import { dumpManager } from '@lib/store/dump';
import { jsonify } from '@lib/utils/object';
import { config } from '@lib/config';

const dumpIndex = (req: Request, res: Response): void => {
  res.render('dumpIndex', {
    links: {
      '/dump/incremental': 'Execute an incremental dump',
      '/dump/full': 'Execute a full dump',
      '/dump/metadata/show': 'Show dump metadata info',
      '/dump/metadata/reset': 'Reset dump metadata info',
    },
  });
};

const dumpAction = (
  req: Request,
  res: Response,
  incremental: boolean,
): void => {
  const dump = dumpManager.dump({ incremental });
  const dumpAsJson: any = jsonify(dump);
  const args: any = req.query;
  if (args?.noDiff !== undefined) {
    delete dumpAsJson.diff;
  }

  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(dumpAsJson);
};

const dumpIncremental = (req: Request, res: Response): void => {
  dumpAction(req, res, true);
};

const dumpFull = (req: Request, res: Response): void => {
  dumpAction(req, res, false);
};

const getMetadata = () => {
  const metadataFilepath = `${config.dumpDir}/metadata.json`;
  return fs.existsSync(metadataFilepath)
    ? fs.readFileSync(metadataFilepath).toString()
    : '[]';
};

const dumpMetadataShow = (req: Request, res: Response): void => {
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(getMetadata());
};

const dumpMetadataReset = (req: Request, res: Response): void => {
  const args: any = req.query;
  if (args?.uniqueId) {
    dumpManager.reset(args.uniqueId);
  }
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(getMetadata());
};

export {
  dumpIndex,
  dumpIncremental,
  dumpFull,
  dumpMetadataShow,
  dumpMetadataReset,
};
