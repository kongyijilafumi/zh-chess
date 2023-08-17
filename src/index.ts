import type { GameState, PieceSide, GameEventName, MoveCallback, MoveFailCallback, GameLogCallback, GameOverCallback, GameEventCallback, CheckPoint, GamePeiceGridDiffX, GamePeiceGridDiffY, UpdateResult, UpdateMoveCallback, GameErrorCallback } from './types';
import { Point, PieceInfo, MoveResult } from './types';
import { gen_PEN_Str, initBoardPen, parseStrToPoint, parse_PEN_Str } from '../utils';
import { getSquarePoints } from '../utils/draw';
import { ChessOfPeice, GeneralPiece, PieceList, chessOfPeiceMap } from './piece';
import "core-js/proposals/global-this"
const findPiece = (pl: PieceList, p: Point) => pl.find(item => item.x === p.x && item.y === p.y)

type CTX = CanvasRenderingContext2D

/**
 * promise返回的运动结果
 */
export type MoveResultAsync = Promise<MoveResult>

/**
 * 初始化游戏参数
 */
export interface GameInfo {
  /**
   * 游戏窗口宽度大小
   * @defaultValue `800`
   */
  gameWidth?: number
  /**
   * 游戏窗口高度大小
   * @defaultValue `800`
   */
  gameHeight?: number
  /**
   * 游戏内边距大小距离棋盘
   * @defaultValue `20`
   */
  gamePadding?: number
  /**
   * 画布
   */
  ctx?: CTX
  /**
   * 画布缩放大小
   * @defaultValue `1`
   */
  scaleRatio?: number
  /**
   * 棋子运动速度时长 毫秒单位
   * @defaultValue `200`
   */
  duration?: number
  /**
   * 棋盘背景色
   * @defaultValue `#faebd7`
   */
  checkerboardBackground?: string
  /**
   * 红棋子背景色
   * @defaultValue `#feeca0`
   */
  redPeiceBackground?: string
  /**
   * 黑棋子背景色
   * @defaultValue `#fdec9e`
   */
  blackPeiceBackground?: string
  /**
   * 可移动点 颜色
   * @defaultValue `#25dd2a`
   */
  movePointColor?: string
  /**
   * 选中是否绘画可移动的点
   * @defaultValue `false`
   */
  drawMovePoint?: boolean
}

export default class ZhChess {
  /**
   * 当前走棋方
   */
  private currentSide!: PieceSide
  /**
   * 当前棋盘上存活的棋子
   */
  private livePieceList!: PieceList
  /**
   * 当前选中的棋子
   */
  private choosePiece!: ChessOfPeice | null
  /**
   * 棋盘绘制起始 x 值
   */
  private startX!: number;
  /**
   * 棋盘绘制末尾 x 值
   */
  private endX!: number;
  /**
   * 棋盘绘制起始 y 值
   */
  private startY!: number;
  /**
   * 棋盘绘制末尾 y 值
   */
  private endY!: number;
  /**
   * 象棋格子宽度
   */
  private gridWidth!: number;
  /**
   * 象棋格子高度
   */
  private gridHeight!: number;
  /**
   * 象棋半径
   */
  private radius!: number;
  /**
   * 游戏窗口高度
   */
  private width!: number;
  /**
   * 游戏窗口高度
   */
  private height!: number;
  /**
   * 背景 和 线条 二维操作上下文
   */
  private ctx?: CTX
  /**
   * 存放棋盘格子的所有坐标
   */
  private gridPostionList: Array<Point>
  /**
   * 棋子运动速度时长 毫秒单位
   */
  duration: number

  private drawMovePoint: boolean
  /**
   * 玩家 x轴 格子距离相差
   */
  private gridDiffX!: GamePeiceGridDiffX
  /**
   * 玩家 y轴 格子距离相差
   */
  private gridDiffY!: GamePeiceGridDiffY
  /**
   * 游戏进行状态
   */
  private gameState!: GameState
  /**
   * 游戏移动监听事件列表
   */
  private moveEvents: Array<MoveCallback>
  /**
   * 游戏移动失败监听事件列表
   */
  private moveFailEvents: Array<MoveFailCallback>
  /**
   * 游戏日志监听事件列表
   */
  private logEvents: Array<GameLogCallback>
  /**
   * 游戏结束监听事件列表
   */
  private overEvents: Array<GameOverCallback>
  /**
   * 游戏运行报错事件列表
   */
  private errorEvents: Array<GameErrorCallback>
  /**
   * 红色棋子背景颜色
   */
  private redPeiceBackground: string;
  /**
   * 黑色棋子背景颜色
   */
  private blackPeiceBackground: string;
  /**
   * 棋盘背景颜色
   */
  private checkerboardBackground: string;
  /**
   * 赢方
   */
  private winner: PieceSide | null = null;
  /**
   * 当前游戏方
   */
  private gameSide: PieceSide | null = null;

  /**
   * 动画方法
   */
  private animate: (cb: FrameRequestCallback) => number;

  /**
   * 清除动画方法
   */
  private cancelAnimate: (hander: number) => void;
  /**
   * 画布缩放大小
   * @defaultValue `1`
   */
  private scaleRatio: number;

  private movePointColor: string;

  /**
   * 上次移动点：棋盘上移动棋子移动前的位置坐标点
   */
  private lastMovePoint: Point | undefined;

  /**
   * 上次移动象棋：棋盘上的上一次移动棋子
   */
  private lastMovePiece: ChessOfPeice | undefined;

  constructor({
    ctx,
    gameWidth = 800,
    gameHeight = 800,
    gamePadding = 20,
    scaleRatio = 1,
    duration = 200,
    redPeiceBackground = "#feeca0",
    blackPeiceBackground = "#fdec9e",
    checkerboardBackground = "#faebd7",
    movePointColor = "#25dd2a",
    drawMovePoint = true
  }: GameInfo) {
    this.moveEvents = []
    this.moveFailEvents = []
    this.logEvents = []
    this.overEvents = []
    this.errorEvents = []
    this.ctx = ctx
    this.redPeiceBackground = redPeiceBackground
    this.blackPeiceBackground = blackPeiceBackground
    this.checkerboardBackground = checkerboardBackground
    this.movePointColor = movePointColor
    // 设置 缩放 来解决移动端模糊问题
    this.ctx?.scale(scaleRatio, scaleRatio)
    this.scaleRatio = scaleRatio
    this.listenClick = this.listenClick.bind(this)
    this.listenClickAsync = this.listenClickAsync.bind(this)
    this.checkDraw = this.checkDraw.bind(this)
    this.gridPostionList = []
    this.drawMovePoint = drawMovePoint
    this.setGridList()
    this.gameState = "INIT"
    this.duration = duration
    this.setGameWindow(gameWidth, gameHeight, gamePadding)
    this.init()
    {
      this.animate = globalThis.requestAnimationFrame ||
        //@ts-ignore 
        globalThis.webkitRequestAnimationFrame ||
        //@ts-ignore 
        globalThis.mozRequestAnimationFrame ||
        //@ts-ignore 
        globalThis.oRequestAnimationFrame ||
        //@ts-ignore 
        globalThis.msRequestAnimationFrame ||
        function (callback) {
          return globalThis.setTimeout(callback, 1000 / 60);
        };
    }
    {
      this.cancelAnimate = globalThis.cancelAnimationFrame ||
        //@ts-ignore
        globalThis.webkitCancelAnimationFrame ||
        //@ts-ignore 
        globalThis.mozCancelAnimationFrame ||
        //@ts-ignore 
        globalThis.oCancelAnimationFrame ||
        //@ts-ignore 
        globalThis.msCancelAnimationFrame ||
        globalThis.clearTimeout
    }
  }

  /**
   * 设置游戏窗口 棋盘 棋子大小
   */
  private setGameWindow(w: number, h: number, p: number) {
    const playHeight = h - p * 2;
    let playWidth = playHeight;
    while (playWidth % 9 !== 0) {
      playWidth++;
    }
    this.gridWidth = playWidth / 9;
    this.gridHeight = playHeight / 10;
    this.startX = (w - playWidth + this.gridWidth) / 2;
    this.startY = (h - playHeight + this.gridHeight) / 2;
    this.endX = this.startX + this.gridWidth * 8;
    this.endY = this.startY + this.gridHeight * 9;
    this.radius = this.gridHeight * 0.4;
    this.width = w
    this.height = h
  }
  /**
   * 根据玩家返回绘画坐标轴的差值
   * @param side 玩家
   * @param key 坐标轴
   * @returns 
   */
  private getGridDiff(side: PieceSide, key: "x" | "y"): GamePeiceGridDiffX | GamePeiceGridDiffY {
    if (side === "BLACK") {
      if (key === "x") {
        return 8
      }
      return 9
    }
    return 0
  }
  /**
   * 根据玩家方 设置 x，y轴差值
   * @param side 玩家方
   */
  private setGridDiff(side: PieceSide) {
    this.gridDiffX = this.getGridDiff(side, "x") as GamePeiceGridDiffX
    this.gridDiffY = this.getGridDiff(side, "y") as GamePeiceGridDiffY
  }

  /**
   * 获取所有格子的坐标
   */
  private setGridList() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 10; j++) {
        this.gridPostionList.push(new Point(i, j))
      }
    }
  }

  /**
   * 根据点击点返回所在棋盘上x,y的位置
   * @param p 点击点的 x,y 坐标
   * @returns 返回棋盘的x，y坐标轴
   */
  private getGridPosition(p: Point) {
    return this.gridPostionList.find(item => {
      const x1 = Math.abs(item.x - this.gridDiffX) * this.gridWidth + this.startX
      const y1 = Math.abs(item.y - this.gridDiffY) * this.gridHeight + this.startY
      return Math.sqrt(Math.pow((x1 - p.x), 2) + Math.pow((y1 - p.y), 2)) < this.radius
    })
  }

  /**
   * 初始化象棋盘
   */
  private init() {
    this.currentSide = "RED"
    this.choosePiece = null
    this.livePieceList = []

  }
  /**
   * 初始化象棋个数
   */
  private initPiece() {
    this.setPenCodeList(initBoardPen)
    this.choosePiece = null
    this.checkDraw()
  }
  /**
   * 游戏根据坐标点 移动点来进行更新游戏运行数据。这是一个返回一个promise结果，也表示 这个方法是异步的。
   * @param pos 坐标点
   * @param mov 移动点
   * @param side 当前下棋玩家
   * @param refreshCtx 是否每次运动后更新画布
   * @param moveCallback 每次棋子数据更新后调用
   * 
   * @example 
   * const game = new ZhChess({...any})
   * game.updateAsync(pos , mov, side, ()=> game.draw(ctx)) // 每次运动都去绘画一次
   * 
   */
  updateAsync(pos: Point, mov: Point | null, side: PieceSide, refreshCtx: boolean, moveCallback?: UpdateMoveCallback): Promise<UpdateResult> {
    const updateRes = this.update(pos, mov, side, false)
    this.gameState = "MOVE"
    if (!updateRes.flag || !mov || (updateRes.flag && !updateRes.move)) {
      this.gameState = "START"
      return Promise.resolve(updateRes)
    }
    let diffx = (pos.x - mov.x), diffy = (pos.y - mov.y), posX = pos.x, posY = pos.y;
    const xstep = diffx / (this.duration / 16)
    const ystep = diffy / (this.duration / 16)
    // this.clearMoveChoosePeiece()
    let raf: number, posPeice: ChessOfPeice | undefined
    return new Promise((resovle) => {
      const animateFn = () => {
        if (Math.abs(posX - mov.x) <= Math.abs(xstep) && Math.abs(posY - mov.y) <= Math.abs(ystep)) {
          this.cancelAnimate.call(globalThis, raf)
          if (posPeice) {
            posPeice.update(pos)
          }
          return resovle(null)
        }
        const point = new Point(posX, posY)
        posPeice = findPiece(this.livePieceList, point)
        posX -= xstep
        posY -= ystep
        const newPoint = new Point(posX, posY)
        if (posPeice) {
          posPeice.isChoose = false
          posPeice.update(newPoint)
          if (refreshCtx) {
            this.checkDraw()
          }
          if (typeof moveCallback === "function") {
            moveCallback(posPeice, newPoint)
          }
        }
        raf = this.animate.call(globalThis, animateFn)
      }
      animateFn()
    }).catch((err) => {
      this.errorEvents.forEach(f => f(err))
      return null
    }).then(() => {
      if (updateRes.flag && updateRes.cb) {
        updateRes.cb()
        if (refreshCtx) {
          this.checkDraw()
        }
        return { flag: true, move: true }
      }
      return updateRes
    })
  }
  /**
   * 游戏根据坐标点 移动点来进行更新游戏运行数据。
   * @param pos 坐标点
   * @param mov 移动点
   * @param side 当前下棋玩家
   * @param post 是否由程序自己更新游戏状态
   * @returns
   * 
   * 如果 `post` 为 `false`， 请检查返回的结果 `move` 是否为 `true` ，为`true`表示有返回回调函数`cb`，只有调用 `cb()` 游戏状态才会更新
   * 
   * 如果 `post` 为 `true`，程序会自己更新游戏状态 只需要判断 是否更新成功即可！
   */
  update(pos: Point, mov: Point | null, side: PieceSide, post: boolean): UpdateResult {
    const checkData = this.checkGameState()
    if (!checkData.flag) {
      return checkData
    }
    if (this.currentSide !== side) {
      return { flag: false, message: "请等待对方下棋" }
    }
    const posPeice = findPiece(this.livePieceList, pos)
    if (!posPeice) {
      return { flag: false, message: "未找到棋子" }
    }
    // 点击到了敌方的棋子
    if (this.currentSide !== posPeice.side) {
      return { flag: false, message: "选中了敌方的棋子" }
    }
    this.clearMoveChoosePeiece()
    posPeice.isChoose = true
    this.setLastMovePeiceStatus(false)
    this.choosePiece = posPeice
    // 如果没有需要移动的话 就直接 渲染返回
    if (!mov) {
      this.logEvents.forEach(f => f(side + "方： 选中 " + posPeice))
      return { flag: true, move: false }
    }
    const movPeice = findPiece(this.livePieceList, mov)
    const moveFlag = this.choosePiece.move(mov, this.livePieceList)
    const moveCheck: (cp: CheckPoint) => UpdateResult = (cp: CheckPoint) => {
      const isMove = "move" in cp
      const hasTrouble = this.checkGeneralInTrouble(side, posPeice, cp, this.livePieceList)
      if (hasTrouble) {
        return { flag: false, message: "不可以送将！" }
      }
      const enemySide: PieceSide = side === "RED" ? "BLACK" : "RED"
      let isOver = false
      const enemyhasTrouble = this.checkGeneralInTrouble(enemySide, posPeice, cp, this.livePieceList)
      const movedPeiceList = isMove ? this.livePieceList.filter(i => !(i.x === posPeice.x && i.y === posPeice.y)) :
        this.livePieceList.filter(i => !((i.x === posPeice.x && i.y === posPeice.y) || (i.x === cp.eat.x && i.y === cp.eat.y)))
      const newMp = chessOfPeiceMap[posPeice.name]({ ...posPeice, ...mov })
      movedPeiceList.push(newMp)
      if (enemyhasTrouble) {
        const hasSolution = this.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList)
        if (!hasSolution) {
          isOver = true
          this.winner = side
        }
      } else {
        const hasMovePoints = this.checkEnemySideHasMovePoints(enemySide, movedPeiceList)
        if (!hasMovePoints) {
          isOver = true
          this.winner = side
        }
      }
      let cb = () => {
        const newPeice = chessOfPeiceMap[posPeice.name]({ ...posPeice, ...pos })
        if (!isMove) {
          this.livePieceList = this.livePieceList.filter(p => (!(p.x === cp.eat.x && p.y === cp.eat.y)))
        }
        this.setLastMovePeiceStatus(false)
        posPeice.update(mov)
        this.lastMovePiece = posPeice
        this.setLastMovePeiceStatus(true)
        this.lastMovePoint = new Point(pos.x, pos.y)
        this.gameState = "START"
        if (isOver) {
          this.gameState = "OVER"
        }
        this.moveEvents.forEach(f => f(newPeice, cp, isOver || enemyhasTrouble, this.getCurrentPenCode(enemySide)))
        if (isOver) {
          this.overEvents.forEach(f => f(side))
        }
        this.clearMoveChoosePeiece()
        this.changeSide()
      }
      if (post) {
        cb()
        return { flag: true, move: true }
      }
      return { flag: true, cb, move: true }
    }
    // 选中之后的点击
    if (!movPeice) {// 没有选中棋子 说明 已选中的棋子要移动过去
      if (moveFlag.flag) {
        const cp = { move: mov }
        return moveCheck(cp)
      }
      return moveFlag
    }

    // 如果点击的棋子是己方
    if (movPeice.side === side) {
      if (pos.x === mov.x && pos.y === mov.y) {// 如果是点击选中的棋子 取消选中
        this.clearMoveChoosePeiece()
        this.setLastMovePeiceStatus(true)
        this.logEvents.forEach(f => f(side + "方： 取消选中 " + movPeice))
        return { flag: true, move: false }
      }

      {// 切换选中棋子
        this.choosePiece.isChoose = false
        this.choosePiece = movPeice
        this.choosePiece.isChoose = true
        this.logEvents.forEach(f => f(`${this.currentSide}方：切换 选中棋子 由${this.choosePiece} --> ${movPeice}`))
        return { flag: true, move: false }
      }

    }

    // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
    this.logEvents.forEach(f => f(`当前：${this.currentSide} ,棋子:${this.choosePiece} 需要移动到：${mov} 这个点上，并且要吃掉 ${movPeice}`))
    if (!moveFlag.flag) {
      return moveFlag
    } else {
      const cp = { eat: mov }
      return moveCheck(cp)
    }
  }
  /**
   * 根据当前棋子状态绘画 棋盘状态 游戏数据 画出布局
   * @param ctx 画布
   */
  draw(ctx: CTX) {
    ctx.clearRect(0, 0, this.width, this.height)
    this.drawChessLine(ctx)
    const { startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, movePointColor } = this
    this.livePieceList.forEach(item => {
      const textColor = item.side === "BLACK" ? "#000" : "#c1190c",
        bgColor = item.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
      if (this.choosePiece === item || this.lastMovePiece === item) {
        return true
      }
      item.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor)
    })

    if (this.lastMovePiece) {
      const textColor = this.lastMovePiece.side === "BLACK" ? "#000" : "#c1190c",
        bgColor = this.lastMovePiece.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
      this.lastMovePiece.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor)
    }

    if (this.choosePiece) {
      const textColor = this.choosePiece.side === "BLACK" ? "#000" : "#c1190c",
        bgColor = this.choosePiece.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
      this.choosePiece.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor)
      if (this.drawMovePoint && this.gameState !== "MOVE") {
        this.choosePiece.drawMovePoints(ctx, this.livePieceList, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, movePointColor)
      }
    }
  }

  /**
   * 画棋盘
   */
  private drawChessLine(ctx: CTX) {
    const { startX, startY, endX, endY, gridWidth, gridHeight, scaleRatio } = this
    // 画背景
    ctx.fillStyle = this.checkerboardBackground;
    ctx.fillRect(0, 0, this.width, this.width);
    ctx.strokeStyle = "#000";
    // 横线
    for (let index = 0; index < 10; index++) {
      ctx.beginPath();
      const y = startY + gridHeight * index;
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.closePath();
      ctx.stroke();
    }
    // 竖线
    for (let index = 0; index < 9; index++) {
      const x = startX + index * gridWidth;
      const midY = startY + gridHeight * 4;
      const by = startY + gridHeight * 9;
      if (index === 0 || index === 8) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, by);
        ctx.closePath();
        ctx.stroke();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, midY);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, midY + gridHeight);
      ctx.lineTo(x, endY);
      ctx.closePath();
      ctx.stroke();
    }
    // 士的两把叉
    for (let index = 0; index < 2; index++) {
      const x = startX + gridWidth * 3;
      const points = getSquarePoints(
        { x, y: startY + gridHeight * 7 * index },
        gridWidth * 2,
        gridHeight * 2
      );
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[2].x, points[2].y);
      ctx.moveTo(points[1].x, points[1].y);
      ctx.lineTo(points[3].x, points[3].y);
      ctx.closePath();
      ctx.stroke();
    }
    // 炮位 兵位 坐标的 ∟符号
    for (let i = 0; i < 9; i += 2) {
      const width = gridWidth * .15
      const padding = gridWidth * .1
      for (let j = 0; j < 2; j++) {
        let addx = j === 0 ? - padding : +padding
        let addy = j === 0 ? + padding : - padding
        let addw = j === 0 ? + width : - width
        for (let z = 0; z < 2; z++) {
          // 红 黑
          let y = z % 2 === 0 ? startY + 3 * gridHeight : startY + 6 * gridHeight
          // 左右两边
          for (let w = 0; w < 2; w++) {
            let x = w % 2 === 0 ? startX + i * gridWidth + addx : startX + i * gridWidth - addx
            let aw = w % 2 === 0 ? - addw : +addw
            if (x - startX > 0 && x - (startX + 8 * gridWidth) < 0) {
              ctx.beginPath();
              ctx.moveTo(x, y + addy);
              ctx.lineTo(x + aw, y + addy);
              ctx.moveTo(x, y + addy);
              ctx.lineTo(x, y + addy + addw);
              ctx.stroke();
            }
          }
        }
      }
      if (i - 1 === 1 || i - 1 === 7) {
        for (let j = 0; j < 2; j++) {
          let addx = j === 0 ? - padding : +padding
          let addy = j === 0 ? + padding : - padding
          let addw = j === 0 ? + width : - width
          let x1 = startX + (i - 1) * gridWidth
          for (let z = 0; z < 2; z++) {
            let y = (z % 2 === 0 ? startY + 2 * gridHeight : startY + 7 * gridHeight) + addy
            for (let w = 0; w < 2; w++) {
              let x = w % 2 === 0 ? x1 + addx : x1 - addx
              let aw = w % 2 === 0 ? -addw : +addw
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + aw, y);
              ctx.moveTo(x, y);
              ctx.lineTo(x, y + addw);
              ctx.stroke();
            }
          }

        }
      }
    }
    //  楚河 汉界
    ctx.textBaseline = "middle"
    ctx.textAlign = "left"
    ctx.fillStyle = "#000"
    const fontSize = gridHeight * .7
    ctx.font = fontSize + 'px serif'
    ctx.fillText("楚河", startX + gridWidth, startY + gridHeight * 4.5)

    ctx.textAlign = "right"
    ctx.translate(startX + gridWidth * 7 - fontSize * 2, startY + gridHeight * 4.5)
    ctx.rotate(Math.PI);
    ctx.fillText("汉界", 0, 0)
    ctx.setTransform(scaleRatio, 0, 0, scaleRatio, 0, 0);
  }
  /**
   * 根据移动方的描述文字来进行移动棋子
   * @param str 文字
   * @param side 移动方
   * @returns 移动结果
   */
  moveStr(str: string, side: PieceSide): UpdateResult {
    if (!this.checkGameState()) {
      return { flag: false, message: "当前游戏状态不可以移动棋子" }
    }
    this.logEvents.forEach(f => f(`当前 ${side} 输出：${str}`))
    if (this.currentSide !== side) {
      this.logEvents.forEach(f => f(`当前为${this.currentSide}方下棋，请等待！`))
      return { flag: false, message: `当前为${this.currentSide}方下棋，请等待！` }
    }
    const res = parseStrToPoint(str, this.currentSide, this.livePieceList)
    if (!res) {
      this.logEvents.forEach(f => f("未找到棋子"))
      return { flag: false, message: `未找到棋子` }
    }
    if (this.choosePiece) {
      this.clearMoveChoosePeiece()
    }
    const posPeice = findPiece(this.livePieceList, res.mp)
    if (posPeice && posPeice.side === this.currentSide) {
      this.logEvents.forEach(f => f("移动的位置有己方棋子"))
      return { flag: false, message: "移动的位置有己方棋子" }
    }
    this.choosePiece = res.choose
    this.choosePiece.isChoose = true
    return this.update(res.choose, res.mp, side, true)
  }
  /**
   * 根据移动方的描述文字来进行移动棋子
   * @param str 文字
   * @param side 移动方
   * @param refreshCtx 是否每次移动都更新画布
   * @returns 移动结果
   */
  moveStrAsync(str: string, side: PieceSide, refreshCtx: boolean): Promise<UpdateResult> {
    if (!this.checkGameState()) {
      return Promise.resolve({ flag: false, message: "当前游戏状态不可以移动棋子" })
    }
    this.logEvents.forEach(f => f(`当前 ${side} 输出：${str}`))
    if (this.currentSide !== side) {
      this.logEvents.forEach(f => f(`当前为${this.currentSide}方下棋，请等待！`))
      return Promise.resolve({ flag: false, message: `当前为${this.currentSide}方下棋，请等待！` })
    }
    const res = parseStrToPoint(str, this.currentSide, this.livePieceList)
    if (!res) {
      this.logEvents.forEach(f => f("未找到棋子"))
      return Promise.resolve({ flag: false, message: `未找到棋子` })
    }
    if (this.choosePiece) {
      this.clearMoveChoosePeiece()
    }
    this.choosePiece = res.choose
    this.choosePiece.isChoose = true
    return this.updateAsync(res.choose.getPoint(), res.mp, side, refreshCtx)
  }
  /**
   * 初始化选择玩家方
   * @param side 玩家方
   */
  gameStart(side: PieceSide) {
    this.init()
    this.setGridDiff(side)
    this.gameState = "START"
    this.winner = null
    this.initPiece()
    this.gameSide = side
    this.lastMovePoint = undefined
  }
  /**
  * 清除移动完选中的棋子
  */
  private clearMoveChoosePeiece() {
    if (this.choosePiece) {
      this.choosePiece.isChoose = false
      this.choosePiece = null
    }
  }

  /**
   * 更换当前运行玩家
   */
  private changeSide() {
    this.currentSide = this.currentSide === "RED" ? "BLACK" : "RED"
  }
  /**
   * 更换玩家视角
   * @param side 玩家
   */
  changePlaySide(side: PieceSide) {
    this.setGridDiff(side)
    this.clearMoveChoosePeiece()
    this.checkDraw()
  }
  /**
   * 更改当前走棋方
   * @param side 走棋方
   */
  changeCurrentPlaySide(side: PieceSide) {
    this.currentSide = side
  }
  /**
   * 游戏是否结束
   */
  gameOver() {
    return this.gameState === "OVER"
  }
  /**
   * 根据某方移动棋子判断自己将领是否安全
   * @param side 移动方
   * @param pos 移动棋子
   * @param cp 是去吃棋子还是移动棋子
   * @param pl 当前棋盘列表
   * @returns 是否安全
   */
  private checkGeneralInTrouble(side: PieceSide, pos: ChessOfPeice, cp: CheckPoint, pl: PieceList) {
    const enemySide: PieceSide = side === "BLACK" ? "RED" : "BLACK"
    let list: PieceList;
    if ("move" in cp) {
      const pieceInfo = { ...pos, ...cp.move } as PieceInfo
      const piece = chessOfPeiceMap[pieceInfo.name](pieceInfo)
      list = pl.filter(i => !(i.x === pos.x && i.y === pos.y))
      list.push(piece)
    } else {
      const pieceInfo = { ...pos, ...cp.eat } as PieceInfo
      const piece = chessOfPeiceMap[pieceInfo.name](pieceInfo)
      list = pl.filter(i => !(i.x === cp.eat.x && i.y === cp.eat.y) && !(i.x === pos.x && i.y === pos.y))
      list.push(piece)
    }
    const isFaceToFace = this.checkGeneralsFaceToFaceInTrouble(list)
    if (isFaceToFace) {
      return true
    }
    const enemySidePeiecList = list.filter(i => i.side === enemySide)
    const sideGeneralPiece = list.find(i => i.side === side && i instanceof GeneralPiece) as GeneralPiece
    const sidesideGeneralPoint = new Point(sideGeneralPiece.x, sideGeneralPiece.y)
    const hasTrouble = enemySidePeiecList.some(item => {
      const mf = item.move(sidesideGeneralPoint, list)
      // if (mf.flag) {
      //   console.log(`${item} 可以 直接 攻击 ${sideGeneralPiece}`);
      // }
      return mf.flag
    })
    return hasTrouble
  }

  /**
   * 检查棋子移动 双方将领在一条直线上 false 不危险 true 危险
   * @param pl 假设移动后的棋子列表
   * @param side 当前下棋方
   * @returns 是否危险
   */
  private checkGeneralsFaceToFaceInTrouble(pl: PieceList) {
    const points = pl.filter(i => i instanceof GeneralPiece).map(i => ({ x: i.x, y: i.y }))
    const max = points[0].y > points[1].y ? points[0].y : points[1].y
    const min = points[0].y < points[1].y ? points[0].y : points[1].y
    // 在同一条直线上
    if (points[0].x === points[1].x) {
      const hasPeice = pl.find(i => i.y < max && i.y > min && i.x === points[0].x)
      // 如果有棋子 说明可以安全移动 
      if (hasPeice) {
        return false
      }
      return true
    }
    return false
  }
  /**
   * 判断敌方被将军时，是否有解
   * @param enemySide 敌方
   * @param pl 当前棋盘列表
   * @returns  返回是否有解
   */
  private checkEnemySideInTroubleHasSolution(enemySide: PieceSide, pl: PieceList) {
    return pl.filter(i => i.side === enemySide).some(item => {
      const mps = item.getMovePoints(pl)
      // 是否有解法
      return mps.some(p => {
        const isDis = findPiece(pl, p.disPoint)
        if (isDis) {
          return false
        }
        const hasEat = findPiece(pl, p)
        const checkPoint: CheckPoint = hasEat ? { eat: p } : { move: p }
        const hasSolution = !this.checkGeneralInTrouble(enemySide, item, checkPoint, pl)
        // console.log(`${item} 移动到 ${p}点 ${enemySide}方 ${!hasSolution ? '有' : '没有'} 危险！${hasSolution ? "有" : "无"}解法`);
        return hasSolution
      })
    })
  }
  /**
   * 判断敌方是否还有下一步走法 无走法就是绝杀
   * @param enemySide 敌方
   * @returns {boolean}
   */
  private checkEnemySideHasMovePoints(enemySide: PieceSide, pl: PieceList) {
    // 当前棋子列表
    const currentList = pl
    // 敌方棋子列表
    const enemyList = currentList.filter(p => p.side === enemySide)
    const hasPeice = enemyList.find(p => {
      // 获取当前棋子可移动位置列表
      const mps = p.getMovePoints(currentList)
      return mps.find(mp => {
        // 移动点 是否有棋子
        const checkPoint: CheckPoint = findPiece(currentList, mp) ? { eat: mp } : { move: mp }
        const hasTrouble = this.checkGeneralInTrouble(enemySide, p, checkPoint, currentList)
        // 如果 移动存在危险表示 不可以移动此移动点
        if (hasTrouble) {
          return false
        }
        return true
      })
    })
    if (hasPeice) {
      return true
    }
    return false
  }
  /**
   * 棋子运动前检查游戏状态是否可以运动
   * @returns 是否可以运动
   */
  checkGameState(): MoveResult {
    // 游戏开始
    let data: MoveResult;
    if (this.gameState === "INIT") {
      data = { flag: false, message: "请选择红黑方" }
    }
    // 游戏结束
    else if (this.gameState === "OVER") {
      data = { flag: false, message: "棋盘结束 等待重开！" }
    }
    // 正在移动
    else if (this.gameState === "MOVE") {
      data = { flag: false, message: "棋子正在移动，无法做任何操作" }
    } else {
      data = { flag: true }
    }
    if (!data.flag) {
      let msg = data.message
      this.logEvents.forEach(f => f(msg))
      this.moveFailEvents.forEach(f => f(null, null, msg))
    }
    return data
  }
  /**
   * 检查是否有画布 有会更新画布 否则不更新 报出错误
   */
  checkDraw() {
    if (this.ctx) {
      try {
        this.draw(this.ctx)
        this.drawLastMovePoint(this.ctx)
      } catch (error) {
        this.errorEvents.forEach(f => f(error))
      }
    } else {
      this.errorEvents.forEach(f => f(new Error("未找到画布，无法更新当前棋盘布局画面！")))
    }
  }
  /**
   * 监听棋盘点击
   */
  listenClick(e: MouseEvent) {
    const { offsetX: x, offsetY: y } = e
    if (!this.checkGameState().flag) {
      return
    }
    const clickPoint = this.getGridPosition({ x, y })
    if (!clickPoint) {
      let msg = '点击的位置未找到棋子'
      this.logEvents.forEach(f => f(msg))
      this.moveFailEvents.forEach(f => f(null, null, msg))
      return
    }
    const isChoose = Boolean(this.choosePiece)
    const pos = isChoose ? new Point(this.choosePiece?.x as number, this.choosePiece?.y as number) : clickPoint
    const mov = isChoose ? clickPoint : null
    let side = this.currentSide
    this.update(pos, mov, side, true)
    this.checkDraw()
  }
  /**
  * 监听棋盘点击
  */
  listenClickAsync(e: MouseEvent) {
    const { offsetX: x, offsetY: y } = e
    if (!this.checkGameState().flag) {
      return
    }
    const clickPoint = this.getGridPosition({ x, y })
    if (!clickPoint) {
      let msg = '点击的位置未找到棋子'
      this.logEvents.forEach(f => f(msg))
      this.moveFailEvents.forEach(f => f(null, null, msg))
      return
    }
    const isChoose = Boolean(this.choosePiece)
    const pos = isChoose ? new Point(this.choosePiece?.x as number, this.choosePiece?.y as number) : clickPoint
    const mov = isChoose ? clickPoint : null
    let side = this.currentSide

    this.updateAsync(pos, mov, side, true).then((data) => {
      this.checkDraw()
      if (!data.flag) {
        this.moveFailEvents.forEach(f => f(pos, mov, data.message))
      }
    })
  }
  /**
   * 获取赢棋方
   */
  get winnerSide(): PieceSide | null {
    return this.winner
  }
  /**
   * 获取游戏方
   */
  get currentGameSide(): PieceSide | null {
    return this.gameSide
  }
  set currentGameSide(val: any) {
    console.log(`设置值无效：${val}`);
  }
  /**
   * 获取当前存活的棋子列表
   */
  get currentLivePieceList(): PieceList {
    return this.livePieceList.map(item => {
      return chessOfPeiceMap[item.name]({ ...item })
    })
  }
  /**
   * 获取当前象棋绘制半径
   */
  get currentRadius(): number {
    return this.radius
  }
  getCurrentPenCode(side: PieceSide): string {
    return gen_PEN_Str(this.livePieceList, side)
  }

  on(e: "move", fn: MoveCallback): void;
  on(e: "moveFail", fn: MoveFailCallback): void;
  on(e: "log", fn: GameLogCallback): void;
  on(e: "over", fn: GameOverCallback): void;
  on(e: "error", fn: GameErrorCallback): void;
  /**
   * 象棋事件监听
   * @param e 监听事件
   * @param fn 监听函数
   */
  on(e: GameEventName, fn: GameEventCallback) {
    if (typeof fn === "function") {
      if (e === "log") {
        this.logEvents.push(fn as GameLogCallback)
      } else if (e === "move") {
        this.moveEvents.push(fn as MoveCallback)
      } else if (e === "moveFail") {
        this.moveFailEvents.push(fn as MoveFailCallback)
      } else if (e === "over") {
        this.overEvents.push(fn as GameOverCallback)
      } else if (e === "error") {
        this.errorEvents.push(fn as GameErrorCallback)
      }
    } else {
      throw new Error("监听函数值应该为 function 类型")
    }
  }
  removeEvent(e: "move", fn: MoveCallback): void;
  removeEvent(e: "moveFail", fn: MoveFailCallback): void;
  removeEvent(e: "log", fn: GameLogCallback): void;
  removeEvent(e: "over", fn: GameOverCallback): void;
  removeEvent(e: "error", fn: GameErrorCallback): void;
  /**
   * 移除象棋事件监听
   * @param e 监听事件
   * @param fn 监听函数
   */
  removeEvent(e: GameEventName, fn: GameEventCallback) {
    if (typeof fn === "function") {
      if (e === "log") {
        this.logEvents = this.logEvents.filter(f => f !== fn)
      } else if (e === "move") {
        this.moveEvents = this.moveEvents.filter(f => f !== fn)
      } else if (e === "moveFail") {
        this.moveFailEvents = this.moveFailEvents.filter(f => f !== fn)
      } else if (e === "over") {
        this.overEvents = this.overEvents.filter(f => f !== fn)
      } else if (e === "error") {
        this.errorEvents = this.errorEvents.filter(f => f !== fn)
      }
    } else {
      throw new Error("监听函数值应该为 function 类型")
    }
  }
  /**
   * 设置当前存活棋子列表
   * @param pl 当前存活棋子列表
   */
  setLivePieceList(pl: PieceList) {
    this.livePieceList = pl
  }
  /**
   * 根据pen代码格式来设置当前棋盘
   * @param penCode 
   * 
   * 建议参考 文章 博客
   * 1. https://www.xqbase.com/protocol/cchess_fen.htm
   */
  setPenCodeList(penCode: string) {
    const data = parse_PEN_Str(penCode)
    this.livePieceList = data.list.map(p => chessOfPeiceMap[p.name](p))
    this.currentSide = data.side
  }
  /**
   * 绘画上次移动点，可自行重写该函数
   * @param ctx canvas 2d 渲染上下文
   */
  drawLastMovePoint(ctx: CTX) {
    if (!this.choosePiece && this.lastMovePoint && ctx) {
      let x = this.startX + Math.abs(this.lastMovePoint.x - this.gridDiffX) * this.gridWidth;
      let y = this.startY + Math.abs(this.lastMovePoint.y - this.gridDiffY) * this.gridHeight;
      ctx.beginPath()
      ctx.arc(x, y, this.radius * .8, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(x, y, this.radius * .05, x, y, this.radius * .8);
      gradient.addColorStop(0, this.movePointColor)
      gradient.addColorStop(1, "rgba(255,255,255,0)")
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill()
    }
  }
  /**
   * 
   */
  private setLastMovePeiceStatus(status: boolean) {
    if (this.lastMovePiece) {
      this.lastMovePiece.isLastMove = status
    }
  }
}
export * from "./piece"
export * from "./types"
export { parse_PEN_Str, gen_PEN_Str, gen_PEN_Point_Str, diffPenStr, initBoardPen } from "../utils/index"