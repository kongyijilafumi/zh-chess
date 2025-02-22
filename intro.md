# 一款JavaScript语言编写的中国象棋游戏框架，支持浏览器和nodejs环境。

[![GitHub star](https://img.shields.io/github/stars/kongyijilafumi/zh-chess?label=GitHub%20Star)](https://github.com/kongyijilafumi/zh-chess)
[![GitHub fork](https://img.shields.io/github/forks/kongyijilafumi/zh-chess?label=GitHub%20fork)](https://github.com/kongyijilafumi/zh-chess/network/members)
[![Gitee star](https://gitee.com/kong_yiji_and_lavmi/zh-chess/badge/star.svg?theme=dark)](https://gitee.com/kong_yiji_and_lavmi/zh-chess/stargazers)
[![Gitee fork](https://gitee.com/kong_yiji_and_lavmi/zh-chess/badge/fork.svg?theme=dark)](https://gitee.com/kong_yiji_and_lavmi/zh-chess/members)
![MIT开源协议](https://img.shields.io/github/license/kongyijilafumi/zh-chess)

支持typescript[更多象棋知识](https://www.xqbase.com/index.htm)

## [案例网站](https://chess.z3web.cn/)

## 安装使用

### nodejs

1. 项目新增依赖(需要借助canvas来显示游戏图片)

```bash
D:your project>npm i zh-chess canvas -D # or cnpm i zh-chess canvas -D
```

2. 直接导入使用

```js
const {
    createCanvas
} = require('canvas')
const CTX_WIDTH = 375,
    CTX_HEIGHT = 375
const canvas = createCanvas(CTX_WIDTH, CTX_HEIGHT)
const ctx = canvas.getContext('2d')
const ZhChess = require("zh-chess").default
const fs = require('fs')
const out = fs.createWriteStream('./test.jpg') // 创建文件流

const game = new ZhChess({
    ctx,
    gameWidth: CTX_WIDTH,
    gameHeight: CTX_HEIGHT
})
game.gameStart("RED") // 开始游戏
game.moveStr("炮2平5", "RED") // 移动棋子
const stream = canvas.createJPEGStream()
stream.pipe(out) // 写入文件
out.on('finish', () => console.log('The JPEG file was created.'))
```

### 浏览器环境

1. 下载源码

```bash
git clone https://github.com/kongyijilafumi/zh-chess
# or 国内码云
git clone https://gitee.com/kong_yiji_and_lavmi/zh-chess
```

2. 在html的 `head` 部分使用 `script` 标签引入 `./lib/zh-chess.browser.min.js` 文件

```HTML
<head>
    <script script="./lib/zh-chess.browser.min.js"></script>
</head>
```

3. 引入之后的下方，新建 `script` 标签，直接调用api即可。

```html
<head>
    <script script="./lib/zh-chess.browser.min.js"></script>
</head>

<body>
    <canvas id="canvas" height="375" width="375" style="width:375px;height:375px;"></canvas>
</body>
<script>
    const app = document.getElementById("canvas")
    const ctx = app.getContext("2d")
    const zhchess = new ZhChess.default({
        ctx,
        gameWidth: 375,
        gameHeight: 375
    })
    // 绑定点击事件
    app.addEventListener("click", zhchess.listenClickAsync, false)
</script>
```

### react, vue等前端构建项目使用

* 安装依赖

```bash
your project>npm i zh-chess -D #or cnpm i zh-chess 
```

* 在`vue2.x`项目中使用

```html
<template>
    <canvas ref="canvas" height="375" width="375" style="width: 375px; height: 375px;" />
</template>
<script>
    import ZhChess from "zh-chess";
    export default {
        data() {
            return {
                game: null
            }
        },
        mounted() {
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext("2d");
            this.game = new ZhChess({
                ctx,
                gameHeight: 375,
                gameWidth: 375,
            });
            this.game.gameStart("RED"); // 以红方开始游戏
            canvas.addEventListener("click", this.game.listenClickAsync, false);
        },
    }
</script>
```

* 在`vue3.x`项目中使用

```HTML
<template>
    <canvas ref="canvas" height="375" width="375" style="width: 375px; height: 375px;" />
</template>
<script lang="ts" setup>
    import ZhChess, {
        GameOverCallback,
        MoveCallback,
        MoveFailCallback,
    } from "zh-chess";

    import {
        onMounted,
        reactive,
        ref,
        getCurrentInstance
    } from "vue";

    const page = getCurrentInstance();
    const CANVAS_WIDTH = 375;
    const CANVAS_HEIGHT = 375;

    let game = reactive({}
        as ZhChess);
    const onOver: GameOverCallback = (winnerSide) => {
        console.log(`${winnerSide}胜`);
    };
    // 挂载
    onMounted(() => {
        const canvas = page?.refs.canvas as HTMLCanvasElement;
        game = new ZhChess({
            ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
            gameHeight: CANVAS_WIDTH,
            gameWidth: CANVAS_HEIGHT,
        });
        game.gameStart("RED");
        canvas.addEventListener("click", game.listenClickAsync, false);
        game.on("over", onOver);
    });
</script>
```

* 在`react`项目中使用

```jsx
import ZhChess from "zh-chess"
import { useEffect, useRef, useState } from "react";
export default function App() {
  const [gameInstance, setGame] = useState<ZhChess | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (canvas.current) {
      const CTX_WIDTH = 375, CTX_HEIGHT = 375,ctx = canvas.current.getContext('2d') as CanvasRenderingContext2D;
      const game = new ZhChess({
      ctx,
      gameHeight: CTX_HEIGHT,
      gameWidth: CTX_WIDTH
  })
      game.gameStart("RED")
    canvas.current.addEventListener("click", game.listenClickAsync, false)
      setGame(game)
    }
  }, [canvas])
  return <div className="app">
    <canvas ref={canvas} width="375" height="375" style={{width:375,height:375}} />
  </div>
} 
```
