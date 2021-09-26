// @see https://gist.github.com/ianmstew/2b60f54fc605f81bf53a46d6b6bc9868
type notUndefined = string | number | boolean | symbol | object;
interface Dictionary<Type> {
  [key: string]: Type;
}

/* interface Dictionary<T extends notUndefined = notUndefined> {
  [key: string]: T | undefined;
} */

/* interface ObjectConstructor {
  values<TDictionary>(
    o: TDictionary extends Dictionary ? TDictionary : never,
  ): TDictionary extends Dictionary<infer TElement> ? TElement[] : never;

  entries<TDictionary>(
    o: TDictionary,
  ): [string, GetDictionaryValue<TDictionary>][];
} */

/* enum RunMode {
  DEV,
  PROD,
}
 */
