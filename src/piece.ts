import {
  PieceInfo,
  PieceSide,
  Point,
  MovePoint,
  MoveResult,
  MovePointList,
  PiecePosInfo,
  GamePieceGridDiffX,
  GamePieceGridDiffY
} from './types'
const notExistPoint = { x: 10, y: 10 }
/**
 * 棋盘位表索引类型：90 格，每格存棋子或 undefined
 */
export type Board = Array<ChessOfPeice | undefined>
/**
 * 构建棋盘位表索引（90 格），实现 O(1) 查格，替代 pl.find 的 O(n) 线性扫描
 */
export const buildBoardIndex = (pl: PieceList): Board => {
  const board: Board = new Array(90)
  for (let i = 0; i < pl.length; i++) {
    const item = pl[i]
    board[item.x + item.y * 9] = item
  }
  return board
}
/**
 * 坐标 -> 棋盘位表索引，越界返回 -1
 */
export const posIdx = (x: number, y: number): number =>
  x < 0 || x > 8 || y < 0 || y > 9 ? -1 : x + y * 9
export class Piece implements PieceInfo {
  x: number
  y: number
  name: ChessOfPeiceName
  side: PieceSide
  isChoose: boolean
  isLastMove: boolean
  constructor(pieceInfo: PieceInfo) {
    this.x = pieceInfo.x
    this.y = pieceInfo.y
    this.name = pieceInfo.name
    this.side = pieceInfo.side
    this.isChoose = pieceInfo.isChoose || false
    this.isLastMove = pieceInfo.isLastMove
  }
  /**
   * 格式化象棋棋子输出字符串信息
   * @returns 例如返回`[RED方]:车(1,1)`
   */
  toString() {
    return `[${this.side}方]:${this.name}(${this.x},${this.y})`
  }
  /**
   * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
   * @param list 移动点列表
   * @param pl 棋子列表
   * @returns 返回这个棋子可以移动点列表
   */
  filterMovePoints(list: MovePointList, pl: PieceList, board?: Board): MovePointList {
    const b = board || buildBoardIndex(pl)
    return list.filter(i => {
      if (i.x < 0 || i.x > 8 || i.y < 0 || i.y > 9) return false
      const atItem = b[posIdx(i.x, i.y)]
      if (atItem && atItem.side === this.side) return false
      return true
    })
  }
  /**
   * 返回当前棋子的坐标信息
   * @returns 包含 name side x y 信息
   */
  getCurrentInfo(): PiecePosInfo {
    return {
      side: this.side,
      name: this.name,
      x: this.x,
      y: this.y,
      isLastMove: this.isLastMove
    }
  }
  /**
   * 更新自己坐标点
   * @param p 坐标点
   */
  update(p: Point) {
    this.x = p.x
    this.y = p.y
  }
  /**
   *
   * @param ctx 画布
   * @param startX 画布x轴起始位置
   * @param startY 画布y轴起始位置
   * @param gridWidth 棋盘格子宽带
   * @param gridHeight 棋盘格子高带
   * @param gridDiffX 游戏象棋玩家格子x轴差值 用于区分红黑棋
   * @param gridDiffY 游戏象棋玩家格子y轴差值 用于区分红黑棋
   * @param radius 象棋园半径
   * @param textColor 象棋字体颜色
   * @param bgColor 象棋背景颜色
   * @param choosePeiceBorderColor 选中的边框色
   * @param displayName 可选显示名（变体可改写，例如揭棋「暗」）
   */
  draw(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    gridWidth: number,
    gridHeight: number,
    gridDiffX: GamePieceGridDiffX,
    gridDiffY: GamePieceGridDiffY,
    radius: number,
    textColor: string,
    bgColor: string,
    choosePeiceBorderColor: string,
    displayName?: string
  ) {
    const borderColor = this.isChoose ? choosePeiceBorderColor : textColor
    const x = startX + Math.abs(this.x - gridDiffX) * gridWidth
    const y = startY + Math.abs(this.y - gridDiffY) * gridHeight
    let r = radius
    const ty = 0
    ctx.fillStyle = bgColor

    const drawBoder = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
      ctx.beginPath()
      ctx.arc(x, y, r, startAngle, endAngle)
      ctx.closePath()
      ctx.stroke()
    }

    // 选中动画
    if (this.isChoose || this.isLastMove) {
      r = r / 0.9
      // ty = this.side === "RED" ? -.3 * radius : .3 * radius
      // ty = gridDiffY > 0 ? ty * -1 : ty
    }

    // 象棋背景
    ctx.beginPath()
    ctx.arc(x, y + ty, r, 0, 2 * Math.PI)
    // if (piece.isChoose) {
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 4
    ctx.shadowColor = '#333'
    ctx.shadowBlur = 5
    // }
    ctx.fill()
    ctx.closePath()

    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    // 象棋圆圈
    ctx.strokeStyle = borderColor
    drawBoder(x, y + ty, r, 0, 2 * Math.PI)
    drawBoder(x, y + ty, r - 3, 0, 2 * Math.PI)

    // 字
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = textColor
    ctx.font = radius + 'px yahei'
    ctx.fillText(displayName ?? this.name, x, y + ty)
  }
  /**
   * 根据棋子列表判断 当前棋子可移动的点
   * @param _pl 棋子列表
   * @returns
   */
  getMovePoints(_pl: PieceList, _board?: Board): MovePointList {
    return []
  }
  /**
   * 画出棋子可移动的点
   * @param ctx canvas画布
   * @param pl 当前棋子列表
   * @param startX x
   * @param startY y
   * @param gridWidth 棋盘格子宽度
   * @param gridHeight 棋盘格子高度
   * @param gridDiffX 棋子x轴差值
   * @param gridDiffY 棋子y轴差值
   * @param radius 棋子半径
   */
  drawMovePoints(
    ctx: CanvasRenderingContext2D,
    pl: PieceList,
    startX: number,
    startY: number,
    gridWidth: number,
    gridHeight: number,
    gridDiffX: number,
    gridDiffY: number,
    radius: number,
    moveColor: string
  ) {
    ctx.fillStyle = moveColor
    this.getMovePoints(pl).forEach(p => {
      const x = startX + Math.abs(p.x - gridDiffX) * gridWidth
      const y = startY + Math.abs(p.y - gridDiffY) * gridHeight
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.25, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fill()
    })
  }
  getPoint() {
    return new Point(this.x, this.y)
  }
}
/**
 * 象棋：车
 */
export class RookPiece extends Piece {
  /**
   * 根据车移动的方向得出障碍棋子列表
   * @param p 坐标点或者移动点
   * @param pieceList 棋子列表
   * @returns 返回存在障碍的棋子列表
   */
  getMoveObstaclePieceList(p: Point | MovePoint, pieceList: PieceList): PieceList {
    // x 或者 y 轴
    const diffKey = this.x === p.x ? 'y' : 'x'
    const key = diffKey === 'x' ? 'y' : 'x'
    // 移动步数
    const diff = this[diffKey] - p[diffKey]
    const min = diff > 0 ? p[diffKey] : this[diffKey]
    const max = diff < 0 ? p[diffKey] : this[diffKey]
    // 障碍物棋子列表
    const list = pieceList.filter(item => {
      const notSelf = !(this.x === item.x && this.y === item.y)
      const isOnSameLine = item[key] === p[key]
      const inRangeY = item[diffKey] > min && item[diffKey] < max
      const isSameSide = item.side === this.side
      const inSameRangeY = item[diffKey] >= min && item[diffKey] <= max
      return (
        (isOnSameLine && notSelf && inRangeY) ||
        (isOnSameLine && notSelf && isSameSide && inSameRangeY)
      )
    })
    return list
  }
  /**
   * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
   * @param p 坐标点 或 移动点
   * @param pieceList 棋盘列表
   * @returns 返回移动结果
   */
  move(p: Point | MovePoint, pieceList: PieceList): MoveResult {
    if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
      return { flag: false, message: '移动位置不符合规则' }
    }
    // 如果在 x,y 轴上移动
    if (this.y === p.y || this.x === p.x) {
      const list = this.getMoveObstaclePieceList(p, pieceList)
      if (list.length > 0) {
        return { flag: false, message: '移动距离中存在障碍物：' + list.join('---') }
      }
      return { flag: true }
    }
    // console.log("无效移动");
    return { flag: false, message: '移动位置不符合规则' }
  }
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList, board?: Board): MovePointList {
    const xpoints: MovePointList = []
    const ypoints: MovePointList = []
    // 无棋子列表时返回全部同线点（保留原语义）
    if (!pl) {
      for (let x = 0; x < 9; x++) {
        if (x !== this.x) xpoints.push(new MovePoint(x, this.y, notExistPoint))
      }
      for (let y = 0; y < 10; y++) {
        if (y !== this.y) ypoints.push(new MovePoint(this.x, y, notExistPoint))
      }
      return xpoints.concat(ypoints)
    }
    const b = board || buildBoardIndex(pl)
    // 从自身位置向两侧扫描：左侧 x 递减，遇棋即止（敌方可吃，己方挡路）
    for (let x = this.x - 1; x >= 0; x--) {
      const pc = b[x + this.y * 9]
      if (!pc) {
        xpoints.push(new MovePoint(x, this.y, notExistPoint))
      } else {
        if (pc.side !== this.side) {
          xpoints.push(new MovePoint(x, this.y, notExistPoint))
        }
        break
      }
    }
    // 右侧 x 递增
    for (let x = this.x + 1; x < 9; x++) {
      const pc = b[x + this.y * 9]
      if (!pc) {
        xpoints.push(new MovePoint(x, this.y, notExistPoint))
      } else {
        if (pc.side !== this.side) {
          xpoints.push(new MovePoint(x, this.y, notExistPoint))
        }
        break
      }
    }
    // 上侧 y 递减
    for (let y = this.y - 1; y >= 0; y--) {
      const pc = b[this.x + y * 9]
      if (!pc) {
        ypoints.push(new MovePoint(this.x, y, notExistPoint))
      } else {
        if (pc.side !== this.side) {
          ypoints.push(new MovePoint(this.x, y, notExistPoint))
        }
        break
      }
    }
    // 下侧 y 递增
    for (let y = this.y + 1; y < 10; y++) {
      const pc = b[this.x + y * 9]
      if (!pc) {
        ypoints.push(new MovePoint(this.x, y, notExistPoint))
      } else {
        if (pc.side !== this.side) {
          ypoints.push(new MovePoint(this.x, y, notExistPoint))
        }
        break
      }
    }
    // 保持与旧版一致的升序输出顺序
    xpoints.sort((a, b) => a.x - b.x)
    ypoints.sort((a, b) => a.y - b.y)
    return xpoints.concat(ypoints)
  }
}

/**
 * 象棋：马
 */
export class HorsePiece extends Piece {
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList, board?: Board): MovePointList {
    const mps: MovePointList = []
    for (let index = 0; index < 2; index++) {
      // 左
      const lx = this.x - 2
      const ly = index * 2 + (this.y - 1)
      mps.push(new MovePoint(lx, ly, { x: this.x - 1, y: this.y }))

      // 右
      const rx = this.x + 2
      const ry = ly
      mps.push(new MovePoint(rx, ry, { x: this.x + 1, y: this.y }))

      // 上
      const tx = index * 2 + (this.x - 1)
      const ty = this.y - 2
      mps.push(new MovePoint(tx, ty, { x: this.x, y: this.y - 1 }))

      // 下
      const bx = tx
      const by = this.y + 2
      mps.push(new MovePoint(bx, by, { x: this.x, y: this.y + 1 }))
    }
    return this.filterMovePoints(mps, pl, board)
  }
  /**
   * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
   * @param list 移动点列表
   * @param pl 棋子列表
   * @returns 返回这个棋子可以移动点列表
   */
  filterMovePoints(list: MovePointList, pl: PieceList, board?: Board): MovePointList {
    const b = board || buildBoardIndex(pl)
    const result: MovePointList = []
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (item.x < 0 || item.x > 8 || item.y < 0 || item.y > 9) continue
      const atItem = b[posIdx(item.x, item.y)]
      if (atItem && atItem.side === this.side) continue
      // 蹩马腿：disPoint 位置有任意棋子则不可达
      if (b[posIdx(item.disPoint.x, item.disPoint.y)]) continue
      result.push(item)
    }
    return result
  }
  /**
   * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
   * @param p 坐标点 或 移动点
   * @param pieceList 棋盘列表
   * @returns 返回移动结果
   */
  move(p: Point, pieceList: PieceList): MoveResult {
    const mps = this.getMovePoints(pieceList)
    const mp = mps.find(i => p.x === i.x && p.y === i.y)
    if (!mp) {
      return { flag: false, message: `${this}走法错误，不可以落在${p}上` }
    }
    const hasPeice = pieceList.find(i => i.x === mp.disPoint.x && i.y === mp.disPoint.y)
    if (hasPeice) {
      return { flag: false, message: `${this}走法错误，${hasPeice}卡住了${this.name}的去向` }
    }
    return { flag: true }
  }
}

/**
 * 象棋：象
 */
export class ElephantPiece extends HorsePiece {
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList, board?: Board): MovePointList {
    const mps: MovePointList = []
    for (let index = 0; index < 2; index++) {
      // 上
      const tx = this.x - 2 + index * 4
      const ty = this.y - 2
      const tdx = this.x - 1 + index * 2
      const tdy = this.y - 1
      mps.push(new MovePoint(tx, ty, { x: tdx, y: tdy }))

      // 下
      const bx = this.x - 2 + index * 4
      const by = this.y + 2
      const bdx = tdx
      const bdy = this.y + 1
      mps.push(new MovePoint(bx, by, { x: bdx, y: bdy }))
    }
    return this.filterMovePoints(mps, pl, board)
  }
  /**
   * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
   * @param list 移动点列表
   * @param pl 棋子列表
   * @returns 返回这个棋子可以移动点列表
   */
  filterMovePoints(list: MovePointList, pl: PieceList, board?: Board) {
    const b = board || buildBoardIndex(pl)
    const result: MovePointList = []
    const minY = this.side === 'RED' ? 5 : 0
    const maxY = this.side === 'RED' ? 9 : 4
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (item.x < 0 || item.x > 8 || item.y < 0 || item.y > 9) continue
      if (item.y < minY || item.y > maxY) continue
      const atItem = b[posIdx(item.x, item.y)]
      if (atItem && atItem.side === this.side) continue
      // 塞象眼：disPoint 位置有任意棋子则不可达
      if (b[posIdx(item.disPoint.x, item.disPoint.y)]) continue
      result.push(item)
    }
    return result
  }
}

/**
 * 象棋：士
 */
export class KnightPiece extends ElephantPiece {
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList, board?: Board): MovePointList {
    const mps: MovePointList = []
    for (let index = 0; index < 2; index++) {
      // 上
      const tx = this.x - 1 + index * 2
      const ty = this.y - 1
      mps.push(new MovePoint(tx, ty, notExistPoint))

      //下
      const bx = this.x - 1 + index * 2
      const by = this.y + 1
      mps.push(new MovePoint(bx, by, notExistPoint))
    }
    return this.filterMovePoints(mps, pl, board)
  }
  /**
   * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
   * @param list 移动点列表
   * @param pl 棋子列表
   * @returns 返回这个棋子可以移动点列表
   */
  filterMovePoints(list: MovePointList, pl: PieceList, board?: Board) {
    const b = board || buildBoardIndex(pl)
    const result: MovePointList = []
    const minY = this.side === 'RED' ? 7 : 0
    const maxY = this.side === 'RED' ? 9 : 2
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      // 九宫范围限制
      if (item.x < 3 || item.x > 5) continue
      if (item.y < minY || item.y > maxY) continue
      const atItem = b[posIdx(item.x, item.y)]
      if (atItem && atItem.side === this.side) continue
      result.push(item)
    }
    return result
  }
}

/**
 * 象棋：将领
 */
export class GeneralPiece extends KnightPiece {
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList, board?: Board): MovePointList {
    const mps: MovePointList = [
      new MovePoint(this.x - 1, this.y, notExistPoint),
      new MovePoint(this.x + 1, this.y, notExistPoint),
      new MovePoint(this.x, this.y - 1, notExistPoint),
      new MovePoint(this.x, this.y + 1, notExistPoint)
    ]
    return this.filterMovePoints(mps, pl, board)
  }
}

/**
 * 象棋：炮
 */
export class CannonPiece extends RookPiece {
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表（炮：直行空位 + 隔一子打吃）
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList, board?: Board): MovePointList {
    const xpoints: MovePointList = []
    const ypoints: MovePointList = []
    if (!pl) {
      for (let x = 0; x < 9; x++) {
        if (x !== this.x) xpoints.push(new MovePoint(x, this.y, notExistPoint))
      }
      for (let y = 0; y < 10; y++) {
        if (y !== this.y) ypoints.push(new MovePoint(this.x, y, notExistPoint))
      }
      return xpoints.concat(ypoints)
    }
    const b = board || buildBoardIndex(pl)
    // 分方向扫描：炮架 = 离炮最近的棋子，必须从自身向两侧扫描
    // 左侧：x 递减，遇到第一个棋子为炮架，炮架之后的下一个敌方可吃
    let mountX = false
    for (let x = this.x - 1; x >= 0; x--) {
      const pc = b[x + this.y * 9]
      if (!mountX) {
        if (!pc) {
          xpoints.push(new MovePoint(x, this.y, notExistPoint))
        } else {
          mountX = true
        }
      } else {
        if (pc) {
          if (pc.side !== this.side) {
            xpoints.push(new MovePoint(x, this.y, notExistPoint))
          }
          break
        }
      }
    }
    // 右侧：x 递增（独立炮架）
    mountX = false
    for (let x = this.x + 1; x < 9; x++) {
      const pc = b[x + this.y * 9]
      if (!mountX) {
        if (!pc) {
          xpoints.push(new MovePoint(x, this.y, notExistPoint))
        } else {
          mountX = true
        }
      } else {
        if (pc) {
          if (pc.side !== this.side) {
            xpoints.push(new MovePoint(x, this.y, notExistPoint))
          }
          break
        }
      }
    }
    // 上侧：y 递减（独立炮架）
    let mountY = false
    for (let y = this.y - 1; y >= 0; y--) {
      const pc = b[this.x + y * 9]
      if (!mountY) {
        if (!pc) {
          ypoints.push(new MovePoint(this.x, y, notExistPoint))
        } else {
          mountY = true
        }
      } else {
        if (pc) {
          if (pc.side !== this.side) {
            ypoints.push(new MovePoint(this.x, y, notExistPoint))
          }
          break
        }
      }
    }
    // 下侧：y 递增（独立炮架）
    mountY = false
    for (let y = this.y + 1; y < 10; y++) {
      const pc = b[this.x + y * 9]
      if (!mountY) {
        if (!pc) {
          ypoints.push(new MovePoint(this.x, y, notExistPoint))
        } else {
          mountY = true
        }
      } else {
        if (pc) {
          if (pc.side !== this.side) {
            ypoints.push(new MovePoint(this.x, y, notExistPoint))
          }
          break
        }
      }
    }
    // 保持与旧版一致的升序输出顺序
    xpoints.sort((a, b) => a.x - b.x)
    ypoints.sort((a, b) => a.y - b.y)
    return xpoints.concat(ypoints)
  }

  /**
   * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
   * @param p 坐标点 或 移动点
   * @param pieceList 棋盘列表
   * @returns 返回移动结果
   */
  move(p: Point, pieceList: PieceList): MoveResult {
    if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
      return { flag: false, message: '移动位置不符合规则' }
    }
    // 如果在 x, y 轴上移动
    if (this.y === p.y || this.x === p.x) {
      const list = this.getMoveObstaclePieceList(p, pieceList)
      // console.log(list);
      // 炮架 数量超过1个
      if (list.length > 1) {
        return { flag: false, message: '移动距离存在多个炮架：' + list.join('---') }
      }
      // 有炮架 且 炮架位置 就是目标位置
      if (list.length === 1 && list[0].x === p.x && list[0].y === p.y) {
        return { flag: false, message: '无法击中敌方棋子(缺少炮架)，移动无效' }
      }
      const hasPeice = pieceList.find(i => i.x === p.x && i.y === p.y)
      if (list.length === 1) {
        if (hasPeice) {
          return { flag: true }
        }
        return { flag: false, message: '无法击中敌方棋子，移动无效' }
      }
      // 无炮架  且 目标位置有敌方棋子
      if (list.length === 0 && hasPeice) {
        return { flag: false, message: '无法击中敌方棋子(缺少炮架)，移动无效' }
      }
      // console.log(`${this}可以移动到点${p}`);
      return { flag: true }
    }
    return { flag: false, message: '移动位置不符合规则' }
  }
}

/**
 * 象棋：兵
 */
export class SoldierPiece extends HorsePiece {
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList, board?: Board): MovePointList {
    const isCross = this.side === 'RED' ? this.y <= 4 : this.y >= 5
    const step = this.side === 'RED' ? -1 : +1
    const startMp = new MovePoint(this.x, this.y + step, notExistPoint)
    const mps: MovePointList = isCross
      ? [
          startMp,
          new MovePoint(this.x - 1, this.y, notExistPoint),
          new MovePoint(this.x + 1, this.y, notExistPoint)
        ]
      : [startMp]
    return this.filterMovePoints(mps, pl, board)
  }
}

/**
 * 象棋棋子，包含了车、马、炮、象、士、将、兵
 */
export type ChessOfPeice =
  | RookPiece
  | HorsePiece
  | ElephantPiece
  | KnightPiece
  | GeneralPiece
  | CannonPiece
  | SoldierPiece

/**
 * 象棋棋子列表
 */
export type PieceList = Array<ChessOfPeice>

/**
 * 象棋棋子名字
 * @example "车","車" // 都是棋子 RookPiece 类
 * @example "马","馬" // 都是棋子 HorsePiece 类
 * @example "相","象" // 都是棋子 ElephantPiece 类
 * @example "士","仕" // 都是棋子 KnightPiece 类
 * @example "帅","将" // 都是棋子 GeneralPiece 类
 * @example "炮","砲" // 都是棋子 CannonPiece 类
 * @example "兵","卒" // 都是棋子 SoldierPiece 类
 */
export type ChessOfPeiceName =
  | '車'
  | '车'
  | '馬'
  | '马'
  | '象'
  | '相'
  | '仕'
  | '士'
  | '砲'
  | '炮'
  | '卒'
  | '兵'
  | '将'
  | '帅'

/**
 * 象棋棋子Map数据类型
 * 根据名字返回一个函数
 * 函数参数需要象棋初始化所需的数据
 * 返回棋子实例
 */
export type ChessOfPeiceMap = {
  [prop in ChessOfPeiceName]: (info: PieceInfo) => ChessOfPeice
}

/**
 * 象棋棋子map表
 * @example chessOfPeiceMap["车"]({ ... }:PieceInfo) // 返回一个实例棋子 RookPiece
 * @example chessOfPeiceMap["马"]({ ... }:PieceInfo) // 返回一个实例棋子 HorsePiece
 * @example chessOfPeiceMap["炮"]({ ... }:PieceInfo) // 返回一个实例棋子 CannonPiece
 * @example chessOfPeiceMap["相"]({ ... }:PieceInfo) // 返回一个实例棋子 ElephantPiece
 * @example chessOfPeiceMap["士"]({ ... }:PieceInfo) // 返回一个实例棋子 KnightPiece
 * @example chessOfPeiceMap["帅"]({ ... }:PieceInfo) // 返回一个实例棋子 GeneralPiece
 * @example chessOfPeiceMap["兵"]({ ... }:PieceInfo) // 返回一个实例棋子 SoldierPiece
 */
export const chessOfPeiceMap: ChessOfPeiceMap = {
  仕: (info: PieceInfo) => new KnightPiece(info),
  兵: (info: PieceInfo) => new SoldierPiece(info),
  卒: (info: PieceInfo) => new SoldierPiece(info),
  士: (info: PieceInfo) => new KnightPiece(info),
  将: (info: PieceInfo) => new GeneralPiece(info),
  帅: (info: PieceInfo) => new GeneralPiece(info),
  炮: (info: PieceInfo) => new CannonPiece(info),
  相: (info: PieceInfo) => new ElephantPiece(info),
  砲: (info: PieceInfo) => new CannonPiece(info),
  象: (info: PieceInfo) => new ElephantPiece(info),
  車: (info: PieceInfo) => new RookPiece(info),
  车: (info: PieceInfo) => new RookPiece(info),
  馬: (info: PieceInfo) => new HorsePiece(info),
  马: (info: PieceInfo) => new HorsePiece(info)
}
