import { moveFailMessage } from "./rule";
import { MovePoint, MovePointList, MoveResult, PieceInputInfo, PiecePositonPoint, PieceSide, PieceMethods } from "./types";

export interface PieceCurrentInfo {
  side: PieceSide;
  name: string;
  x: number;
  y: number;
  isChoose: boolean;
  isLastMove: boolean;
}
export class Piece implements PieceInputInfo {
  name: string;
  side: PieceSide;
  x: number;
  y: number;
  isChoose: boolean;
  isLastMove: boolean;
  draw: (this: Piece, x: number, y: number, radius: number, ctx?: CanvasRenderingContext2D | undefined) => void;
  move: (this: Piece, pos: PiecePositonPoint | MovePoint, PieceList: PieceList) => MoveResult;
  getMovePointList: (this: Piece, pl: PieceList) => MovePointList;
  constructor(pieceInfo: PieceInputInfo) {
    if (!pieceInfo) {
      throw Error("请输入正确初始化棋子信息")
    }
    this.draw = pieceInfo.draw || defaultPieceDraw
    this.name = pieceInfo.name
    this.side = pieceInfo.side
    this.isChoose = pieceInfo.isChoose
    this.x = pieceInfo.x
    this.y = pieceInfo.y
    this.isLastMove = pieceInfo.isLastMove
    this.move = pieceInfo.move
    this.getMovePointList = pieceInfo.getMovePointList
  }
  getInfo(): PieceCurrentInfo {
    return {
      side: this.side,
      name: this.name,
      x: this.x,
      y: this.y,
      isChoose: this.isChoose,
      isLastMove: this.isLastMove
    }
  }
  update(x: number, y: number) {
    this.x = x
    this.y = y
  }
  setLast(b: boolean) {
    this.isLastMove = b
  }
}
export type PieceList = Piece[]

export function defaultPieceDraw(this: Piece, x: number, y: number, radius: number, ctx?: CanvasRenderingContext2D) {
  if (ctx) {
    let borderColor = this.isChoose ? '#ff0000' : "#000"
    let textColor = this.side === "RED" ? "#ff0000" : "#000"
    if (this.isChoose || this.isLastMove) {
      radius = radius / 0.9
    }
    drawPieceBackground(x, y, radius, "#fdec9e", "#000", ctx)
    // clear shadow
    clearShadow(ctx)

    drawPieceBoder(x, y, radius, 0, Math.PI * 2, borderColor, ctx)
    drawPieceBoder(x, y, radius - 3, 0, Math.PI * 2, borderColor, ctx)
    drawPieceText(x, y, "12px yahei", this.name, textColor, "center", "middle", ctx)
  }
}
export const drawPieceBackground = (x: number, y: number, radius: number, bgColor: string, shadowColor: string, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = bgColor
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  drawPieceShadow(2, 3, 4, shadowColor, ctx)
  ctx.closePath()
  ctx.fill()
}
export const clearShadow = (ctx: CanvasRenderingContext2D) => {
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
export const drawPieceShadow = (x: number, y: number, blur: number, color: string, ctx: CanvasRenderingContext2D) => {
  ctx.shadowOffsetX = x;
  ctx.shadowOffsetY = y;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}
export const drawPieceText = (x: number, y: number, fontStyle: string, text: string, color: string, textAlign: CanvasTextAlign, baseLine: CanvasTextBaseline, ctx: CanvasRenderingContext2D) => {
  ctx.textAlign = textAlign;
  ctx.textBaseline = baseLine;
  ctx.fillStyle = color;
  ctx.font = fontStyle;
  ctx.fillText(text, x, y);
}
export const drawPieceBoder = (x: number, y: number, radius: number, startAngle: number, endAngle: number, strokeStyle: string, ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = strokeStyle
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.stroke();
}
export const drawMovePoint = (x: number, y: number, radius: number, color: string, ctx?: CanvasRenderingContext2D) => {
  if (ctx) {
    ctx.fillStyle = color
    ctx.beginPath();
    ctx.arc(x, y, radius * .25, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill()
  }
}
export const notExistPoint: PiecePositonPoint = {
  x: 999,
  y: 999
}

export function defaultPieceMove(this: Piece, pos: PiecePositonPoint | MovePoint, pl: PieceList): MoveResult {
  let mps = this.getMovePointList(pl)
  let find = mps.find(m => m.x === pos.x && m.y === pos.y)
  if (find) {
    return { flag: true }
  }
  return moveFailMessage()
}
export const movePointPush = (pointMinX: number, pointMaxX: number, pointMinY: number, pointMaxY: number, x: number, y: number, disPos: PiecePositonPoint, pl: (PieceCurrentInfo | null)[][], arr: MovePointList) => {
  if (x > pointMaxX || x < pointMinX || y < pointMinY || y > pointMaxY || (pl[disPos.x] && pl[disPos.x][disPos.y])) {
    return
  }
  arr.push({ x, y, disPos })
}
export function getPiecePointArr(pl: PieceList) {
  let arr: Array<Array<null | PieceCurrentInfo>> = []
  for (let index = 0; index < 9; index++) {
    arr[index] = []
    for (let j = 0; j < 10; j++) {
      arr[index] = [null]
    }
  }
  pl.forEach(item => {
    arr[item.x][item.y] = item.getInfo()
  })
  return arr
}
// 车
export const ChariotPieceDefaultMethods: PieceMethods = {
  draw: defaultPieceDraw,
  getMovePointList(pl) {
    const points: MovePointList = []
    let PiecePosArr = getPiecePointArr(pl)
    let diffKey: ["x", "y"] = ["x", "y"], boundary = [[0, 8], [0, 9]]
    for (let index = 0; index < 2; index++) {
      const key = diffKey[index];
      let minNum = this[key], maxNum = this[key], min = boundary[index][0], max = boundary[index][1];
      let isDiffX = key === "x"
      while (minNum >= min || maxNum <= max) {
        let x = --minNum, y = ++maxNum;
        if (x >= min) {
          let info = isDiffX ? PiecePosArr[x][this.y] : PiecePosArr[this.x][x]
          let p = isDiffX ? { x, y: this.y, disPos: notExistPoint } : { x: this.x, y: x, disPos: notExistPoint }
          if (!info || info.side !== this.side) {
            points.push(p)
          }
          if (info) {
            minNum = min - 1
          }
        }
        if (y <= max) {
          let info = isDiffX ? PiecePosArr[y][this.y] : PiecePosArr[this.x][y]
          let p = isDiffX ? { x: y, y: this.y, disPos: notExistPoint } : { x: this.x, y, disPos: notExistPoint }
          if (!info || info.side !== this.side) {
            points.push(p)
          }
          if (info) {
            maxNum = max + 1
          }
        }
      }
    }
    return points
  },
  move: defaultPieceMove,
}
// 马
export const HorsePieceDefaultMethods: PieceMethods = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  getMovePointList(pl) {
    const mps: MovePointList = []
    const PiecePosArr = getPiecePointArr(pl)
    for (let index = 0; index < 2; index++) {
      // 左
      const lx = this.x - 2
      const ly = index * 2 + (this.y - 1)
      movePointPush(0, 8, 0, 9, lx, ly, { x: this.x - 1, y: this.y }, PiecePosArr, mps)

      // 右
      const rx = this.x + 2
      const ry = ly
      movePointPush(0, 8, 0, 9, rx, ry, { x: this.x + 1, y: this.y }, PiecePosArr, mps)


      // 上
      const tx = index * 2 + (this.x - 1)
      const ty = this.y - 2
      movePointPush(0, 8, 0, 9, tx, ty, { x: this.x, y: this.y - 1 }, PiecePosArr, mps)

      // 下
      const bx = tx
      const by = this.y + 2
      movePointPush(0, 8, 0, 9, bx, by, { x: this.x, y: this.y + 1 }, PiecePosArr, mps)

    }
    return mps
  },
}
// 象
export const ElephantPieceDefaultMethods: PieceMethods = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  getMovePointList(pl) {
    const mps: MovePointList = [], PiecePosArr = getPiecePointArr(pl)
    let isRed = this.side === "RED"
    let minY = isRed ? 0 : 5, maxY = isRed ? 9 : 4;
    for (let index = 0; index < 2; index++) {
      // 上
      const tx = this.x - 2 + index * 4
      const ty = this.y - 2
      const tdx = this.x - 1 + index * 2
      const tdy = this.y - 1
      movePointPush(0, 8, minY, maxY, tx, ty, { x: tdx, y: tdy }, PiecePosArr, mps)

      // 下
      const bx = this.x - 2 + index * 4
      const by = this.y + 2
      const bdx = tdx
      const bdy = this.y + 1
      movePointPush(0, 8, minY, maxY, bx, by, { x: bdx, y: bdy }, PiecePosArr, mps)
    }
    return mps
  },
}
// 士
export const GuardPieceDefaultMethods: PieceMethods = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  getMovePointList() {
    const mps: MovePointList = []
      , isRed = this.side === "RED"
      , minY = isRed ? 7 : 0, maxY = isRed ? 9 : 2;
    for (let index = 0; index < 2; index++) {
      // 上
      const tx = this.x - 1 + index * 2
      const ty = this.y - 1
      movePointPush(3, 5, minY, maxY, tx, ty, notExistPoint, [], mps)

      // 下
      const bx = this.x - 1 + index * 2
      const by = this.y + 1
      movePointPush(3, 5, minY, maxY, bx, by, notExistPoint, [], mps)
    }
    return mps
  },
}
// 帅
export const GeneralPieceDefaultMethods: PieceMethods = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  getMovePointList() {
    const mps: MovePointList = []
      , isRed = this.side === "RED"
      , minY = isRed ? 7 : 0, maxY = isRed ? 9 : 2;
    movePointPush(3, 5, minY, maxY, this.x - 1, this.y, notExistPoint, [], mps)
    movePointPush(3, 5, minY, maxY, this.x + 1, this.y, notExistPoint, [], mps)
    movePointPush(3, 5, minY, maxY, this.x, this.y - 1, notExistPoint, [], mps)
    movePointPush(3, 5, minY, maxY, this.x, this.y + 1, notExistPoint, [], mps)
    return mps
  },
}
// 炮
export const CannonPieceDefaultMethods: PieceMethods = {
  draw: defaultPieceDraw,
  move: defaultPieceMove,
  getMovePointList(pl) {
    const points: MovePointList = []
    let PiecePosArr = getPiecePointArr(pl)
    let diffKey: ["x", "y"] = ["x", "y"], boundary = [[0, 8], [0, 9]]
    for (let index = 0; index < 2; index++) {
      const key = diffKey[index];
      let minNum = this[key], maxNum = this[key], min = boundary[index][0], max = boundary[index][1];
      let isDiffX = key === "x"
      while (minNum >= min || maxNum <= max) {
        let x = --minNum, y = ++maxNum;
        if (x >= min) {
          let info = isDiffX ? PiecePosArr[x][this.y] : PiecePosArr[this.x][x]
          let p = isDiffX ? { x, y: this.y, disPos: notExistPoint } : { x: this.x, y: x, disPos: notExistPoint }
          if (!info) {
            points.push(p)
            continue
          }
          let side = info.side
          let x1 = x - 1
          while (x1 >= min) {
            let next = isDiffX ? PiecePosArr[x1][this.y] : PiecePosArr[this.x][x1]
            x1--
            if (!next) {
              continue
            }
            if (next.side === side) {
              points.push({ x: next.x, y: next.y, disPos: notExistPoint })
            }
            break
          }
          minNum = min - 1
        }
        if (y <= max) {
          let info = isDiffX ? PiecePosArr[y][this.y] : PiecePosArr[this.x][y]
          let p = isDiffX ? { x: y, y: this.y, disPos: notExistPoint } : { x: this.x, y, disPos: notExistPoint }
          if (!info) {
            points.push(p)
            continue
          }
          let side = info.side
          let y1 = y + 1
          while (y1 <= max) {
            let next = isDiffX ? PiecePosArr[y1][this.y] : PiecePosArr[this.x][y1]
            y1++
            if (!next) {
              continue
            }
            if (next.side === side) {
              points.push({ x: next.x, y: next.y, disPos: notExistPoint })
            }
            break
          }
          maxNum = max + 1
        }
      }
    }
    return points
  },
}

// 兵
export const SoldierPieceDefaultMethods: PieceMethods = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  getMovePointList() {
    const mps: MovePointList = [],
      isCross = this.side === "RED" ? (this.y <= 4) : (this.y >= 5),
      step = this.side === "RED" ? -1 : +1;
    movePointPush(0, 8, 0, 9, this.x, this.y + step, notExistPoint, [], mps)
    if (isCross) {
      movePointPush(0, 8, 0, 9, this.x + 1, this.y, notExistPoint, [], mps)
      movePointPush(0, 8, 0, 9, this.x - 1, this.y, notExistPoint, [], mps)
    }
    return mps
  },
}
