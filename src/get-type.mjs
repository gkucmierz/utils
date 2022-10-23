
// better js typeof

export const getType = val => {
  const str = Object.prototype.toString.call(val);
  return str.slice(8, -1).toLowerCase();
};
