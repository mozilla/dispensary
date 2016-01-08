export function uniqueArray(array) {
  var seen = new Set();

  return array.filter((x) => {
    return !seen.has(x) && seen.add(x);
  });
}
