type QueryRunner = {
  getAvailableQueryIds(): string[];
  run(
    queryId: string,
    args: Record<string, string>,
  ): QueryResponse | QueryErrorResponse;
  getCount(): number;
};

type QueryModule = {
  queryHandler(options: {
    data: any;
    args: Record<string, string>;
  }): QueryModuleResult;
};

type QueryModuleResult = {
  result: any;
  cacheable: boolean;
};

enum CacheStatus {
  MISS,
  HIT,
}

type QueryResponse = {
  data: any;
  metadata: {
    contentType: string;
    num?: number;
    execTimeMs: number;
    queriesPerSecond?: number;
    cache: CacheStatus;
  };
};

type QueryErrorResponse = {
  error: string;
};

const isQueryErrorResponse = (
  query: QueryResponse | QueryErrorResponse,
): query is QueryErrorResponse =>
  (query as QueryErrorResponse).error !== undefined;

export {
  QueryRunner,
  QueryModule,
  CacheStatus,
  QueryResponse,
  QueryErrorResponse,
  isQueryErrorResponse,
};
