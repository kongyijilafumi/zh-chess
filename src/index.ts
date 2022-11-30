import type { GameState, PieceSide, GameEventName, MoveCallback, MoveFailCallback, GameLogCallback, GameOverCallback, GameEventCallback, CheckPoint, GamePeiceGridDiffX, GamePeiceGridDiffY, UpdateResult } from './types';
import { Point, PieceInfo, MoveResult } from './types';
import { gen_PEN_Str, parseStrToPoint } from '../utils';
import { getPiecesList, } from './data';
import { getSquarePoints } from '../utils/draw';
import { ChessOfPeice, GeneralPiece, PieceList, chessOfPeiceMap } from './piece';

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
   * @defaultValue 800
   */
  gameWidth?: number
  /**
   * 游戏窗口高度大小
   * @defaultValue 800
   */
  gameHeight?: number
  /**
   * 游戏内边距大小距离棋盘
   * @defaultValue 20
   */
  gamePadding?: number
  /**
   * 画布
   */
  ctx: CTX
  /**
   * 画布缩放大小
   * @defaultValue 1
   */
  scaleRatio?: number
  /**
   * 游戏运动速度
   * @defaultValue 8
   */
  moveSpeed?: number
  /**
   * 棋盘背景色
   * @defaultValue #faebd7
   */
  checkerboardBackground?: string
  /**
   * 红棋子背景色
   * @defaultValue #feeca0
   */
  redPeiceBackground?: string
  /**
   * 黑棋子背景色
   * @defaultValue #fdec9e
   */
  blackPeiceBackground?: string
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
  private ctx: CTX
  /**
   * 存放棋盘格子的所有坐标
   */
  private gridPostionList: Array<Point>
  /**
   * 运行速度 大于或等于 1 的数 越大越慢
   */
  moveSpeed: number
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

  constructor({ ctx, gameWidth = 800, gameHeight = 800, gamePadding = 20, scaleRatio = 1, moveSpeed = 8, redPeiceBackground = "#feeca0", blackPeiceBackground = "#fdec9e", checkerboardBackground = "#faebd7" }: GameInfo) {
    if (!ctx) {
      throw new Error("请传入画布")
    }
    this.moveEvents = []
    this.moveFailEvents = []
    this.logEvents = []
    this.overEvents = []
    this.ctx = ctx
    this.redPeiceBackground = redPeiceBackground
    this.blackPeiceBackground = blackPeiceBackground
    this.checkerboardBackground = checkerboardBackground
    // 设置 缩放 来解决移动端模糊问题
    this.ctx.scale(scaleRatio, scaleRatio)
    this.listenClick = this.listenClick.bind(this)
    this.listenClickAsync = this.listenClickAsync.bind(this)
    this.gridPostionList = []
    this.setGridList()
    this.gameState = "INIT"
    this.moveSpeed = moveSpeed
    this.setGameWindow(gameWidth, gameHeight, gamePadding)
    this.init()

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
    this.radius = this.gridHeight * 0.45;
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
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.drawChessLine(this.ctx);
  }
  /**
   * 初始化象棋个数
   */
  private initPiece() {
    this.livePieceList = getPiecesList()
    this.choosePiece = null
    this.redraw()
  }

  updateAsync(pos: Point, mov: Point | null, side: PieceSide, moveCb: () => void) {
    const updateRes = this.update(pos, mov, side)
    if (!updateRes.flag || !mov) {
      return Promise.resolve(updateRes)
    }
    let diffx = (pos.x - mov.x), diffy = (pos.y - mov.y), posX = pos.x, posY = pos.y;
    const xstep = diffx / this.moveSpeed
    const ystep = diffy / this.moveSpeed
    this.clearMoveChoosePeiece()
    let raf: number, posPeice: ChessOfPeice | undefined
    return new Promise((resovle) => {
      const animateFn = () => {
        if (Math.abs(posX - mov.x) <= Math.abs(xstep) && Math.abs(posY - mov.y) <= Math.abs(ystep)) {
          this.cancelAnimate.call(globalThis, raf)
          resovle(null)
          if (posPeice) {
            posPeice.update(pos)
          }
          return { flag: true }
        }
        const point = new Point(posX, posY)
        posPeice = findPiece(this.livePieceList, point)
        posX -= xstep
        posY -= ystep
        const newPoint = new Point(posX, posY)
        if (posPeice) {
          posPeice.isChoose = false
          posPeice.update(newPoint)
        }
        moveCb()
        raf = this.animate.call(globalThis, animateFn)
      }
      animateFn()
    }).then(() => updateRes)
  }
  update(pos: Point, mov: Point | null, side: PieceSide): UpdateResult {

    if (!this.checkGameState()) {
      return { flag: false, message: "当前游戏状态不可以移动棋子" }
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
      if (enemyhasTrouble) {
        const movedPeiceList = this.livePieceList.filter(i => !(i.x === posPeice.x && i.y === posPeice.y))
        const newMp = chessOfPeiceMap[posPeice.name]({ ...posPeice, ...mov })
        movedPeiceList.push(newMp)
        const hasSolution = this.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList)
        if (!hasSolution) {
          isOver = true
          this.gameState = "OVER"
          this.winner = side
        }
      } else {
        const hasMovePoints = this.checkEnemySideHasMovePoints(enemySide)
        if (!hasMovePoints) {
          isOver = true
          this.gameState = "OVER"
          this.winner = side
        }
      }
      return {
        flag: true,
        move: true,
        cb: () => {
          const newPeice = chessOfPeiceMap[posPeice.name]({ ...posPeice, ...mov })
          if (!isMove) {
            this.livePieceList = this.livePieceList.filter(p => (!(p.x === cp.eat.x && p.y === cp.eat.y)))
          }
          posPeice.update(mov)
          this.moveEvents.forEach(f => f(newPeice, cp, isOver || enemyhasTrouble, this.getCurrentPenCode()))
          if (isOver) {
            this.overEvents.forEach(f => f(side))
          }
          posPeice.update(mov)
          this.clearMoveChoosePeiece()
          this.changeSide()
          this.gameState = "START"
        }
      }
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

  draw(ctx: CTX) {
    ctx.clearRect(0, 0, this.width, this.height)
    this.drawChessLine(ctx)
    const { startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius } = this
    this.livePieceList.forEach(item => {
      const textColor = item.side === "BLACK" ? "#000" : "#c1190c",
        bgColor = item.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
      if (item === this.choosePiece) {
        item.drawMovePoints(ctx, this.livePieceList, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius)
      }
      item.draw(ctx, startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius, textColor, bgColor)
    })
  }

  /**
   * 画 棋盘 跟 棋子
   */
  private drawPeice(pieceList: PieceList) {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.drawChessLine(this.ctx);
    pieceList.forEach((p) => this.drawSinglePeice(this.ctx, p, true))
  }
  /**
   * 绘画单个象棋
   * @param piece 单个象棋
   */
  private drawSinglePeice(ctx: CTX, piece: ChessOfPeice, replaceXY?: boolean) {
    const { startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY, radius } = this
    const bgfillStyle = piece.side === "BLACK" ? this.blackPeiceBackground : this.redPeiceBackground;
    const textColor = piece.side === "BLACK" ? "#000" : "#c1190c";
    const borderColor = piece.isChoose ? "red" : "#000";
    let x = startX + piece.x * gridWidth;
    let y = startY + piece.y * gridHeight;
    if (replaceXY) {
      x = startX + Math.abs(piece.x - gridDiffX) * gridWidth;
      y = startY + Math.abs(piece.y - gridDiffY) * gridHeight;
    }
    let r = radius, ty = 0;
    ctx.fillStyle = bgfillStyle;

    const drawBoder = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, startAngle, endAngle);
      ctx.closePath();
      ctx.stroke();
    }

    // 选中动画
    if (piece.isChoose) {
      r = r / 0.98
      ty = piece.side === "RED" ? -3 : 3
      ty = gridDiffY > 0 ? ty * -1 : ty
    }

    // 象棋背景
    ctx.beginPath();
    ctx.arc(x, y + ty, r, 0, 2 * Math.PI);
    // if (piece.isChoose) {
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
    ctx.shadowColor = '#333';
    ctx.shadowBlur = 5;
    // }
    ctx.fill();
    ctx.closePath();

    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    // 象棋圆圈
    ctx.strokeStyle = borderColor;
    drawBoder(x, y + ty, r, 0, 2 * Math.PI);
    drawBoder(x, y + ty, r - 3, 0, 2 * Math.PI);

    // 字
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;
    ctx.font = radius + "px yahei";
    ctx.fillText(piece.name, x, y + ty);
  }
  /**
   * 画棋盘
   */
  private drawChessLine(ctx: CTX) {
    const { startX, startY, endX, endY, gridWidth, gridHeight } = this
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
  }
  /**
   * 画出选中的棋子可以移动的点位
   */
  private drawChoosePieceMovePoint() {
    if (this.choosePiece) {
      const { gridWidth, startX, startY, gridHeight } = this
      this.ctx.fillStyle = "#25dd2a"
      this.choosePiece.getMovePoints(this.livePieceList).forEach(p => {
        let x = startX + Math.abs(p.x - this.gridDiffX) * gridWidth;
        let y = startY + Math.abs(p.y - this.gridDiffY) * gridHeight;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.radius * .25, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill()
      })
    }
  }
  /**
   * 重新绘画当前棋盘
   */
  redraw() {
    this.drawPeice(this.livePieceList)
  }

  /**
   * 动画效果 绘画 棋子移动
   * @param mp 移动点
   * @param pl 绘画的棋子列表
   * @param activePoint 当前移动点
   */
  private activeMove(mp: Point, pl: PieceList, activePoint: Point): Promise<Point> {
    const dx = (activePoint.x - mp.x)
    const dy = (activePoint.y - mp.y)

    const xstep = dx === 0 ? 0 : dx / this.moveSpeed
    const ystep = dy === 0 ? 0 : dy / this.moveSpeed
    // 是否支持 动画 API 
    if (typeof this.animate === "function" && typeof this.cancelAnimate === "function") {
      return new Promise((resolve) => {
        let raf: number;
        const cb = () => {
          // const mx = mp.x.toFixed(2), ax = activePoint.x.toFixed(2), my = mp.y.toFixed(2), ay = activePoint.y.toFixed(2)
          const diffX = Math.abs(mp.x - activePoint.x), diffY = Math.abs(mp.y - activePoint.y)
          // console.log(`diffX:${diffX} diffY:${diffY}\nxstep:${Math.abs(xstep)} ystep:${Math.abs(ystep)}`);
          if (diffX <= Math.abs(xstep) && diffY <= Math.abs(ystep) && this.choosePiece) {
            this.cancelAnimate.call(globalThis, raf)
            return resolve(mp)
          }
          this.drawPeice(pl)
          let peice = { ...this.choosePiece } as ChessOfPeice
          // peice.isChoose = false
          peice.x = Math.abs(activePoint.x - this.gridDiffX) - xstep
          peice.y = Math.abs(activePoint.y - this.gridDiffY) - ystep
          this.drawSinglePeice(this.ctx, peice)
          activePoint.x -= xstep
          activePoint.y -= ystep
          raf = this.animate.call(globalThis, cb)
        }
        cb()
      })
    }
    return Promise.resolve(mp)
  }

  /**
   * 当前选中的棋子 根据点来 移动
   * @param checkPoint 移动点或者是吃
   */
  private moveToPeice(checkPoint: CheckPoint): MoveResult {
    if (this.choosePiece) {
      const side = this.currentSide
      const isMove = "move" in checkPoint
      const point = isMove ? checkPoint.move : checkPoint.eat
      const lastChoosePeice = this.choosePiece
      const hasTrouble = this.checkGeneralInTrouble(side, this.choosePiece, checkPoint, this.livePieceList)
      if (hasTrouble) {
        this.moveFailEvents.forEach(f => f(lastChoosePeice, point, true, "不可以送将！"))
        return { flag: false, message: "不可以送将！" }
      }
      if (!isMove) {
        this.livePieceList = this.livePieceList.filter(i => !(i.x === point.x && i.y === point.y))
      }
      this.gameState = "MOVE"
      return this.moveStart(lastChoosePeice, checkPoint, this.livePieceList, side)
    }
    return { flag: false, message: "未选中棋子" }
  }
  /**
   * 把当前选中的棋子 移动到 指定的位置
   * @param p 移动位置
   * @param drawPeiceList 需要画的棋子列表
   */
  private movePeiceToPointAsync(p: Point, drawPeiceList: PieceList) {
    return new Promise<void>((res) => {
      if (this.choosePiece) {
        const { x, y } = this.choosePiece
        const pl = drawPeiceList.filter(i => !(i.x === x && i.y === y))
        const ap = new Point(x, y)
        this.activeMove(p, pl, ap).then((point) => {
          this.moveEnd(point)
          res()
        })
      } else {
        res()
      }
    })
  }


  /**
  * 当前选中的棋子 根据点来 移动
  * @param checkPoint 移动点或者是吃
  */
  private moveToPeiceAsync(checkPoint: CheckPoint): MoveResultAsync {
    if (this.choosePiece) {
      const side = this.currentSide
      const isMove = "move" in checkPoint
      const point = isMove ? checkPoint.move : checkPoint.eat

      const lastChoosePeice = this.choosePiece
      const hasTrouble = this.checkGeneralInTrouble(side, this.choosePiece, checkPoint, this.livePieceList)
      if (hasTrouble) {
        this.moveFailEvents.forEach(f => f(lastChoosePeice, point, true, "不可以送将！"))
        return Promise.resolve({ flag: false, message: "不可以送将！" })
      }
      if (!isMove) {
        this.livePieceList = this.livePieceList.filter(i => !(i.x === point.x && i.y === point.y))
      }
      this.gameState = "MOVE"
      return this.moveStartAsync(lastChoosePeice, checkPoint, this.livePieceList, side).then(() => ({ flag: true }))
    }
    return Promise.resolve({ flag: false, message: "未选择棋子" })
  }
  /**
   * 开始移动棋子
   * @param mp 移动棋子
   * @param checkPoint 移动点还是吃棋点
   * @param drawList 绘画棋子列表
   * @param side 当前下棋方
   */
  private moveStart(mp: ChessOfPeice, checkPoint: CheckPoint, drawList: PieceList, side: PieceSide): MoveResult {
    const enemySide: PieceSide = side === "RED" ? "BLACK" : "RED"
    const p = "move" in checkPoint ? checkPoint.move : checkPoint.eat
    this.moveEnd(p)
    let isOver = false
    const enemyhasTrouble = this.checkGeneralInTrouble(enemySide, mp, checkPoint, drawList)
    if (enemyhasTrouble) {
      const movedPeiceList = drawList.filter(i => !(i.x === mp.x && i.y === mp.y))
      const newMp = chessOfPeiceMap[mp.name]({ ...mp, ...p })
      movedPeiceList.push(newMp)
      const hasSolution = this.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList)
      if (!hasSolution) {
        isOver = true
        this.gameState = "OVER"
        this.winner = side
      }
    } else {
      const hasMovePoints = this.checkEnemySideHasMovePoints(enemySide)
      if (!hasMovePoints) {
        isOver = true
        this.gameState = "OVER"
        this.winner = side
      }
    }
    this.moveEvents.forEach(f => f(mp, checkPoint, isOver || enemyhasTrouble, this.getCurrentPenCode()))
    if (isOver) {
      this.overEvents.forEach(f => f(side))
    }
    return { flag: true }
  }
  private moveStartAsync(mp: ChessOfPeice, checkPoint: CheckPoint, drawList: PieceList, side: PieceSide) {
    const enemySide: PieceSide = side === "RED" ? "BLACK" : "RED"
    const p = "move" in checkPoint ? checkPoint.move : checkPoint.eat
    return this.movePeiceToPointAsync(p, drawList).then(() => {
      const enemyhasTrouble = this.checkGeneralInTrouble(enemySide, mp, { move: p }, drawList)
      let isOver = false
      if (enemyhasTrouble) {
        const movedPeiceList = drawList.filter(i => !(i.x === mp.x && i.y === mp.y))
        const newMp = chessOfPeiceMap[mp.name]({ ...mp, ...p })
        movedPeiceList.push(newMp)
        const hasSolution = this.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList)
        if (!hasSolution) {
          isOver = true
          this.gameState = "OVER"
          this.winner = side
        }
      } else {
        const hasMovePoints = this.checkEnemySideHasMovePoints(enemySide)
        if (!hasMovePoints) {
          isOver = true
          this.gameState = "OVER"
          this.winner = side
        }
      }
      this.moveEvents.forEach(f => f(mp, checkPoint, isOver || enemyhasTrouble, this.getCurrentPenCode()))
      if (isOver) {
        this.overEvents.forEach(f => f(side))
      }
      return null
    })

  }
  /**
   * 动画移动结束，当前选中的棋子更新 x, y坐标，重新绘画 更换 玩家 和 运动状态
   * @param p 移动点
   */
  private moveEnd(p: Point) {
    this.livePieceList = this.livePieceList.map(i => {
      if (i.x === this.choosePiece?.x && i.y === this.choosePiece?.y) {
        const peiceInfo = { ...i, isChoose: false, ...p }
        return chessOfPeiceMap[i.name](peiceInfo)
      }
      return i
    })
    this.clearMoveChoosePeiece()
    this.changeSide()
    this.redraw()
    this.gameState = "START"
  }
  /**
   * 移动棋子
   * @param clickPoint 移动点
   */
  private pieceMove(clickPoint: Point): MoveResult {
    const choosePiece = findPiece(this.livePieceList, clickPoint)
    // 在棋盘上 还没开始选中的点击
    if (!this.choosePiece) {
      // 如果 没点到棋子 
      if (!choosePiece) {
        return { flag: false, message: "未找到棋子" }
      }
      // 点击到了敌方的棋子
      if (this.currentSide !== choosePiece.side) {
        return { flag: false, message: "选中了敌方的棋子" }
      }
      this.choosePiece = choosePiece
      this.choosePiece.isChoose = true
      this.logEvents.forEach(f => f(`当前：${this.currentSide} 方 选中了 棋子:${choosePiece}`))
      this.redraw()
      return { flag: true }
    }

    // 选中之后的点击
    if (!choosePiece) {// 没有选中棋子 说明 已选中的棋子要移动过去
      const moveFlag = this.choosePiece.move(clickPoint, this.livePieceList)
      let mp = this.choosePiece
      if (moveFlag.flag) {
        return this.moveToPeice({ move: clickPoint })
      }
      this.moveFailEvents.forEach(f => f(mp, clickPoint, true, moveFlag.message))
      return moveFlag
    }

    // 如果点击的棋子是己方
    if (choosePiece.side === this.currentSide) {
      if (this.choosePiece === choosePiece) {// 如果是点击选中的棋子 取消选中
        this.clearMoveChoosePeiece()
        this.logEvents.forEach(f => f(this.currentSide + "方： 取消选中 " + choosePiece))
        this.redraw()
        return { flag: true }
      }

      {// 切换选中棋子
        this.choosePiece.isChoose = false
        this.logEvents.forEach(f => f(`${this.currentSide}方：切换 选中棋子 由${this.choosePiece} --> ${choosePiece}`))
        this.choosePiece = choosePiece
        this.choosePiece.isChoose = true
        this.redraw()
        return { flag: true }
      }

    }

    // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
    this.logEvents.forEach(f => f(`当前：${this.currentSide} ,棋子:${this.choosePiece} 需要移动到：${clickPoint} 这个点上，并且要吃掉 ${choosePiece}`))
    const moveFlag = this.choosePiece.move(clickPoint, this.livePieceList)
    if (!moveFlag.flag) {
      this.moveFailEvents.forEach(f => f(this.choosePiece as ChessOfPeice, clickPoint, false, moveFlag.message))
      return moveFlag
    } else {
      return this.moveToPeice({ eat: clickPoint })
    }
  }
  /**
  * 移动棋子
  * @param p 移动点
  * @returns 返回promise移动结果
  */
  private pieceMoveAsync(p: Point): Promise<MoveResult> {
    const choosePiece = findPiece(this.livePieceList, p)
    // 在棋盘上 还没开始选中的点击
    if (!this.choosePiece) {
      // 如果 没点到棋子 
      if (!choosePiece) {
        return Promise.resolve({ flag: false, message: "未找到棋子" })
      }
      // 点击到了敌方的棋子
      if (this.currentSide !== choosePiece.side) {
        return Promise.resolve({ flag: false, message: "选中了敌方的棋子" })
      }
      this.choosePiece = choosePiece
      this.choosePiece.isChoose = true
      this.logEvents.forEach(f => f(`当前：${this.currentSide} 方 选中了 棋子:${choosePiece}`))
      this.redraw()
      this.drawChoosePieceMovePoint()
      return Promise.resolve({ flag: true })
    }

    // 选中之后的点击
    // 没有选中棋子 说明 已选中的棋子要移动过去
    if (!choosePiece) {
      const moveFlag = this.choosePiece.move(p, this.livePieceList)
      let mp = this.choosePiece
      if (moveFlag.flag) {
        return this.moveToPeiceAsync({ move: p })
      }
      this.moveFailEvents.forEach(f => f(mp, p, true, moveFlag.message))
      return Promise.resolve(moveFlag)
    }

    // 如果点击的棋子是己方
    if (choosePiece.side === this.currentSide) {
      // 如果是点击选中的棋子
      if (this.choosePiece === choosePiece) {// 取消选中
        this.clearMoveChoosePeiece()
        this.logEvents.forEach(f => f(this.currentSide + "方： 取消选中 " + choosePiece))
        this.redraw()
        return Promise.resolve({ flag: true })
      }
      // 切换选中棋子
      this.choosePiece.isChoose = false
      this.logEvents.forEach(f => f(`${this.currentSide}方：切换 选中棋子 由${this.choosePiece} --> ${choosePiece}`))
      this.choosePiece = choosePiece
      this.choosePiece.isChoose = true
      this.redraw()
      this.drawChoosePieceMovePoint()
      return Promise.resolve({ flag: true })
    }

    // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
    this.logEvents.forEach(f => f(`当前：${this.currentSide} ,棋子:${this.choosePiece} 需要移动到：${p} 这个点上，并且要吃掉 ${choosePiece}`))
    const moveFlag = this.choosePiece.move(p, this.livePieceList)
    if (!moveFlag.flag) {
      this.moveFailEvents.forEach(f => f(this.choosePiece as ChessOfPeice, p, false, moveFlag.message))
      return Promise.resolve(moveFlag)
    } else {
      return this.moveToPeiceAsync({ eat: p })
    }
  }

  /**
   * 根据坐标点移动位置
   * @param piecePoint 棋子所在位置
   * @param movePoint 移动位置
   * @param side 下棋方
   */
  move(piecePoint: Point, movePoint: Point, side: PieceSide): MoveResult {
    if (!this.checkGameState()) {
      return { flag: false, message: "当前游戏状态不可以移动棋子" }
    }
    if (this.currentSide !== side) {
      return { flag: false, message: "请等待对方下棋" }
    }
    const posPeice = findPiece(this.livePieceList, piecePoint)
    if (!posPeice || posPeice.side !== this.currentSide) {
      this.logEvents.forEach(f => f("未找到棋子"))
      return { flag: false, message: "未找到棋子" }
    }
    if (this.choosePiece) {
      this.clearMoveChoosePeiece()
    }
    posPeice.isChoose = true
    this.choosePiece = posPeice
    return this.pieceMove(movePoint)
  }
  /**
   * 根据坐标点移动位置
   * @param piecePoint 棋子所在位置
   * @param movePoint 移动位置
   * @param side 下棋方
   */
  moveAsync(piecePoint: Point, movePoint: Point, side: PieceSide): MoveResultAsync {
    if (!this.checkGameState()) {
      return Promise.resolve({ flag: false, message: "当前游戏状态不可以移动棋子" })
    }
    if (this.currentSide !== side) {
      return Promise.resolve({ flag: false, message: `当前为${this.currentSide}方下棋，请等待！` })
    }
    const posPeice = findPiece(this.livePieceList, piecePoint)
    if (!posPeice || posPeice.side !== this.currentSide) {
      this.logEvents.forEach(f => f("未找到棋子"))
      return Promise.resolve({ flag: false, message: "未找到棋子" })
    }
    if (this.choosePiece) {
      this.clearMoveChoosePeiece()
    }
    posPeice.isChoose = true
    this.choosePiece = posPeice
    return this.pieceMoveAsync(movePoint)
  }
  /**
   * 根据移动方的描述文字来进行移动棋子
   * @param str 文字
   * @param side 移动方
   * @returns 移动结果
   */
  moveStr(str: string, side: PieceSide): MoveResult {
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
    return this.pieceMove(res.mp)
  }
  /**
   * 根据移动方的描述文字来进行移动棋子
   * @param str 文字
   * @param side 移动方
   * @returns 移动结果
   */
  moveStrAsync(str: string, side: PieceSide): MoveResultAsync {
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
    const posPeice = findPiece(this.livePieceList, res.mp)
    if (posPeice && posPeice.side === this.currentSide) {
      this.logEvents.forEach(f => f("移动的位置有己方棋子"))
      return Promise.resolve({ flag: false, message: "移动的位置有己方棋子" })
    }
    this.choosePiece = res.choose
    this.choosePiece.isChoose = true
    return this.pieceMoveAsync(res.mp)
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
    this.gameSide = side
    this.initPiece()
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
    this.redraw()
  }
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
      const pieceInfo = { ...pos, x: cp.move.x, y: cp.move.y } as PieceInfo
      const piece = chessOfPeiceMap[pieceInfo.name](pieceInfo)
      list = pl.filter(i => !(i.x === pos.x && i.y === pos.y))
      list.push(piece)
    } else {
      const pieceInfo = { ...pos, x: cp.eat.x, y: cp.eat.y } as PieceInfo
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
  private checkEnemySideHasMovePoints(enemySide: PieceSide) {
    // 当前棋子列表
    const currentList = this.currentLivePieceList
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
  checkGameState() {
    // 游戏开始
    if (this.gameState === "INIT") {
      this.logEvents.forEach(f => f("请选择红黑方"))
      return false
    }
    // 游戏结束
    if (this.gameState === "OVER") {
      this.logEvents.forEach(f => f("棋盘结束 等待重开！"))
      return false
    }
    // 正在移动
    if (this.gameState === "MOVE") {
      this.logEvents.forEach(f => f("棋子正在移动，无法做任何操作"))
      return false
    }
    return true
  }

  /**
   * 监听棋盘点击
   */
  listenClick(e: MouseEvent) {
    const { offsetX: x, offsetY: y } = e
    if (!this.checkGameState()) {
      return
    }
    const clickPoint = this.getGridPosition({ x, y })
    if (!clickPoint) {
      return
    }
    this.pieceMove(clickPoint)
  }
  /**
  * 监听棋盘点击
  */
  listenClickAsync(e: MouseEvent) {
    const { offsetX: x, offsetY: y } = e
    if (!this.checkGameState()) {
      return
    }
    const clickPoint = this.getGridPosition({ x, y })
    if (!clickPoint) {
      return
    }
    const isChoose = Boolean(this.choosePiece)
    const pos = isChoose ? new Point(this.choosePiece?.x as number, this.choosePiece?.y as number) : clickPoint
    const mov = isChoose ? clickPoint : null
    let side = this.currentSide
    this.updateAsync(pos, mov, side, () => {
      this.draw(this.ctx)
    }).then((data) => {
      console.log(data);
      if (data.flag) {
        data.cb && data.cb()
        this.draw(this.ctx)
      } else {
        this.moveFailEvents.forEach(f => f(pos, mov, data.message))
      }
    })

    // this.pieceMoveAsync(clickPoint)
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
  private set currentGameSide(val: any) {
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
  getCurrentPenCode(): string {
    return gen_PEN_Str(this.livePieceList, this.currentSide)
  }
  on(e: "move", fn: MoveCallback): void;
  on(e: "moveFail", fn: MoveFailCallback): void;
  on(e: "log", fn: GameLogCallback): void;
  on(e: "over", fn: GameOverCallback): void;
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
      }
    } else {
      throw new Error("监听函数值应该为 function 类型")
    }
  }
  removeEvent(e: "move", fn: MoveCallback): void;
  removeEvent(e: "moveFail", fn: MoveFailCallback): void;
  removeEvent(e: "log", fn: GameLogCallback): void;
  removeEvent(e: "over", fn: GameOverCallback): void;
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
}
export * from "./piece"
export * from "./types"
export { parse_PEN_Str, gen_PEN_Str, gen_PEN_Point_Str } from "../utils/index"