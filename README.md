# Static Suite Data Server

A flexible, fast and developer friendly Data Server for [Static Suite](https://www.drupal.org/project/static_suite).

- flexible: it honors the structure of Static Suite's data directory, non imposing any opinionated structure. Every directory and its contents can be retrieved as simple arrays, and therefore queried using common [array functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) like `filter()`, `find()`, `forEach()`, etc.
- fast: on a cold start, ~20k json files are usually loaded in ~2 seconds. Queries take ~1 ms, depending on their complexity. Once queries are cached, it executes ~150k queries per second.
- developer friendly: when run in `dev` mode, changes made to queries or hooks (more on this later) are automatically reloaded. Queries are easy to create (they are just a function) and debug using a HTTP endpoint.

Data Server supports static JSON includes (`entityInclude`, `configInclude`, `localeInclude` and `customInclude`) and the dynamic `queryInclude`, keeping track of the relationships between includes and data: when a file changes, it knows which other files should also change, thus enabling _incremental builds_ for any kind of SSG (Gatsby, Next.js, etc).

## Options

- `dataDir` / `--data-dir`: path to the directory where data from Static Suite is stored. Required.
- `workDir` / `--work-dir`: path to the directory where work data from Static Suite is stored. Optional.
- `dumpDir` / `--dump-dir`: path to the directory where data from Static Suite is dumped after being processed by Data Server. Optional.
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

Require `dataServer` from `@static-suite/static-suite-data-server/dist/lib/` inside the SSG, and call its `init()` function:

```javascript
const {
  dataServer,
} = require('@static-suite/static-suite-data-server/dist/lib/');

// Init Data Server.
const { store } = dataServer.init({ dataDir: '../data/prod' });

// Loop over all articles in english.
store.data.subset({ dir: 'en/entity/node/article/' }).items.forEach(article => {
  // do something
});
```

### Previewing a content from Drupal

Static Suite detects any use of the `queryInclude` tag and asks Data Server to execute that query with its parameters. That communication is done using HTTP, sending an internal request from Drupal to an HTTP endpoint where Data Server is listening. That HTTP endpoint is provided by Static Suite Data Server and must be started before any `queryInclude` can be resolved.

```shell
yarn serve http --port 57471 --data-dir=../data/prod --work-dir=../data/prod/.work/ --query-dir=./src/data-server/query --hook-dir=./src/data-server/hook --run-mode=prod
```

The above command starts an HTTP server listening at http://localhost:57471

Given a `queryInclude` defined as `"queryInclude": "queryId?arg1=value1&arg2=value2"`, Drupal will send a request to http://localhost:57471/query/queryId?arg1=value1&arg2=value2 and include its results in the original JSON data.

Data Server will load queries from the directory defined in `queryDir` / `--query-dir`, based on their id. Hence, it will try to find and load a file named "queryId.query.js". Please refer to "[Queries](#queries)" section for more information on queries.

### Developing/debugging queries on a local environment

While developing on a local environment, you can access the same HTTP endpoint that Drupal uses to execute and debug any query.

To be able to do so, you need to start the Data Server HTTP endpoint as stated in "Usage > [Previewing a content from Drupal](#previewing-a-content-from-drupal)". It should be started in "dev" mode. Please refer to "[Run modes](#run-modes) > [Dev run mode](#dev-run-mode)" to learn more about `dev` mode.

## Data structure

Data Server honors the structure of Static Suite's data directory. Each file is stored in a Map, keyed by its filepath, and subsets of files (groups of files belonging to a directory) can be easily retrieved.

Data is stored in the `store` object, the main point of access to all data. It is an object passed as argument in multiple parts of Data Server (queries, hooks, etc) and also returned by `dataServer.init()` function when executing Data Server inside Node.js.

### Store internal structure

- `data`: a Map that holds all data for all files, keyed by their relative filepath. No directory or any other structure is stored here.

- `index`: an object to hold accessory index data:

  - `url`: a Map that holds all data for all files, keyed by their URL.

  - `uuid`: a Map that holds all data for all files, keyed by their langcode and UUID.

  - `custom`: a Map to hold custom data defined in hooks or queries.

### Getting a file

Each file is stored inside a native JavaScript Map, keyed by its filepath, so they can be accessed by standard Map methods like `get()`, `has()`, etc

```javascript
// Get the contents of a file located at "en/entity/node/article/40000/41234.json"
const fileContents = store.data.get('en/entity/node/article/40000/41234.json');
```

### Getting a subset of files

To get a subset of files stored in the aforementioned Map, you should use the `subset()` helper function provided at `store.data`, which returns an object with access to all files in store that match the given arguments.

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

#### Return value

`subset()` function returns an object with the following members:

- `map`: map of elements, with the filename as key
- `filenames`: array of filenames in the subset
- `items`: array of items in the subset

> All subsets are automatically cached, so passing the same arguments will return the same subset from the cache.

This is the preferred way of getting a subset of the store files, since it is a simple function that most of the times only requires the first argument.

```javascript
// Get a subset of all files with "json" extension.
store.data.subset();

// Get a subset of all nodes in English with "json" extension.
store.data.subset({ dir: 'en/entity/node/' });

// Get a subset of all articles in all languages with "json" extension.
store.data.subset({ dir: '.+/entity/node/article/' });

// Get a subset of all articles in English, regardless of their extension.
store.data.subset({ dir: 'en/entity/node/article/', ext: null });

// Get a subset of all card variants for articles in English, with "json" extension.
store.data.subset({ dir: 'en/entity/node/article/', variant: null });

// Get a subset of articles in English, with "yml" extension, non-recursively.
store.data.subset({
  dir: 'en/entity/node/article/',
  ext: 'yml',
  recursive: false,
});
```

This way, queries can be run on any set of data, limiting the amount of data to be analyzed.

```javascript
// Find articles that contain "foo" inside their title.
const results = store.data
  .subset({ dir: '.+/entity/node/article/' })
  .items.filter(article => article.data.content.title.includes('foo'));
```

```javascript
// Find "teaser" article variants that contain "foo" inside their title.
const results = store.data
  .subset({ dir: '.+/entity/node/article/', variant: 'teaser' })
  .items.filter(article => article.data.content.title.includes('foo'));
```

### Indexes

Apart from the main data Map, files are also automatically stored in two more maps (indexes) to be able to access them faster:

- `url`: a Map keyed by the URL of each file. Only JSON files containing `data.content.url.path` are stored.
- `uuid`: a Map keyed by the langcode and UUID of each file. Only JSON files containing `data.content.uuid` are stored.

```javascript
// Find a content with a URL of "lorem/ipsum".
const fileByUrl = store.index.url.get('lorem/ipsum');

// Find a content with an UUID of "f2329fe4-c04c-4709-9673-046683704d38", using its english and french version.
const englishFileByUuid = store.index.uuid
  .get('en-gb')
  .get('f2329fe4-c04c-4709-9673-046683704d38');

const frenchFileByUuid = store.index.uuid
  .get('fr')
  .get('f2329fe4-c04c-4709-9673-046683704d38');
```

#### Custom indexes

There is also an option to create your own custom indexes, usually useful to speed up queries. Custom indexes are stored inside a Map located at `store.index.custom`.

```javascript
// Create a new custom index as a Map (or as an array, Set, etc).
store.index.custom.set('myIndex', new Map());

// Add data to index.
const myIndexMap = store.index.custom.get('myIndexMap');
myIndexMap.set('my-key', 'my-value');

// Use custom index in your queries.
const customData = myIndexMap.get('my-key);
// Do something with customData
```

Custom indexes are intended to be created by hooks and consumed by queries. Please refer to "[Hooks](#hooks)" and "[Queries](#queries)" sections for more information.

## Queries

When Data Server is executed within Node.js, you have full access to all its data through the `store` object returned by `dataServer.init()` function.

However, when using a `queryInclude` or the preview system from Drupal, Data Server needs to run a query, which is stored in a file inside a directory defined by the `queryDir` / `--query-dir` option.

Each query is a file named `${queryId}.query.js`, and it must export a default function that receives an object as an argument, containing two keys (`store` and `args`):

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).

- `args`: object with arguments used by that query.

> PLEASE NOTE: since `store` is a shared object, you MUST NOT alter it from your queries.

Queries must return an object with the following keys:

- `result`: the list of returned results. It must be an structure representable as JSON (an object, array, string, etc)
- `contentType`: optional content-type for the `result` field. Defaults to `application/json`.
- `tags`: optional array of dependency tags. Defaults to `['*']`. Please refer to "[Dependency Tags](#dependency-tags)" section for more information on this topic.
- `cacheable`: optional boolean flag telling whether this query can be cached or not. Defaults to true.

Example: find all contents by title passed in "q" argument

```javascript
const findContentsByTitle = ({ store, args }) => {
  const q = args?.q?.toLowerCase();
  const result = store.data
    .subset()
    .items.filter(node => node.data?.content?.title?.toLowerCase().includes(q))
    .map(node => ({
      id: node.data?.content?.id,
      title: node.data?.content?.title,
      path: node.data?.content?.url.path,
    }));
  return { result };
};

module.exports.default = findContentsByTitle;
```

Example: get latest 10 articles, with optional "limit" parameter.

```javascript
const latestContents = ({ store, args }) => {
  const result = store.data
    .subset({ dir: '.+/entity/node/article/' })
    .items.sort((a, b) => b.changed - a.changed)
    .slice(0, args?.limit || 10)
    .map(node => ({
      id: node.data?.content?.id,
      title: node.data?.content?.title,
      path: node.data?.content?.url.path,
    }));
  return { result };
};

module.exports.default = latestContents;
```

Data Server uses internally a `queryRunner` to execute those queries, encapsulating the query function results into an object with the following shape:

```javascript
{
  data: results,
  metadata: {
    contentType: string,
    execTimeMs: int,
    cache: 'miss'|'hit',
    tags: string[],
  }
},
```

## Hooks

Data Server allows altering the way data is processed and added to the store. To do so, it uses `hooks`, a kind of event-driven system which executes custom code at different points of the processing workflow.

Hooks are stored in a file inside a directory defined by the `hookDir` / `--hook-dir` option.

### Available hooks

Each hook is a file named `${hookId}.hook.js`, and it must export an object with several optional functions as keys:

#### `onModuleLoad({config, store, logger }): void`

Called when a hook module is loaded or reloaded. It is aimed at bootstrapping some data structure, or establishing some connection to an external system before other hooks run.

Received parameters:

- `config`: object with configuration options defined at Data Server start: `dataDir`, `workDir`, `queryDir`, etc
- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`

#### `onStoreLoadStart({ store, logger, dependencyTagger }): void`

Called before the store starts loading for the first time.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.

#### `onProcessFile({ store, logger, dependencyTagger, relativeFilepath, fileContent }): fileContent`

Called after a file is read from disk, before adding it to the store. It is aimed at altering the contents of the file before adding it to the store.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.
- `relativeFilepath`: relative file path inside the data dir.
- `fileContent`: file contents, an object with "raw" and "json" members.

Return value:

- The passed `fileContent` object (an object with "raw" and "json" members) with any modification applied.

#### `onStoreItemAdd({ store, logger, dependencyTagger, relativeFilepath, storeItem }): void`

Called after a file is added into the store for the first time.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.
- `relativeFilepath`: relative file path inside the data dir.
- `storeItem`: contents of the store item.

#### `onStoreLoadDone({ store, logger, dependencyTagger }): void`

Called after the store finishes loading for the first time.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.

#### `onStoreChangeStart({ store, logger, dependencyTagger, changedFiles }): void`

Called before the store starts updating.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.
- `changedFiles`: a group of changed files in Static Suite's data dir, an object with the following keys:
  - `fromUniqueId`: a unique id representing the date from which those changes are obtained.
  - `toUniqueId`: a unique id representing the date until which those changes are obtained.
  - `updated`: a list of updated files (both newly added and changed files).
  - `deleted`: a list of deleted files.

#### `onStoreItemBeforeUpdate({ store, logger, dependencyTagger, relativeFilepath, storeItem }): void`

Called before a file is updated in the store.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.
- `relativeFilepath`: relative file path inside the data dir.
- `storeItem`: contents of the store item.

#### `onStoreItemAfterUpdate({ store, logger, dependencyTagger, relativeFilepath, storeItem, previousStoreItem }): void`

Called after a file is updated in the store.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.
- `relativeFilepath`: relative file path inside the data dir.
- `storeItem`: contents of the store item.
- `previousStoreItem`: contents of the previous store item before store was updated

#### `onStoreItemDelete({ store, logger, dependencyTagger, relativeFilepath, storeItem }): void`

Called after a file is deleted from the store.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.
- `relativeFilepath`: relative file path inside the data dir.
- `storeItem`: contents of the store item.

#### `onStoreChangeDone({ store, logger, dependencyTagger, changedFiles }): void`

Called after the store ends updating.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `logger`: the logger service width several functions to log messages: `error()`, `warn()`, `info()`, `error()`
- `dependencyTagger`: the dependency tagger service. See [Dependency Tags](#dependency-tags) section.
- `changedFiles`: a group of changed files in Static Suite's data dir, an object with the following keys:

  - `fromUniqueId`: a unique id representing the date from which those changes are obtained.
  - `toUniqueId`: a unique id representing the date until which those changes are obtained.
  - `updated`: a list of updated files (both newly added and changed files).
  - `deleted`: a list of deleted files.

#### `onDumpCreate(options: OnDumpHookOptions): Dump`

Called after a dump object is created, aimed at altering the contents of the dump being saved, and adding/removing items.

Received parameters:

- `store`: the object that holds all data. See [store internal structure](#store-internal-structure).
- `dumpDir`: path to the dump directory.
- `dump`: the dump to be processed. See [Dumps section](#dumps) for more information.

Return value:

- The passed `dump` object with any modification applied.

### Hook example

The main use case of hooks is creating index data that will be later consumed by queries. In this example, we will create:

1. a hook that manages a custom index of contents indexed by their taxonomy term id.
2. a query that consumes that custom index.

#### `File taxonomy.hook.js`

```javascript
// file taxonomy.hook.js

// A reference to our custom index.
let filepathsByTermIdIndex = null;

/**
 * Helper function to add content to index
 */
const addContentToIndex = (relativeFilepath, storeItem) => {
  const termId = storeItem.data?.content?.primaryTaxonomy?.entity?.tid;
  // Only add content to index if it has a taxonomy term id.
  if (termId) {
    // Initialize Set for this taxonomy term id.
    if (!filepathsByTermIdIndex.has(termId)) {
      filepathsByTermIdIndex.set(termId, new Set());
    }
    const taxonomySet = filepathsByTermIdIndex.get(termId);
    // Add file path to index.
    taxonomySet.add(relativeFilepath);
  }
};

/**
 * Helper function to search and remove any reference to relativeFilepath in index.
 */
const deleteContentFromIndex = relativeFilepath => {
  filepathsByTermIdIndex.forEach(taxonomySet => {
    if (taxonomySet.has(relativeFilepath)) {
      taxonomySet.delete(relativeFilepath);
    }
  });
};

module.exports = {
  // Initialize custom index.
  onModuleLoad: ({ store }) => {
    if (!store.index.custom.has('filepathsByTermId')) {
      store.index.custom.set('filepathsByTermId', new Map());
    }
    filepathsByTermIdIndex = store.index.custom.get('filepathsByTermId');
  },

  // Add content to index during store's first load.
  onStoreItemAdd: ({ relativeFilepath, storeItem }) => {
    addContentToIndex(relativeFilepath, storeItem);
  },

  // Remove content from index to rollback any change.
  onStoreItemBeforeUpdate: ({ relativeFilepath }) => {
    deleteContentFromIndex(relativeFilepath);
  },

  // Add content again to index. This hook runs after
  // `onStoreItemBeforeUpdate`, so content is already
  // removed from index and we can simply add it again.
  onStoreItemAfterUpdate: ({ relativeFilepath, storeItem }) => {
    addContentToIndex(relativeFilepath, storeItem);
  },

  // Remove content from index
  onStoreItemDelete: ({ relativeFilepath }) => {
    deleteContentFromIndex(relativeFilepath);
  },
};
```

#### `File listContentsByTermId.query.js`

```javascript
const listContentsByTermId = ({ store, args }) => {
  // Get the passed parameter "taxonomyTermId",
  const { termId: termIdString } = args;

  // Please note that args.termId is a string, but we need an integer.
  const termId = parseInt(termIdString, 10);

  // Get the Set of filepaths belonging to this taxonomy term id.
  const filepathsByTermId = store.index.custom
    .get('filepathsByTermId')
    .get(termId);

  const contentsByTermId = [];
  // Iterate over all items and get their data from store.data.
  if (filepathsByTermId) {
    filepathsByTermId.forEach(filepath => {
      // Get data from store.
      const content = store.data.get(filepath);
      // Add to contentsByTaxonomyTermId array, getting only the set of values we need.
      contentsByTermId.push({
        id: content.data?.content?.id,
        title: content.data?.content?.title,
        path: content.data?.content?.url.path,
      });
    });
  }

  return {
    result: contentsByTermId,
  };
};

module.exports.default = listContentsByTermId;
```

## Dumps

Data Server is able to detect when a file is being used (included) by other file. When a file changes, Data Server provides a list of all files affected by that change. This list can therefore be used to generate incremental builds of your site, building only the HTML pages for those changed files.

To obtain that list of incremental changes, Data Server makes use of a `dump`. A dump is a directory where Data Server outputs all its data once all its includes are resolved and its queries executed. Think of a dump as an exported copy of the `data dir`, without any include nor query.

This `dump` directory is used to keep track of any change, and to be able to build only the exact files that have changes:

1. When a dump is run, it calculates which files are probably affected by latest changes.
2. With that set of candidates, Data Server checks those changes against the dump directory, narrowing the final set of changed files and saving them to that directory.

A dump is executed by accessing an HTTP endpoint located at `/dump/incremental`, which returns a response like this one:

```json
{
  "execTimeMs": 214.666,
  "fromUniqueId": "2022-06-20_11-29-12.834701__4492",
  "toUniqueId": "2022-06-20_11-59-57.045645__8520",
  "updated": {
    "en-gb/entity/node/article/1234.json": {
      "oldPublicUrl": "/my-article",
      "newPublicUrl": "/my-renamed-article"
    }
  },
  "deleted": {},
  "diff": {
    "execTimeMs": 110.636,
    "fromUniqueId": "2022-06-20_11-29-12.834701__4492",
    "toUniqueId": "2022-06-20_11-59-57.045645__8520",
    "updated": [
      "en-gb/entity/node/article/1234.json",
      "en-gb/entity/node/page/1.json"
    ],
    "deleted": []
  }
}
```

All data inside the `diff` key corresponds to the first step of the dump, when Data Server calculates which files are affected by changes. It is only informative, and should not be used for incremental builds.

Data inside the `dump` key is the one to be used for incremental builds. It contains the set of updated files that actually have changes, along with the set of deleted files. Use this data to decide which files should be incrementally rebuilt or deleted. Please note than when a file gets its URL renamed, Data Server tracks down that change so you can act accordingly (by using the `oldPublicUrl` and `newPublicUrl` keys).

All this data returned by the HTTP endpoint is also stored in a metadata file named `metadata.json`, located inside the dump directory. Once you are finished creating the incremental pages for your site, you should clean up that metadata file, manually or by calling the HTTP endpoint located at `/dump/metadata/reset?uniqueId=[toUniqueId]`.

## Dependency tags

When a query is executed, it can return an array of dependency tags, declaring which files, strings, keys, indexes, etc it depends on. By default, all queries depend on `*` (asterisk), which means that they depend on any change on any file, whatever it is.

Hence, when executing a dump, all queries are detected as files probably affected by changes. Therefore, they are re-executed and compared against the dump directory, to finally detect the files that actually have changed.

Data Server is fast enough to execute thousands of queries in a single second, so re-executing all queries on a dump is rarely a performance bottleneck.

Anyway, there are some cases with tens of thousands of queries, or slow disks, which need to be addressed to avoid re-executing all queries.

> PLEASE NOTE that using dependency tags is a performance optimization, and should be avoided if performance is not a problem.

### Dependency tagger

Dependency tags are managed by a service called `dependencyTagger`, which is passed to most hooks as a parameter. It has the following functions:

#### `setDependency(tag: string, dependsOnTags: string[]): void`

Sets a dependency relationship between a tag that depends on another tags. It replaces any previous dependency relationship.

#### `addDependency(tag: string, dependsOnTags: string[]): void`

Adds a dependency relationship between a tag that depends on another tags. It adds data to any previous dependency relationship.

#### `deleteDependency(tag: string, dependsOnTags?: string[]): void`

Deletes a dependency relationship between a tag that depends on another tags. If `dependsOnTags` is not provided, it deletes all dependencies for `tag`.

#### `invalidateTags(tags: string[]): void`

Marks dependency items with any of the specified tags as invalid.

### Dependency tags example

Following the previous [hook example](#hook-example), let's add dependency tags to the hook and query used there.

#### `File taxonomy.hook.js`

Since we are creating an index based on taxonomy term ids, we only need to invalidate tags when that index changes.

```javascript
// file taxonomy.hook.js

// A reference to our custom index.
let filepathsByTermIdIndex = null;

/**
 * Helper function to add content to index
 */
const addContentToIndex = (relativeFilepath, storeItem, dependencyTagger) => {
  const termId = storeItem.data?.content?.primaryTaxonomy?.entity?.tid;
  // Only add content to index if it has a taxonomy term id.
  if (termId) {
    // Initialize Set for this taxonomy term id.
    if (!filepathsByTermIdIndex.has(termId)) {
      filepathsByTermIdIndex.set(termId, new Set());
    }
    const taxonomySet = filepathsByTermIdIndex.get(termId);
    // Add file path to index.
    taxonomySet.add(relativeFilepath);
    // Invalidate dependencies.
    dependencyTagger.invalidateTags([`filepathsByTermId:${termId}`]);
  }
};

/**
 * Helper function to search and remove any reference to relativeFilepath in index.
 */
const deleteContentFromIndex = (relativeFilepath, dependencyTagger) => {
  filepathsByTermIdIndex.forEach((taxonomySet, termId) => {
    if (taxonomySet.has(relativeFilepath)) {
      taxonomySet.delete(relativeFilepath);
      // Invalidate dependencies.
      dependencyTagger.invalidateTags([`filepathsByTermId:${termId}`]);
    }
  });
};

module.exports = {
  // Initialize custom index.
  onModuleLoad: ({ store }) => {
    if (!store.index.custom.has('filepathsByTermId')) {
      store.index.custom.set('filepathsByTermId', new Map());
    }
    filepathsByTermIdIndex = store.index.custom.get('filepathsByTermId');
  },

  // Add content to index during store's first load.
  onStoreItemAdd: ({ relativeFilepath, storeItem, dependencyTagger }) => {
    addContentToIndex(relativeFilepath, storeItem, dependencyTagger);
  },

  // Remove content from index to rollback any change.
  onStoreItemBeforeUpdate: ({ relativeFilepath, dependencyTagger }) => {
    deleteContentFromIndex(relativeFilepath, dependencyTagger);
  },

  // Add content again to index. This hook runs after
  // `onStoreItemBeforeUpdate`, so content is already
  // removed from index and we can simply add it again.
  onStoreItemAfterUpdate: ({
    relativeFilepath,
    storeItem,
    dependencyTagger,
  }) => {
    addContentToIndex(relativeFilepath, storeItem, dependencyTagger);
  },

  // Remove content from index
  onStoreItemDelete: ({ relativeFilepath, dependencyTagger }) => {
    deleteContentFromIndex(relativeFilepath, dependencyTagger);
  },
};
```

#### `File listContentsByTermId.query.js`

Once the hook properly invalidates tags, we only need to declare which query depends on which tags. This is done by returning a `tags` array inside the query response (it internally sets dependencies using the `setDependency()` function from `dependencyTagger`).

```javascript
const listContentsByTermId = ({ store, args }) => {
  // Get the passed parameter "taxonomyTermId",
  const { termId: termIdString } = args;

  // Please note that args.termId is a string, but we need an integer.
  const termId = parseInt(termIdString, 10);

  // Get the Set of filepaths belonging to this taxonomy term id.
  const filepathsByTermId = store.index.custom
    .get('filepathsByTermId')
    .get(termId);

  const contentsByTermId = [];
  // Iterate over all items and get their data from store.data.
  if (filepathsByTermId) {
    filepathsByTermId.forEach(filepath => {
      // Get data from store.
      const content = store.data.get(filepath);
      // Add to contentsByTaxonomyTermId array, getting only the set of values we need.
      contentsByTermId.push({
        id: content.data?.content?.id,
        title: content.data?.content?.title,
        path: content.data?.content?.url.path,
      });
    });
  }

  return {
    result: contentsByTermId,
    tags: [`filepathsByTermId:${termId}`],
  };
};

module.exports.default = listContentsByTermId;
```

## Run modes

There are two valid run modes: `dev` and `prod`

### Dev run mode

It watches for changes in the post processor and query files:

- When a file inside the `queryDir` / `--query-dir` changes, all files inside that directory are reloaded to ensure any module or sub module is properly refreshed
- When a file inside the `hookDir` / `--hook-dir` changes, all files inside that directory are reloaded, and the store is reloaded and passed again through all hooks, so any changes in them are applied to all data files.

This is the intended mode when developing queries (executing it by directly requesting the HTTP endpoint to execute a query). This mode is not required for the develop phase of a SSG, since the SSG will get the data from the Data Server only once.

### Prod run mode

The query cache is enabled, and no watching is enabled for hook or query files.

This is the intended mode for the HTTP endpoint in production, and for the develop/build phase of the SSG.

In both cases (dev and prod), when a query is executed using the HTTP endpoint, the Data Server detects which _data_ files have changed since last execution, and updates them so fresh data is always available. This behavior is mainly intended for the preview system inside Drupal, and is disabled when running a build phase of a SSG.
