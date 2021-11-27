import { Request, Response } from 'express';
import path from 'path';
import marked from 'marked';
import { readFile } from '@lib/utils/fs/fsUtils';

export const docs = (req: Request, res: Response): void => {
  const readme = readFile(path.join(__dirname, '../README.md'));
  res.render('docs', { marked, readme });
};
