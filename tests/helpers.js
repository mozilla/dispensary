export function unexpectedSuccess() {
  return assert.fail(null, null, 'Unexpected success');
}

export const FAKE_LIBRARIES = {
  angular: {
    excludeVersions: [],
    maxVerion: null,
    minVersion: '1.0.1',
    path: 'angular.js',
    pathToMinified: 'angular.min.js',
    source: 'npm',
    url: 'https://ajax.googleapis.com/ajax/libs/angularjs/$VERSION/$FILENAME',
  },
};
