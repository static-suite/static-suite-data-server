type ObjectType = Record<string, unknown>;

export const isEmptyObject = (object: ObjectType): boolean =>
  Object.keys(object).length === 0;

export const hasKey = <O>(obj: O, key: PropertyKey): key is keyof O => {
  return key in obj;
};

export const deepClone = (object: ObjectType): ObjectType =>
  JSON.parse(JSON.stringify(object));
