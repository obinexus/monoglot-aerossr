import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const isProduction = process.env.NODE_ENV === 'production';

const createBanner = (format) => `/*!
 * AeroSSR v${pkg.version}
 * (c) ${new Date().getFullYear()} Nnamdi Michael Okpala / OBINexus Computing
 * Released under the ISC License
 * Format: ${format}
 * Repository: https://github.com/obinexus/monoglot-aerossr
 * Homepage: https://obinexus.org/projects/aerossr
 */`;

// Updated alias configuration to match tsconfig paths
const aliasConfig = {
  entries: [
    { find: '@', replacement: pathResolve(__dirname, 'src') },
    { find: '@/core', replacement: pathResolve(__dirname, 'src/core') },
    { find: '@/bundler', replacement: pathResolve(__dirname, 'src/bundler') },
    { find: '@/middlewares', replacement: pathResolve(__dirname, 'src/middlewares') },
    { find: '@/constants', replacement: pathResolve(__dirname, 'src/constants') },
    { find: '@/errors', replacement: pathResolve(__dirname, 'src/errors') },
    { find: '@/templates', replacement: pathResolve(__dirname, 'src/templates') }
  ]
};

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'path',
  'fs',
  'crypto',
  'http',
  'https',
  'url',
  'stream',
  'zlib',
  'util',
  'events',
  'querystring',
  'buffer',
  'commander'
];

const basePlugins = [
  alias(aliasConfig),
  resolve({
    preferBuiltins: true,
    extensions: ['.ts', '.js', '.json']
  }),
  commonjs(),
  json(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: !isProduction,
    declaration: true,
    declarationDir: './dist/types'
  }),
  isProduction && terser({
    format: {
      comments: /^!/
    }
  })
].filter(Boolean);

// Core library builds
const mainBuilds = [
  {
    input: {
      index: 'src/index.ts',
      core: 'src/core/index.ts',
      bundler: 'src/bundler/index.ts',
      middlewares: 'src/middlewares/index.ts'
    },
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        sourcemap: !isProduction,
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named',
        banner: createBanner('esm')
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        sourcemap: !isProduction,
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named',
        banner: createBanner('cjs')
      }
    ],
    external,
    plugins: basePlugins
  }
];

// CLI build
const cliBuild = {
  input: 'src/cli/index.ts',
  output: {
    dir: 'dist/cli',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src/cli',
    exports: 'named',
    banner: '#!/usr/bin/env node\n' + createBanner('cli')
  },
  external,
  plugins: basePlugins
};

// Template builds
const templateBuilds = [
  {
    input: {
      'templates/js/index': 'src/templates/js/index.js',
      'templates/ts/index': 'src/templates/ts/index.ts'
    },
    output: {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external,
    plugins: basePlugins
  }
];

export default [
  ...mainBuilds,
  cliBuild,
  ...templateBuilds
];