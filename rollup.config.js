import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import pkg from './package.json';
import { resolve } from "path"
const outDir = resolve(".", "lib")

const libs = [
  {// 浏览器导入
    ext: ".browser.js",
    name: toHump(pkg.name),
    format: "iife",
    exports: 'named',
    plugins: [
      typescript({ sourceMap: false, target: "es5" }),
    ]
  },
  {// 浏览器压缩版
    ext: ".browser.min.js",
    name: toHump(pkg.name),
    format: "iife",
    exports: 'named',
    plugins: [
      typescript({ sourceMap: false, target: "es5" }),
      terser(),
    ]
  },
  {// nodejs
    ext: ".cjs.js",
    format: "cjs",
    exports: 'named',
    plugins: [
      typescript({ sourceMap: false, }),
    ]
  },
  {// esm
    ext: ".es.js",
    format: "esm",
    plugins: [
      typescript({ sourceMap: false, }),
    ]
  },
  {// .d.ts
    ext: ".d.ts",
    format: "esm",
    plugins: [
      dts()
    ]
  }
]

export default libs.map(item => {
  return {
    input: "./src/index.ts",
    output: {
      format: item.format,
      name: item.name,
      exports: item.exports,
      file: resolve(outDir, pkg.name + item.ext)
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      ...item.plugins
    ],
  }
})



function toHump(name) {
  return name.replace(/^(\w)/, function (a, w) {
    return w.toUpperCase()
  }).replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}
