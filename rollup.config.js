import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import { resolve } from "path"
const outDir = resolve(".", "lib")
export default [
  {//   
    input: "./src/index.ts",
    output: {
      file: resolve(outDir, pkg.name + '.browser.js'),
      name: toHump(pkg.name),
      format: "iife",
      exports: 'named',
    },
    plugins: [
      nodeResolve(),
      typescript({ sourceMap: false }),

    ]
  },
  {
    input: "./src/index.ts",
    output: {//node  
      file: resolve(outDir, pkg.name + '.cjs.js'),
      format: "cjs",
      exports: 'named',
    },
    plugins: [
      nodeResolve(),
      typescript({ sourceMap: false }),
    ]
  },
  {// esm
    input: "./src/index.ts",
    output: {
      file: resolve(outDir, pkg.name + '.es.js'),
      format: "esm",
    },
    plugins: [
      nodeResolve(),
      typescript({ sourceMap: false }),
    ]
  },
  { // ts
    input: "./src/index.ts",
    output: {
      file: resolve(outDir, pkg.name + '.d.ts'),
      format: 'esm',
    },
    plugins: [
      dts()
    ]
  }
]




function toHump(name) {
  return name.replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}
