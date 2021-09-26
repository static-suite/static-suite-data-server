export const isEmptyObject = (object: object): boolean =>
  Object.keys(object).length === 0;

export const hasKey = <O>(obj: O, key: PropertyKey): key is keyof O => {
  return key in obj;
};
export const deepClone = (object: object): object =>
  JSON.parse(JSON.stringify(object));
