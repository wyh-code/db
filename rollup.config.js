const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
// const { terser } = require('rollup-plugin-terser')
const clear = require('rollup-plugin-clear');
const { babel } = require('@rollup/plugin-babel');

export default {
  input: './src/index.ts',
  output: [
    {
      dir: 'lib',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
      sourcemap: true, // 是否输出sourcemap
    },
    {
      dir: 'lib',
      format: 'esm',
      entryFileNames: '[name].esm.js',
      sourcemap: true, // 是否输出sourcemap
    },
  ],
  plugins: [
    babel({
      "presets": ['@babel/preset-env'],
    }),
    resolve(),
    commonjs(),
    clear({
      targets: ['./lib'],
    }),
    typescript({ module: 'ESNext' }),
  ],
};