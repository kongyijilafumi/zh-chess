import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: "./src/index.ts",
    output: [
      { //browser  
        file: "./dist/chess.browser.js",
        name: "ZhChess",
        format: "iife",
        sourcemap: true
      },
      {//node  
        file: "./dist/chess.cjs.js",
        name: "ZhChess",
        format: "cjs",
        sourcemap: true,
        exports: "default"
      }, {
        file: "./dist/chess.es.js",
        name: "ZhChess",
        format: "amd",
        sourcemap: true,
      }
    ],
    plugins: [
      resolve(),
      typescript(),
    ]
  },
]