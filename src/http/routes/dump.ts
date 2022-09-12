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
      '/dump/metadata': 'Dump metadata info',
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

const dumpMetadata = (req: Request, res: Response): void => {
  const metadataFilepath = `${config.dumpDir}/metadata.json`;
  if (fs.existsSync(metadataFilepath)) {
    const metadata = fs.readFileSync(metadataFilepath).toString();
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(metadata);
  } else {
    res.status(404);
    res.send('Metadata file not found');
  }
};

export { dumpIndex, dumpIncremental, dumpFull, dumpMetadata };
