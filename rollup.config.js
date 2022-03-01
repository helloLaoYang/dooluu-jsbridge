// import { uglify } from 'rollup-plugin-uglify'
// import typescript from '@rollup/plugin-typescript'
// import resolve from '@rollup/plugin-node-resolve'
// import common from '@rollup/plugin-commonjs'
// import babel from '@rollup/plugin-babel'
const { uglify } = require('rollup-plugin-uglify')
const typescript = require('@rollup/plugin-typescript')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const common = require('@rollup/plugin-commonjs')
const { babel } = require('@rollup/plugin-babel')

const uglifyJs = function (options = {}) {
  return uglify(options)
}

const input = 'src/index.ts'
const output = {
  file: '.githubrepo/jsbridge.min.js',
  format: 'esm',
  sourcemap: true
}

const plugins = [
  typescript(),
  // tells Rollup how to find date-fns in node_modules
  nodeResolve(),
  // converts date-fns to ES modules
  common(),
  // minify, but only in production
  uglifyJs(),
  // use babel
  babel({
    babelHelpers: 'bundled'
  })
]

module.exports = {
  inputOptions: {
    input,
    plugins,
  },
  outputOptions: output,
}

// module.exports = {
//   input,
//   output,
//   plugins,
// }
  