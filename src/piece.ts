import { PieceInfo, PieceSide, Point, MovePoint, MoveResult, MovePointList, PeicePosInfo } from './types';
const notExistPoint = { x: 10, y: 10 }
const findPiece = (pl: PieceList, p: Point) => pl.find(item => item.x === p.x && item.y === p.y)
export class Piece implements PieceInfo {
  x: number
  y: number
  name: ChessOfPeiceName
  side: PieceSide
  isChoose: boolean
  constructor(pieceInfo: PieceInfo) {
    this.x = pieceInfo.x
    this.y = pieceInfo.y
    this.name = pieceInfo.name
    this.side = pieceInfo.side
    this.isChoose = pieceInfo.isChoose || false
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
  filterMovePoints(list: MovePointList, pl: PieceList): MovePointList {
    return list.filter(i => {
      const pointHasSameSidePeice = pl.find(p => p.x === i.x && p.y === i.y && p.side === this.side)
      return i.x >= 0 && i.x <= 8 && i.y >= 0 && i.y <= 9 && !pointHasSameSidePeice
    })
  }
  /**
   * 返回当前棋子的坐标信息
   * @returns 包含 name side x y 信息
   */
  getCurrentInfo(): PeicePosInfo {
    return {
      side: this.side,
      name: this.name,
      x: this.x,
      y: this.y
    }
  }
  update(p: Point) {
    this.x = p.x
    this.y = p.y
  }
  draw(ctx: CanvasRenderingContext2D,
    startX: number, startY: number,
    gridWidth: number, gridHeight: number,
    gridDiffX: number, gridDiffY: number,
    radius: number,
    textColor: string, bgColor: string) {
    const borderColor = this.isChoose ? "red" : "#000";
    let x = startX + Math.abs(this.x - gridDiffX) * gridWidth;
    let y = startY + Math.abs(this.y - gridDiffY) * gridHeight;
    let r = radius, ty = 0;
    ctx.fillStyle = bgColor;

    const drawBoder = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, startAngle, endAngle);
      ctx.closePath();
      ctx.stroke();
    }

    // 选中动画
    if (this.isChoose) {
      r = r / 0.98
      ty = this.side === "RED" ? -.3 * radius : .3 * radius
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
    ctx.fillText(this.name, x, y + ty);
  }
  getMovePoints(_pl: PieceList): MovePointList {
    return []
  }
  drawMovePoints(ctx: CanvasRenderingContext2D, pl: PieceList, startX: number, startY: number, gridWidth: number, gridHeight: number, gridDiffX: number, gridDiffY: number, radius: number) {
    ctx.fillStyle = "#25dd2a"
    this.getMovePoints(pl).forEach(p => {
      let x = startX + Math.abs(p.x - gridDiffX) * gridWidth;
      let y = startY + Math.abs(p.y - gridDiffY) * gridHeight;
      ctx.beginPath();
      ctx.arc(x, y, radius * .25, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill()
    })
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
    const diffKey = this.x === p.x ? "y" : "x"
    const key = diffKey === "x" ? "y" : "x"
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
      return (isOnSameLine && notSelf && inRangeY) || (isOnSameLine && notSelf && isSameSide && inSameRangeY)
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
      return { flag: false, message: "移动位置不符合规则" }
    }
    // 如果在 x,y 轴上移动
    if (this.y === p.y || this.x === p.x) {
      const list = this.getMoveObstaclePieceList(p, pieceList)
      if (list.length > 0) {
        return { flag: false, message: "移动距离中存在障碍物：" + list.join("---") }
      }
      return { flag: true }
    }
    // console.log("无效移动");
    return { flag: false, message: "移动位置不符合规则" }
  }
  /**
   * 根据棋子列表的坐标获取当前棋子的可以移动点列表
   * @param pl 棋子列表
   * @returns 返回移动点列表
   */
  getMovePoints(pl: PieceList): MovePointList {
    const xpoints: MovePointList = Array.from({ length: 9 }, (_v, k) => new MovePoint(k, this.y, notExistPoint))
    const ypoints: MovePointList = Array.from({ length: 10 }, (_v, k) => new MovePoint(this.x, k, notExistPoint))
    const points = xpoints.concat(ypoints).filter(i => !(this.x === i.x && this.y === i.y))
    if (!pl) {
      return points
    }
    return points.filter(item => this.move(item, pl).flag === true)
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
  getMovePoints(pl: PieceList): MovePointList {
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
    return this.filterMovePoints(mps, pl)
  }
  /**
   * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
   * @param list 移动点列表
   * @param pl 棋子列表
   * @returns 返回这个棋子可以移动点列表
   */
  filterMovePoints(list: MovePointList, pl: PieceList): MovePointList {
    return super.filterMovePoints(list, pl).filter(item => !Boolean(findPiece(pl, item.disPoint)))
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
  getMovePoints(pl: PieceList): MovePointList {
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
    return this.filterMovePoints(mps, pl)
  }
  /**
    * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
    * @param list 移动点列表
    * @param pl 棋子列表
    * @returns 返回这个棋子可以移动点列表
    */
  filterMovePoints(list: MovePointList, pl: PieceList) {
    return list.filter(i => {
      const pointHasSameSidePeice = pl.find(p => p.x === i.x && p.y === i.y && p.side === this.side)
      return !pointHasSameSidePeice &&
        (i.x >= 0 && i.x <= 8) &&
        (i.y >= 0 && i.y <= 9) &&
        (
          (this.side === "RED" && i.y >= 5) ||
          (this.side === "BLACK" && i.y <= 4)
        )
    })
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
  getMovePoints(pl: PieceList): MovePointList {
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
    return this.filterMovePoints(mps, pl)
  }
  /**
    * 根据传入的可以移动点和棋子坐标列表来过滤掉移动点
    * @param list 移动点列表
    * @param pl 棋子列表
    * @returns 返回这个棋子可以移动点列表
    */
  filterMovePoints(list: MovePointList, pl: PieceList) {
    return list.filter(i => {
      const pointHasSameSidePeice = pl.find(p => p.x === i.x && p.y === i.y && p.side === this.side)
      return !pointHasSameSidePeice &&
        (i.x <= 5 && i.x >= 3) &&
        (
          (this.side === "RED" && i.y >= 7 && i.y <= 9) ||
          (this.side === "BLACK" && i.y >= 0 && i.y <= 2)
        )
    })
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
  getMovePoints(pl: PieceList): MovePointList {
    const mps: MovePointList = [
      new MovePoint(this.x - 1, this.y, notExistPoint),
      new MovePoint(this.x + 1, this.y, notExistPoint),
      new MovePoint(this.x, this.y - 1, notExistPoint),
      new MovePoint(this.x, this.y + 1, notExistPoint),
    ]
    return this.filterMovePoints(mps, pl)
  }
}

/**
 * 象棋：炮
 */
export class CannonPiece extends RookPiece {

  /**
   * 根据象棋自己的移动规律以及棋子列表的位置得出是否可以移动到指定的坐标上
   * @param p 坐标点 或 移动点
   * @param pieceList 棋盘列表
   * @returns 返回移动结果
   */
  move(p: Point, pieceList: PieceList): MoveResult {
    if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 9) {
      return { flag: false, message: "移动位置不符合规则" }
    }
    // 如果在 x, y 轴上移动
    if (this.y === p.y || this.x === p.x) {
      const list = this.getMoveObstaclePieceList(p, pieceList)
      // console.log(list);
      // 炮架 数量超过1个
      if (list.length > 1) {
        return { flag: false, message: "移动距离存在多个炮架：" + list.join("---") }
      }
      // 有炮架 且 炮架位置 就是目标位置
      if (list.length === 1 && (list[0].x === p.x && list[0].y === p.y)) {
        return { flag: false, message: "无法击中敌方棋子(缺少炮架)，移动无效" }
      }
      if (list.length === 1) {
        const hasPeice = pieceList.find(i => i.x === p.x && i.y === p.y)
        if (hasPeice) {
          return { flag: true }
        }
        return { flag: false, message: "无法击中敌方棋子，移动无效" }
      }
      // 无炮架  且 目标位置有敌方棋子
      const hasPeice = pieceList.find(i => i.x === p.x && i.y === p.y)
      if (list.length === 0 && hasPeice) {
        return { flag: false, message: "无法击中敌方棋子(缺少炮架)，移动无效" }
      }
      // console.log(`${this}可以移动到点${p}`);
      return { flag: true }
    }
    return { flag: false, message: "移动位置不符合规则" }
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
  getMovePoints(pl: PieceList): MovePointList {
    const isCross = this.side === "RED" ? (this.y <= 4) : (this.y >= 5)
    const step = this.side === "RED" ? -1 : +1
    const startMp = new MovePoint(this.x, this.y + step, notExistPoint)
    const mps: MovePointList = isCross ?
      [
        startMp,
        new MovePoint(this.x - 1, this.y, notExistPoint),
        new MovePoint(this.x + 1, this.y, notExistPoint),
      ] :
      [startMp]
    return this.filterMovePoints(mps, pl)
  }
}

/**
 * 象棋棋子，包含了车、马、炮、象、士、将、兵
 */
export type ChessOfPeice = RookPiece | HorsePiece | ElephantPiece | KnightPiece | GeneralPiece | CannonPiece | SoldierPiece

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
  "車" |
  "车" |
  "馬" |
  "马" |
  "象" |
  "相" |
  "仕" |
  "士" |
  "砲" |
  "炮" |
  "卒" |
  "兵" |
  "将" |
  "帅"

/**
 * 象棋棋子Map数据类型
 * 根据名字返回一个函数
 * 函数参数需要象棋初始化所需的数据
 * 返回棋子实例
 */
export type ChessOfPeiceMap = {
  [prop in ChessOfPeiceName]: (info: PieceInfo) => ChessOfPeice;
};

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
  "仕": (info: PieceInfo) => new KnightPiece(info),
  "兵": (info: PieceInfo) => new SoldierPiece(info),
  "卒": (info: PieceInfo) => new SoldierPiece(info),
  "士": (info: PieceInfo) => new KnightPiece(info),
  "将": (info: PieceInfo) => new GeneralPiece(info),
  "帅": (info: PieceInfo) => new GeneralPiece(info),
  "炮": (info: PieceInfo) => new CannonPiece(info),
  "相": (info: PieceInfo) => new ElephantPiece(info),
  "砲": (info: PieceInfo) => new CannonPiece(info),
  "象": (info: PieceInfo) => new ElephantPiece(info),
  "車": (info: PieceInfo) => new RookPiece(info),
  "车": (info: PieceInfo) => new RookPiece(info),
  "馬": (info: PieceInfo) => new HorsePiece(info),
  "马": (info: PieceInfo) => new HorsePiece(info),
}