# Static Suite Data Server

A flexible, fast and developer friendly Data Server for [Static Suite](https://www.drupal.org/project/static_suite).

- flexible: it honors the structure of Static Suite's data directory, non imposing any opinionated structure. Every directory and its contents can be retrieved as simple arrays, so they can be queried using common [array functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) like `filter()`, `find()`, `forEach()`, etc.
- fast: on a cold start, ~20k json files are usually loaded in ~2 seconds. Once the server is running, reloading those ~20k files usually takes ~100ms. Queries take ~1 ms, depending on their complexity. Once queries are cached, it executes ~150k queries per second.
- developer friendly: when run on `dev` mode, any change made to data files, queries or hooks (more on this later) is automatically reloaded in milliseconds. Queries are easy to create (they are just a function) and debug using a HTTP endpoint.

This Data Server supports static JSON includes (`entityInclude`, `configInclude`, `localeInclude` and `customInclude`) and the dynamic `queryInclude`.

## Options

- `dataDir` / `--data-dir`: path to the directory where data from Static Suite is stored. Required.
- `workDir` / `--work-dir`: path to the directory where work data from Static Suite is stored. Optional.
- `queryDir` / `--query-dir`: path to the directory where queries are stored. Optional.
- `hookDir` / `--hook-dir`: path to the directory where hooks are stored. Optional.
- `logLevel` / `--log-level`: log level verbosity: `error`, `warn`, `info` or `debug`. Optional. Defaults to `info`.
- `logFile` / `--log-file`: path to the log file. Data server logs its errors to the stdOut, but they can also be saved into a log file. Optional.
- `logFileLevel` / `--log-file-level`: log level verbosity for the log file: `error`, `warn`, `info` or `debug`. Optional. Defaults to the value of `logLevel` / `--log-level`
- `runMode` / `--run-mode`: "dev" or "prod". Default is "prod". Optional.
- `--port`: port number for the HTTP endpoint. Default is `57471`. Optional.

## Usage

There are three main use cases:

- during the develop/build phase of the SSG of your choice (Gatsby, Next.js, etc)
- previewing a content from Drupal
- developing/debugging queries on a local environment

### SSG develop/build phase

Require `dist/lib/dataServer.js` inside the SSG, and call its `init()` function:

```javascript
const { dataServer } = require('dist/lib/dataServer');

// Init the Data Server.
const { store, queryRunner } = dataServer.init({
  dataDir: '../data/prod',
  workDir: '../data/prod/.work',
  queryDir: './src/data-server/query',
  hookDir: './src/data-server/hook',
  logFile: '/var/log/static-suite-data-server/error.log',
  logLevel: 'debug',
  runMode: 'prod',
});

// Loop over all articles of a given language
store.data.subset({ dir: 'en/entity/node/article/' }).forEach(article => {
  // do something
});
```

### Previewing a content from Drupal

Static Suite detects any use of the `queryInclude` tag and asks the Data Server to execute that query with its parameters. That communication is done using HTTP, sending an internal request from Drupal to an HTTP endpoint where the Data Server is listening. That HTTP endpoint is provided by Static Suite Data Server and must be started before any `queryInclude` can be resolved.

```shell
yarn serve http --port 57471 --data-dir=../data/prod --work-dir=../data/prod/.work/ --query-dir=./src/data-server/query  --hook-dir=./src/data-server/hook --log-file=/var/log/static-suite-data-server/error.log --run-mode=prod
```

The above command starts an HTTP server listening at http://localhost:57471

Given a `queryInclude` defined as `"queryInclude": "queryId?arg1=value1&arg2=value2&argN=valueN"`, Drupal will send a request to http://localhost:57471/?query=queryId&arg1=value1&arg2=value2&argN=valueN and include its results in the original JSON data.

The Data Server will load queries from the directory defined in `queryDir` / `--query-dir`, based on their id. Hence, it will try to find and load a file named "queryId.query.js". Please refer to "Queries" section for more information on queries.

### Developing/debugging queries on a local environment

While developing on a local environment, you can access the same HTTP endpoint that Drupal uses to execute and debug any query.

To be able to do so, you need to start the Data Server HTTP endpoint as stated in "Usage > Previewing a content from Drupal". It should be started in "dev" mode. Please refer to "Run modes > Dev run mode" to learn more about `dev` mode.

## Data structure

The Data Server honors the structure of Static Suite's data directory. Each file is stored in a Map, keyed by its filepath, and subsets of files can be easily retrieved.

### Getting a file

Each file is stored inside a native JavaScript Map, keyed by its filepath, so they can be accessed by standard Map methods like `get()`, `has()`, etc

```javascript
// Get the contents of a file located at "en/entity/node/article/40000/41234.json"
const fileContents = store.data.get('en/entity/node/article/40000/41234.json');
```

### Getting a subset of files

To get a subset of the files stored in the aforementioned Map, you should use the `subset()` helper function provided at `store.data`, which returns an array with all files in store that match the given arguments.

#### Subset options

`subset()` function accepts an object with the following options:

- `dir`: optional base directory to filter files. It requires a trailing slash, but not a leading slash, e.g.- `en/entity/node/article/`
- `variant`: Optional name of a variant file.
  - Use `_main` to obtain the default variant.
  - Use any other string, e.g.- `card`, to obtain the card variant.
  - Use null to avoid searching for any variant.
  - Defaults to `_main`.
- `ext`: Optional file extension, without dots. Defaults to `json`.
- `recursive`: Optional flag to search for files recursively. Defaults to `true`.

All subsets are automatically cached, so passing the same arguments will return the same subset from the cache.

This is the preferred way of getting a subset of the store files, since it is a simple function that most of the times only requires the first argument.

```javascript
// Get a subset of all nodes with "json" extension.
dataServer.store.data.subset({ dir: 'en/entity/node/' });

// Get a subset of all articles in all languages with "json" extension.
dataServer.store.data.subset({ dir: '.+/entity/node/article/' });

// Get a subset of all articles in English, regardless of their extension.
dataServer.store.data.subset({ dir: 'en/entity/node/article/', ext: null });

// Get a subset of all card variants for articles in English, with "json" extension.
dataServer.store.data.subset({ dir: 'en/entity/node/article/', variant: null });

// Get a subset of articles in English, with "yml" extension, non-recursively.
dataServer.store.data.subset({
  dir: 'en/entity/node/article/',
  ext: 'yml',
  recursive: false,
});
```

This way, queries can be run on any set of data, limiting the amount of data to by analyzed.

```javascript
// Find articles that contain "foo" inside their title.
const results = store.data
  .subset({ dir: '.+/entity/node/article/' })
  .filter(article => article.data.content.title.indexOf('foo') !== 1);
```

```javascript
// Find "teaser" article variants that contain "foo" inside their title.
const results = store.data
  .subset({ dir: '.+/entity/node/article/', variant: 'teaser' })
  .filter(article => article.data.content.title.indexOf('foo') !== 1);
```

## Queries

When the Data Server is executed within Node.js, you have full access to all its data through the `store` object returned by the `dataServer.init()` function.

However, when using a `queryInclude` or the preview system from Drupal, the Data Server needs each query to be stored in its own file, inside a directory defined by the `queryDir` / `--query-dir` option.

Each query is a file named `${queryId}.query.js`, and it must export a default function which receives two arguments:

- `store`: the object that holds all data. Being a shared object, any operation that could alter it must be executed on a local copy (i.e.- using `slice()` or similar functions)
- `args`: object with arguments used by that query

It must return an object with the following keys:

- `results`: result returned .
- `cacheable`: optional boolean flag telling whether this query can be cached or not. Defaults to true.

Example: find all contents by title passed in "q" argument

```javascript
const findContentsByTitle = (storeData, args) => {
  const q = args.q?.toLowerCase();
  const results = storeData._json.main
    .filter(
      node =>
        node.data?.content?.title &&
        node.data?.content?.title?.toLowerCase().indexOf(q) !== -1,
    )
    .map(node => ({
      id: node.data?.content?.id,
      title: node.data?.content?.title,
      path: node.data?.content?.url.path,
    }));
  return { results, cacheable: true };
};

module.exports = findContentByTitle;
```

Example: list latest contents. Note the use of slice() to make a copy of the data and avoid `sort()` altering the original object.

```javascript
const latestContents = (storeData, args = {}) => {
  const results = storeData._json.main
    .slice()
    .sort((a, b) => b.changed - a.changed)
    .slice(0, args.limit || 10)
    .map(node => ({
      id: node.data?.content?.id,
      title: node.data?.content?.title,
      path: node.data?.content?.url.path,
    }));
  return { results, cacheable: false };
};

module.exports = latestContents;
```

The Data Server uses internally a `queryRunner` to execute those queries, encapsulating the query function results into an object with the following shape:

```javascript
{
  data: results,
  metadata: {
    contentType: 'application/json',
    execTime: [int],
    cache: ['miss'|'hit'],
    num: results.length,
  }
},
```

## Post processors

The Data Server allows altering the way data is processed and added to the store. To do so, it uses a special file, called the "post processor". This file must export a default object with three optional functions as keys:

```javascript
const main = {
  processFile: (options = {}) => {
    // Do something...
    return {
      rawFileContents: foo,
      jsonFileContents: bar,
    };
  },

  storeAdd: (options = {}) => {
    // Do something...
  },

  storeRemove: (options = {}) => {
    // Do something...
  },
};

module.exports = main;
```

The post processor is a single file, instead of several ones like queries. The reason for this is to be able to easily execute different post processors in a given order, or bypass some of them (or even sorting them differently) given some conditions.

### processFile

Executed after a file is read from disk, and before adding it to the store. It receives an object with the following options:

- `dataDir`: path to the data directory
- `file`: relative path to the file being processed
- `rawFileContents`: raw file contents
- `jsonFileContents`: JSON file contents
- `store`

It must return an object with two keys, that will replace the original file contents:

- `rawFileContents`
- `jsonFileContents`

### storeAdd

Executed after a file is added to the store. It receives an object with the following options:

- `dataDir`: path to the data directory
- `file`: relative path to the file being processed
- `rawFileContents`: raw file contents
- `jsonFileContents`: JSON file contents
- `store`

It must return nothing (`void`).

### storeRemove

Executed after a file is removed from the store. It receives an object with the following options:

- `file`: relative path to the file being processed
- `store`

It must return nothing (`void`).

## Run modes

There are two valid run modes: `dev` and `prod`

### Dev run mode

Disables the query cache and watches for changes in the post processor and query files:

- When a file inside the `queryDir` / `--query-dir` changes, all files inside that directory are reloaded to ensure any module or sub module is properly refreshed
- When a file inside the directory that holds the post processor changes, all files inside that directory are reloaded, and the store is reloaded and passed through the post processor, so any changes in it are applied to all data files.

This is the intended mode when developing queries (executing it by directly requesting the HTTP endpoint to execute a query). This mode is not required for the develop phase of a SSG, since the SSG will get the data from the Data Server only once.

### Prod run mode

The query cache is enabled, and no watching is enabled for the post processor and query files.

This is the intended mode for the HTTP endpoint in production, and for the develop/build phase of the SSG.

In both cases (dev and prod), when a query is executed using the HTTP endpoint, the Data Server detects which _data_ files have changed since last execution, and updates them so fresh data is always available. This behavior is mainly intended for the preview system inside Drupal, and is disabled when running a build phase of a SSG.
