/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  directories: {
    output: 'dist/electron',
  },
  publish: null,
  npmRebuild: false,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  files: [
    'dist/main/**/*',
    'dist/preload/**/*',
    'dist/render/**/*',
    '!node_modules/**/*',
  ],
  extraResources: [],
  asar: false,
}

module.exports = config
