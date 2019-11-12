export function unexpectedSuccess() {
  return expect(false).toBe(true);
}

export const FAKE_LIBRARIES = {
  angular: {
    path: 'angular.js',
    pathToMinified: 'angular.min.js',
    useNPM: true,
    url: 'https://ajax.googleapis.com/ajax/libs/angularjs/$VERSION/$FILENAME',
  },
};
