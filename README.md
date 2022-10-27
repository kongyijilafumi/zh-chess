# ZhChess(中国象棋)

[![GitHub star](https://img.shields.io/github/stars/kongyijilafumi/zh-chess?label=GitHub%20Star)](https://github.com/kongyijilafumi/zh-chess)
[![GitHub fork](https://img.shields.io/github/forks/kongyijilafumi/zh-chess?label=GitHub%20fork)](https://github.com/kongyijilafumi/zh-chess/network/members)
[![Gitee star](https://gitee.com/kong_yiji_and_lavmi/zh-chess/badge/star.svg?theme=dark)](https://gitee.com/kong_yiji_and_lavmi/zh-chess/stargazers)
[![Gitee fork](https://gitee.com/kong_yiji_and_lavmi/zh-chess/badge/fork.svg?theme=dark)](https://gitee.com/kong_yiji_and_lavmi/zh-chess/members)
![MIT开源协议](https://img.shields.io/github/license/kongyijilafumi/zh-chess)

一款JavaScript语言编写的中国象棋游戏框架，支持nodejs，浏览器，vue，react等前端框架。(支持typescript)[更多象棋知识](https://www.xqbase.com/index.htm)


## [案例网站](https://chess.azhengpersonalblog.top/)

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
                moveSpeed: 12,
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

## 接口

[GitHub文档地址](https://kongyijilafumi.github.io/zh-chess/) | [Gitee文档地址](https://kong_yiji_and_lavmi.gitee.io/zh-chess/)

### ZhChess 游戏类

#### constructor({ ctx, gameWidth, gameHeight, gamePadding, scaleRatio, moveSpeed }); 

* ctx：画布
* gameWidth：`number` 游戏窗口宽度 `默认：800`
* gameHeight：`number` 游戏窗口高度 `默认：800`
* gamePadding：`number` 棋盘的内边距 `默认：20`
* scaleRatio：`number` 画布缩放比例 `默认：1`(用于移动端，解决画布模糊问题)
* moveSpeed：`number` 移动速度 `默认8` (越大越慢，>=1)

#### moveSpeed: number

运行速度 大于或等于 1 的数 越大越慢

#### gameStart(side: PieceSide): void

选择玩家方并且初始化游戏，side只能是 `RED` | `BLACK` .

```js
  const game = new ZhChess({
      ctx,
      gameHeight: 375,
      gameWidth: 375
  })
  game.gameStart("RED")
```

#### listenClick(e: MouseEvent): void

用于dom的点击事件，此方法棋子运动无动画，且为同步执行函数。

```js
    const app = document.getElementById("canvas")
    const ctx = app.getContext("2d")
    const game = new ZhChess.default({
        ctx,
        gameWidth: 375,
        gameHeight: 375
    })
    // 绑定点击事件
    app.addEventListener("click", game.listenClick, false)
```

#### listenClickAsync(e: MouseEvent): void

用于dom的点击事件，此方法执行棋子运动有动画(根据 `moveSpeed` 大小来决定运动时长)，且为异步执行函数。

```js
    const app = document.getElementById("canvas")
    const ctx = app.getContext("2d")
    const game = new ZhChess.default({
        ctx,
        gameWidth: 375,
        gameHeight: 375
    })
    // 绑定点击事件
    app.addEventListener("click", game.listenClickAsync, false)
```

#### changePlaySide(side: PieceSide): void

更换玩家视角

```js
  game.gameStart("RED") // 红方视角 红在下 黑在上
  game.gameStart("BLACK") // 黑方视角 黑在下 红在上
```

#### checkGameState(): boolean

棋子运动前检查游戏状态是否可以运动

#### gameOver(): boolean

游戏是否结束

#### move(piecePoint: Point, movePoint: Point, side: PieceSide): MoveResult

根据 `红方在下黑方在上的` 视角(也是棋子游戏里的固定坐标`不分红黑方视角`) 来指定坐标点移动到指定的坐标点，无移动动画，返回移动结果，同步方法。

```bash
  0  1  2  3  4  5  6  7  8         0 1  2  3  4  5  6  7  8
0 車 馬 象 仕  將 仕 象 馬 車       0 　馬 象 仕  將 仕 象 馬 車 
1                                 1
2    砲                砲         2 車 砲                砲
3 卒    卒    卒    卒    卒       3 卒    卒    卒    卒    卒  
4                            -->  4
5                            -->  5
6 兵    兵    兵    兵    兵  -->  6 兵    兵    兵    兵    兵
7    炮                炮         7    炮                炮
8                                 8
9 车 马 相 士 帅  士 相 马 车       9 车 马 相 士 帅  士 相 马 车
  1  2  3  4  5  6  7  8  9         1  2  3  4  5  6  7  8  9 
```

> 以 `红方在下黑方在上的`视角移动棋子最左上为x，y轴的起始位置，往下y变大，往右x变大。如图所示，坐标点为(0, 0)移动到了(0, 2)位置，表示`黑`方`車`向前进`两个格子`代码如下所示。

```js
const piecePoint = {
        x: 0,
        y: 0
    },
    movePoint = {
        x: 0,
        y: 2
    }
game.move(piecePoint, movePoint, "BLACK") // 返回 { flag:true } 或者 { flag:false, message:"xxx" }
```

#### moveAsync(piecePoint: Point, movePoint: Point, side: PieceSide): Promise `<MoveResult>`

跟move方法作用一样，不过是异步的，有动画效果。

####  moveStr(str: string, side: PieceSide): MoveResult

通过文字的形式根据 `红黑方视角` 来移动象棋。无移动动画，同步方法，返回移动结果。

```
10    
9     
8     
7   
6  
5 
4 兵    兵    兵    兵    兵
3    炮                炮
2                    
1 车 马 相 士 帅  士 相 马 车
  1  2  3  4  5  6  7  8  9 
```

> 已红方或黑方自己视角，靠近对方底线为进，靠近己方底线为退，横着走为平。例如：车1进1是指自己左边的车往前走一步。

```js
game.move("车1进1", "RED") // 红方 车1进1 返回 { flag:true } 或者 { flag:false, message:"xxx" } 
```

####  moveStrAsync(str: string, side: PieceSide): Promise `<MoveResult>`

跟moveStr方法作用一样，不过是异步的，有动画效果。

#### on(e: GameEventName, fn: GameEventCallback):void

游戏监听事件

* e为`move`时，fn函数的参数有 `(peice: ChessOfPeice, cp: CheckPoint, enemyhasTrouble: boolean)`

* e为`moveFail`时，fn函数的参数有`(peice: ChessOfPeice, p: Point, currentSideDanger: boolean, msg: string)`

* e为`log`时，fn函数的参数有`(str: any)`

* e为`over`时，fn函数的参数有`(winnerSide: PieceSide)`

#### removeEvent(e: GameEventName, fn: GameEventCallback):void

移除游戏的监听函数
