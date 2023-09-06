# ZhChess(中国象棋)

[![GitHub star](https://img.shields.io/github/stars/kongyijilafumi/zh-chess?label=GitHub%20Star)](https://github.com/kongyijilafumi/zh-chess)
[![GitHub fork](https://img.shields.io/github/forks/kongyijilafumi/zh-chess?label=GitHub%20fork)](https://github.com/kongyijilafumi/zh-chess/network/members)
[![Gitee star](https://gitee.com/kong_yiji_and_lavmi/zh-chess/badge/star.svg?theme=dark)](https://gitee.com/kong_yiji_and_lavmi/zh-chess/stargazers)
[![Gitee fork](https://gitee.com/kong_yiji_and_lavmi/zh-chess/badge/fork.svg?theme=dark)](https://gitee.com/kong_yiji_and_lavmi/zh-chess/members)

![MIT开源协议](https://img.shields.io/github/license/kongyijilafumi/zh-chess)

一款JavaScript语言编写的中国象棋游戏框架，支持nodejs，浏览器，vue，react等前端框架。(支持typescript)[更多象棋知识](https://www.xqbase.com/index.htm)

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
    ctx, // ctx 属性可传 可不传 只要 游戏不需要更新画面 光靠 游戏逻辑来运行完全可以足够
    gameWidth: CTX_WIDTH,
    gameHeight: CTX_HEIGHT
})
game.gameStart("RED") // 开始游戏
game.moveStr("炮2平5", "RED") // 移动棋子
game.draw(ctx) // 更新画布 需要传入画布
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
                duration: 200, // 默认200 ms单位 值棋子运动时长
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

#### constructor(obj: GameInfo); 

 `GameInfo Properties`

* blackPeiceBackground?: string 黑棋子背景色 默认：`#fdec9e`
* checkerboardBackground?: string 棋盘背景色  默认：`#faebd7`
* ctx?: CanvasRenderingContext2D 画布 

> 如果不需要游戏显示出来，可以不需要 `画布`

* drawMovePoint?: boolean 选中是否绘画可移动的点 默认： `true`
* duration?: number 棋子运动速度时长 毫秒单位 默认：`200`
* gameHeight?: number 游戏窗口高度大小 默认：`800`
* gamePadding?: number 游戏内边距大小距离棋盘 默认:`20`
* gameWidth?: number 游戏窗口宽度大小 默认：`800`
* movePointColor?: string 绘画可移动点的颜色 默认：`#25dd2a`
* redPeiceBackground?: string 红棋子背景色 默认：`#feeca0`
* scaleRatio?: number 画布缩放大小 默认：`1` (用于移动端，解决画布模糊问题)

#### Properties

##### duration: number

#### Accessors

棋子运动速度时长 毫秒单位

##### get currentGameSide(): null | PieceSide

获取游戏方

##### get currentLivePieceList(): PieceList

获取当前存活的棋子列表

##### get currentRadius(): number

获取当前象棋绘制半径

##### get winnerSide(): null | PieceSide

获取赢棋方

##### gameStart(side: PieceSide): void

选择玩家方并且初始化游戏，side只能是 `RED` | `BLACK` .

```js
  const game = new ZhChess({
      gameHeight: 375,
      gameWidth: 375
  })
  game.gameStart("RED")
```

#### Methods

##### changeCurrentPlaySide(side: PieceSide): void

更改当前走棋方

##### changePlaySide(side: PieceSide): void

更换玩家视角

##### checkDraw(): void

检查是否有画布 有会根据当前棋子位置状态去更新画布 否则不更新 报出错误

##### checkGameState(): MoveResult

棋子运动前检查游戏状态是否可以运动

##### draw(ctx: CanvasRenderingContext2D): void

根据当前棋子状态绘画 棋盘状态 游戏数据 画出布局

##### gameOver(): boolean

游戏是否结束

##### gameStart(side: PieceSide): void

初始化选择玩家方 初始化棋盘

##### getCurrentPenCode(side: PieceSide): string

获取当前棋盘的 `PEN` 格式位置代码

##### listenClick(e: MouseEvent): void

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

##### listenClickAsync(e: MouseEvent): void

用于dom的点击事件，此方法执行棋子运动有动画(根据 `duration` 来决定运动时长)，且为异步执行函数。

```js
    const app = document.getElementById("canvas")
    const ctx = app.getContext("2d")
    const game = new ZhChess.default({
        ctx,
        gameWidth: 375,
        gameHeight: 375,
        duration: 500 // 棋子运动时长 500ms
    })
    // 绑定点击事件
    app.addEventListener("click", game.listenClickAsync, false)
```

##### moveStr(str: string, side: PieceSide): UpdateResult

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
game.moveStr("车1进1", "RED") // 红方 车1进1 返回 { flag:true } 或者 { flag:false, message:"xxx" } 
```

 
 

#####  moveStrAsync(str: string, side: PieceSide, refreshCtx: boolean): Promise `<` UpdateResult `>`

跟moveStr方法作用一样，不过是异步的，有动画效果。 `refreshCtx` 表示 是否每次移动都更新画布。

##### on(e: GameEventName, fn: GameEventCallback):void

游戏监听事件

* e为`move`时，fn函数的参数有 `(peice: ChessOfPeice, cp: CheckPoint, enemyhasTrouble: boolean)`

* e为`moveFail`时，fn函数的参数有`(peice: ChessOfPeice, p: Point, currentSideDanger: boolean, msg: string)`

* e为`log`时，fn函数的参数有`(str: any)`

* e为`over`时，fn函数的参数有`(winnerSide: PieceSide)`

* e为`error`时，fn函数的参数有`(error: any)`

##### removeEvent(e: GameEventName, fn: GameEventCallback):void

移除游戏的监听函数

##### setLivePieceList(pl: PieceList): void

设置当前存活棋子列表

##### setPenCodeList(penCode: string): void

根据pen代码格式来设置当前棋盘

> 建议参考 文章 博客 https://www.xqbase.com/protocol/cchess_fen.htm

##### update(pos: Point, mov: null | Point, side: PieceSide, post: boolean): UpdateResult

游戏根据坐标点 移动点来进行更新游戏运行数据。 `post` ：是否由程序自己更新游戏状态。

> 返回的结果: 如果 post 为 false， 请检查返回的结果 move 是否为 true ，为true表示有返回回调函数cb，只有调用 cb() 游戏状态才会更新。如果 post 为 true，程序会自己更新游戏状态 只需要判断 是否更新成功即可！

##### updateAsync(pos: Point, mov: null | Point, side: PieceSide, refreshCtx: boolean, moveCallback?: UpdateMoveCallback): Promise `<` UpdateResult `>`

游戏根据坐标点 移动点来进行更新游戏运行数据。这是一个返回一个promise结果，也表示 这个方法是异步的。

```js
const ctx = document.getElementById("canvas").getContext("2d")
const game = new ZhChess({})
game.gameStart("RED")
game.updateAsync(pos, mov, side, true, (posPeice, newPoint) => console.log(posPeice, newPoint)) // 每次运动都去绘画一次
game.updateAsync(pos, mov, side, false, (posPeice, newPoint) => game.draw(ctx)) // 每次运动 自己去调用游戏绘画
```
