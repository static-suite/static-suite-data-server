import fs from 'fs';
import { Request, Response } from 'express';
import { dumpManager } from '@lib/store/dump';
import { jsonify } from '@lib/utils/object';
import { config } from '@lib/config';

const dumpIndex = (req: Request, res: Response): void => {
  res.render('statusIndex', {
    links: {
      '/dump/incremental': 'Execute an incremental dump',
      '/dump/full': 'Execute a full dump',
      '/dump/metadata/show': 'Show dump metadata info',
      '/dump/metadata/reset': 'Reset dump metadata info',
    },
  });
};

const dumpIncremental = (req: Request, res: Response): void => {
  const dump = dumpManager.dump({ incremental: true });
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(jsonify(dump));
};

const dumpFull = (req: Request, res: Response): void => {
  const dump = dumpManager.dump({ incremental: false });
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(jsonify(dump));
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
  if (args?.timestamp) {
    dumpManager.reset(parseInt(args.timestamp, 10));
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
