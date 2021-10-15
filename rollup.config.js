import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import NodeBuiltins from 'rollup-plugin-node-builtins';
import NodeGlobals from 'rollup-plugin-node-globals';
import commonjs from 'rollup-plugin-commonjs';
import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';

const typescriptPlugin = typescript({
  tsconfig: 'tsconfig.build.json',
});

const nodeBuiltins = NodeBuiltins();
const nodeGlobalsPlugin = NodeGlobals();

export default [
  // ES Modules
  {
    input:  'src/index.ts',
    output: {
      file:   'dist/index.es.js',
      format: 'es',
    },
    plugins: [
      typescriptPlugin,
      nodeBuiltins,
      nodeGlobalsPlugin,
      resolve({ jsnext: true, preferBuiltins: true, browser: true }),
      commonjs(),
    ],
  },

  // UMD
  {
    input:  'src/index.ts',
    output: {
      file:   'dist/index.umd.min.js',
      format: 'umd',
      name:   'HttpClient',
      indent: false,
    },
    plugins: [
      typescriptPlugin,
      nodeBuiltins,
      nodeGlobalsPlugin,
      nodeResolve({ jsnext: true, preferBuiltins: true, browser: true }),
      commonjs(),
      terser(),
    ],
  },
];
