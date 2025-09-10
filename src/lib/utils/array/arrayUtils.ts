export const arrayRemoveByValue = (arr: any[], value: any): void => {
  const index = arr.indexOf(value);
  if (index !== -1) {
    arr.splice(index, 1);
  }
};
