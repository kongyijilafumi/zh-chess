import type { GameState, PieceSide, GameEventName, MoveCallback, MoveFailCallback, GameLogCallback, GameOverCallback, GameEventCallback, CheckPoint, GamePeiceGridDiffX, GamePeiceGridDiffY } from './types';
import { Point } from './types';
import { GameRule } from './rule';
import { findPiece, getPieceInfo } from '../utils';
import { getPiecesList, } from './data';
import { getSquarePoints } from '../utils/draw';
import type { ChessOfPeice, PieceList } from './piece';
import { chessOfPeiceMap } from "./piece"
type CTX = CanvasRenderingContext2D

type GameInfo = {
  gameWidth?: number
  gameHeight?: number
  gamePadding?: number
  ctx: CTX
  scaleRatio?: number
}

export default class Game {
  /**
   * 当前走棋方
   */
  private currentSide!: PieceSide
  /**
   * 当前棋盘上存活的棋子
   */
  private livePieceList!: PieceList
  /**
   * 当前被吃掉的棋子
   */
  private deadPieceList!: PieceList
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
   * 棋盘是否有棋子在移动
   */
  private isMoving!: boolean;
  /**
   * 运行速度 大于或等于 1 的数 越大越慢
   */
  moveSpeed: number
  /**
   * 将军验证规则
   */
  private rule: GameRule
  /**
   * 玩家方
   */
  private gameSide!: PieceSide
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
  gameState!: GameState

  moveEvents: Array<MoveCallback>
  moveFailEvents: Array<MoveFailCallback>
  logEvents: Array<GameLogCallback>
  overEvents: Array<GameOverCallback>
  constructor({ ctx, gameWidth = 800, gameHeight = 800, gamePadding = 20, scaleRatio = 1 }: GameInfo) {
    if (!ctx) {
      throw new Error("请传入画布")
    }
    this.moveEvents = []
    this.moveFailEvents = []
    this.logEvents = []
    this.overEvents = []
    this.ctx = ctx
    // 设置 缩放 来解决移动端模糊问题
    this.ctx.scale(scaleRatio, scaleRatio)
    this.listenClick = this.listenClick.bind(this)
    this.rule = new GameRule()
    this.gridPostionList = []
    this.setGridList()

    this.moveSpeed = 8
    this.ctx = ctx
    this.setGameWindow(gameWidth, gameHeight, gamePadding)
    this.init()
  }

  /**
   * 设置游戏窗口 棋盘
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
  private setGridDiff() {
    this.gridDiffX = this.gameSide === "BLACK" ? 8 : 0
    this.gridDiffY = this.gameSide === "BLACK" ? 9 : 0
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
   * 初始化象棋
   */
  private init() {
    this.isMoving = false
    this.currentSide = "RED"
    this.gameState = "INIT"
    this.choosePiece = null
    this.deadPieceList = []
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.drawChessLine();
  }
  /**
   * 初始化象棋个数
   */
  private initPiece() {
    this.livePieceList = getPiecesList(this.radius)
    this.choosePiece = null
    this.deadPieceList = []
    this.redraw()
  }

  /**
   * 画 棋盘 跟 棋子
   */
  private drawPeice(pieceList: PieceList) {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.drawChessLine();
    pieceList.forEach((p) => this.drawSinglePeice(p, true))
  }
  /**
   * 绘画单个象棋
   * @param piece 单个象棋
   */
  private drawSinglePeice(piece: ChessOfPeice, replaceXY?: boolean) {
    const { startX, startY, gridWidth, gridHeight, gridDiffX, gridDiffY } = this
    const bgfillStyle = piece.side === "BLACK" ? "#fdec9e" : "#feeca0";
    const textColor = piece.side === "BLACK" ? "#000" : "#c1190c";
    const borderColor = piece.isChoose ? "red" : "#000";
    let x = startX + piece.x * gridWidth;
    let y = startY + piece.y * gridHeight;
    if (replaceXY) {
      x = startX + Math.abs(piece.x - gridDiffX) * gridWidth;
      y = startY + Math.abs(piece.y - gridDiffY) * gridHeight;
    }
    let r = piece.radius, ty = 0;
    this.ctx.fillStyle = bgfillStyle;

    const drawBoder = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    // 选中动画
    if (piece.isChoose) {
      r = r / 0.98
      ty = piece.side === "RED" ? -3 : 3
      ty = gridDiffY > 0 ? ty * -1 : ty
    }

    // 象棋背景
    this.ctx.beginPath();
    this.ctx.arc(x, y + ty, r, 0, 2 * Math.PI);
    // if (piece.isChoose) {
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 4;
    this.ctx.shadowColor = '#333';
    this.ctx.shadowBlur = 5;
    // }
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.shadowBlur = 0
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    // 象棋圆圈
    this.ctx.strokeStyle = borderColor;
    drawBoder(x, y + ty, r, 0, 2 * Math.PI);
    drawBoder(x, y + ty, r - 3, 0, 2 * Math.PI);

    // 字
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = textColor;
    this.ctx.font = piece.radius + "px yahei";
    this.ctx.fillText(piece.name, x, y + ty);
  }
  /**
   * 画棋盘
   */
  private drawChessLine() {
    const { startX, startY, endX, endY, gridWidth, gridHeight } = this
    // 画背景
    this.ctx.fillStyle = "#faebd7";
    this.ctx.fillRect(0, 0, this.width, this.width);

    this.ctx.strokeStyle = "#000";
    // 横线
    for (let index = 0; index < 10; index++) {
      this.ctx.beginPath();
      const y = startY + gridHeight * index;
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    // 竖线
    for (let index = 0; index < 9; index++) {
      const x = startX + index * gridWidth;
      const midY = startY + gridHeight * 4;
      const by = startY + gridHeight * 9;
      if (index === 0 || index === 8) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, startY);
        this.ctx.lineTo(x, by);
        this.ctx.closePath();
        this.ctx.stroke();
        continue;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, midY);
      this.ctx.closePath();
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(x, midY + gridHeight);
      this.ctx.lineTo(x, endY);
      this.ctx.closePath();
      this.ctx.stroke();
    }
    // 士的两把叉
    for (let index = 0; index < 2; index++) {
      const x = startX + gridWidth * 3;
      const points = getSquarePoints(
        { x, y: startY + gridHeight * 7 * index },
        gridWidth * 2,
        gridHeight * 2
      );
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      this.ctx.lineTo(points[2].x, points[2].y);
      this.ctx.moveTo(points[1].x, points[1].y);
      this.ctx.lineTo(points[3].x, points[3].y);
      this.ctx.closePath();
      this.ctx.stroke();
    }
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
    if (typeof window.requestAnimationFrame === "function" && typeof window.requestAnimationFrame === "function") {
      return new Promise((resolve) => {
        let raf: number;
        const cb = () => {
          // const mx = mp.x.toFixed(2), ax = activePoint.x.toFixed(2), my = mp.y.toFixed(2), ay = activePoint.y.toFixed(2)
          const diffX = Math.abs(mp.x - activePoint.x), diffY = Math.abs(mp.y - activePoint.y)
          // console.log(`diffX:${diffX} diffY:${diffY}\nxstep:${Math.abs(xstep)} ystep:${Math.abs(ystep)}`);
          if (diffX <= Math.abs(xstep) && diffY <= Math.abs(ystep) && this.choosePiece) {
            window.cancelAnimationFrame(raf)
            return resolve(mp)
          }
          this.drawPeice(pl)
          let peice = { ...this.choosePiece } as ChessOfPeice
          // peice.isChoose = false
          peice.x = Math.abs(activePoint.x - this.gridDiffX) - xstep
          peice.y = Math.abs(activePoint.y - this.gridDiffY) - ystep
          this.drawSinglePeice(peice)
          activePoint.x -= xstep
          activePoint.y -= ystep
          raf = window.requestAnimationFrame(cb)
        }
        cb()
      })
    }
    return Promise.resolve(mp)
  }

  /**
   * 把当前选中的棋子 移动到 指定的位置
   * @param p 移动位置
   * @param drawPeiceList 需要画的棋子列表
   * @param moveCb 移动完的回调函数
   */
  private movePeice(p: Point, drawPeiceList: PieceList) {
    return new Promise<void>((res) => {
      if (this.choosePiece) {
        const { x, y } = this.choosePiece
        const pl = drawPeiceList.filter(i => !(i.x === x && i.y === y))
        const ap = new Point(this.choosePiece.x, this.choosePiece.y)
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
   * 清除移动完选中的棋子
   */
  private clearMoveChoosePeiece() {
    if (this.choosePiece) {
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
   * 当前选中的棋子吃掉 指定位置的棋子
   * @param p 当前选中棋子
   */
  private eatPeice(p: Point) {
    if (this.choosePiece) {
      const side = this.currentSide
      const eatPeice = findPiece(this.livePieceList, p)
      const lastChoosePeice = this.choosePiece
      const hasTrouble = this.rule.checkGeneralInTrouble(side, this.choosePiece, { eat: p }, this.livePieceList)
      if (hasTrouble) {
        this.moveFailEvents.forEach(f => f(lastChoosePeice, p, true, "不可以送将！"))
        return
      }
      this.livePieceList = this.livePieceList.filter(i => !(i.x === p.x && i.y === p.y))
      this.deadPieceList.push(eatPeice as ChessOfPeice)
      this.isMoving = true
      this.moveStart(lastChoosePeice, p, this.livePieceList, side, true)
    }

  }

  /**
   * 开始移动棋子
   * @param mp 移动棋子
   * @param p 移动位置
   * @param drawList 绘画棋子列表
   * @param side 当前下棋方
   */
  private moveStart(mp: ChessOfPeice, p: Point, drawList: PieceList, side: PieceSide, isEat?: boolean) {
    const enemySide: PieceSide = side === "RED" ? "BLACK" : "RED"
    const checkPoint: CheckPoint = isEat ? { eat: p } : { move: p }
    this.movePeice(p, drawList).then(() => {
      const enemyhasTrouble = this.rule.checkGeneralInTrouble(enemySide, mp, { move: p }, drawList)
      if (enemyhasTrouble) {
        const movedPeiceList = drawList.filter(i => !(i.x === mp.x && i.y === mp.y))
        const newMp = chessOfPeiceMap[mp.name]({ ...mp, ...p })
        movedPeiceList.push(newMp)
        const hasSolution = this.rule.checkEnemySideInTroubleHasSolution(enemySide, movedPeiceList)
        if (!hasSolution) {
          this.gameState = "OVER"
          this.overEvents.forEach(f => f(side))
          return
        }
      }
      this.moveEvents.forEach(f => f(mp, checkPoint, enemyhasTrouble))
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
    this.isMoving = false
  }

  /**
   * 重新绘画当前棋盘
   */
  redraw() {
    this.drawPeice(this.livePieceList)
  }
  /**
   * 初始化选择玩家方
   * @param side 玩家方
   */
  gameStart(side: PieceSide) {
    if (this.gameState === "START") {
      this.logEvents.forEach(f => f("刚开始不可以结束"))
      return
    }
    this.gameSide = side
    this.init()
    this.setGridDiff()
    this.initPiece()
    this.gameState = "START"
  }
  /**
   * 移动棋子
   * @param clickPoint 移动点
   */
  private move(clickPoint: Point) {
    const choosePiece = findPiece(this.livePieceList, clickPoint)
    // 在棋盘上 还没开始选中的点击
    if (!this.choosePiece) {
      // 如果 没点到棋子 
      if (!choosePiece) {
        return;
      }
      // 点击到了敌方的棋子
      if (this.currentSide !== choosePiece.side) {
        return
      }
      this.choosePiece = choosePiece
      this.choosePiece.isChoose = true
      this.logEvents.forEach(f => f(`当前：${this.currentSide} 方 选中了 棋子:${choosePiece}`))
      this.redraw()
      return
    }

    // 选中之后的点击
    // 没有选中棋子 说明 已选中的棋子要移动过去
    if (!choosePiece) {
      const moveFlag = this.choosePiece.move(clickPoint, this.livePieceList)
      let mp = this.choosePiece
      if (moveFlag.flag) {
        const hasTrouble = this.rule.checkGeneralInTrouble(this.currentSide, this.choosePiece, { move: clickPoint }, this.livePieceList)
        if (hasTrouble) {
          this.moveFailEvents.forEach(f => f(mp, clickPoint, true, "不可以送将！"))
          return
        }
        this.isMoving = true
        return this.moveStart(this.choosePiece, clickPoint, this.livePieceList, this.currentSide)
      }
      return this.moveFailEvents.forEach(f => f(mp, clickPoint, true, moveFlag.message))
    }

    // 如果点击的棋子是己方
    if (choosePiece.side === this.currentSide) {
      // 如果是点击选中的棋子
      if (this.choosePiece === choosePiece) {
        // 取消选中
        this.choosePiece.isChoose = false
        this.choosePiece = null
        this.logEvents.forEach(f => f("我方： 取消选中 " + choosePiece))
        return this.redraw()
      }
      // 切换选中棋子
      this.choosePiece.isChoose = false
      this.logEvents.forEach(f => f(`我方：切换 选中棋子 由${this.choosePiece} --> ${choosePiece}`))
      this.choosePiece = choosePiece
      this.choosePiece.isChoose = true
      this.redraw()
      return

    }

    // 如果点击的的棋子是敌方 ，要移动到敌方的棋子位置上
    this.logEvents.forEach(f => f(`当前：${this.currentSide} ,棋子:${this.choosePiece} 需要移动到：${clickPoint} 这个点上，并且要吃掉 ${choosePiece}`))
    const moveFlag = this.choosePiece.move(clickPoint, this.livePieceList)
    if (moveFlag.flag) {
      this.eatPeice(clickPoint)
      return
    }
    this.moveFailEvents.forEach(f => f(this.choosePiece as ChessOfPeice, clickPoint, false, moveFlag.message))
  }

  moveStr(str: string) {
    this.logEvents.forEach(f => f(`当前 ${this.currentSide} 输出：${str}`))
    const res = getPieceInfo(str, this.currentSide, this.livePieceList)
    if (!res) {
      this.logEvents.forEach(f => f("未找到棋子"))
      return
    }
    if (this.choosePiece) {
      this.choosePiece.isChoose = false
      this.choosePiece = null
    }
    const posPeice = findPiece(this.livePieceList, res.mp)
    if (posPeice && posPeice.side === this.currentSide) {
      this.logEvents.forEach(f => f("移动的位置有己方棋子"))
      return
    }
    this.choosePiece = res.choose
    this.choosePiece.isChoose = true
    this.move(res.mp)
  }

  /**
   * 监听棋盘点击
   */
  listenClick(e: MouseEvent) {
    const { offsetX: x, offsetY: y } = e
    // 游戏开始
    if (this.gameState === "INIT") {
      this.logEvents.forEach(f => f("请选择红黑方"))
      return
    }
    // 游戏结束
    if (this.gameState === "OVER") {
      this.logEvents.forEach(f => f("棋盘结束 等待重开！"))
      return
    }
    // 正在移动
    if (this.isMoving) {
      this.logEvents.forEach(f => f("棋子正在移动，无法做任何操作"))
      return
    }
    const clickPoint = this.getGridPosition({ x, y })
    if (!clickPoint) {
      return
    }
    this.move(clickPoint)
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
}
export type { ChessOfPeice, PieceList, ChessOfPeiceName, ChessOfPeiceMap } from "./piece"
export * from "./types"