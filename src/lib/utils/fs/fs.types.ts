export type Json = {
  [key: string]: unknown;
  __FILENAME__?: string;
};

export type FileType = {
  raw: string | null;
  json: Json | null;
};
