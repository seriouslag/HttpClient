import typescript from 'rollup-plugin-typescript2';
import NodeBuiltins from 'rollup-plugin-node-builtins';
import NodeGlobals from 'rollup-plugin-node-globals';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const typescriptPlugin = typescript({
  tsconfig: 'tsconfig.build.json',
  verbosity: 2
});

const nodeBuiltins = NodeBuiltins();
const nodeGlobalsPlugin = NodeGlobals();
const commonjsPlugin = commonjs();
const peerDepsExternalPlugin = peerDepsExternal();

export default [
  // CJS
  {
    input:  'src/index.ts',
    output: {
      file:    'dist/index.cjs',
      format:  'cjs',
      name:    'HttpClient-axios',
      indent:   false,
    },
    plugins: [
      peerDepsExternalPlugin,
      commonjsPlugin,
      typescriptPlugin,
      nodeBuiltins,
      nodeGlobalsPlugin,
    ],
  },
  // cjs minified
  {
    input:  'src/index.ts',
    output: {
      file:    'dist/index.min.cjs',
      format:  'cjs',
      name:    'HttpClient-axios',
      indent:  false,
    },
    plugins: [
      peerDepsExternalPlugin,
      commonjsPlugin,
      typescriptPlugin,
      nodeBuiltins,
      nodeGlobalsPlugin,
      terser(),
    ],
  },
  // ESM
  {
    input:  'src/index.ts',
    output: {
      file:    'dist/index.mjs',
      format:  'esm',
      name:    'HttpClient-axios',
      indent:  false,
    },
    plugins: [
      peerDepsExternalPlugin,
      nodeBuiltins,
      nodeGlobalsPlugin,
      typescriptPlugin,
    ],
  },
];
