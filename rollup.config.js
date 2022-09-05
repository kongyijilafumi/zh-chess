import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: "./src/index.ts",
    output: [
      { //browser  
        file: "./dist/chess.min.js",
        name: "ZhChess",
        format: "iife",
        sourcemap: false
      },
      {//node  
        file: "./dist/chess.cjs.js",
        name: "ZhChess",
        format: "cjs",
        sourcemap: false,
        exports: "default"
      }
    ],
    plugins: [
      resolve(),
      typescript(),
    ]
  },
]