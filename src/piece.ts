import { moveFailMessage } from "./rule";
import { MovePoint, MovePointList, MoveResult, PeiceInputInfo, PeicePositonPoint, PeiceSide, PeiceUtils } from "./types";

export interface PeiceCurrentInfo {
  side: PeiceSide;
  name: string;
  x: number;
  y: number;
  isChoose: boolean;
  isLastMove: boolean;
}
export class Piece implements PeiceInputInfo {
  name: string;
  side: PeiceSide;
  x: number;
  y: number;
  isChoose: boolean;
  isLastMove: boolean;
  draw: typeof defaultPieceDraw;
  move: (this: Piece, pos: PeicePositonPoint | MovePoint, peiceList: PeiceList) => MoveResult;
  getMovePointList: (this: Piece, pl: PeiceList) => MovePointList;
  drawMovePointList: (this: Piece, pl: PeiceList, startX: number, startY: number, width: number, height: number, radius: number, color: string, ctx: CanvasRenderingContext2D) => void;
  constructor(pieceInfo: PeiceInputInfo) {
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
    this.drawMovePointList = pieceInfo.drawMovePointList
  }
  getInfo(): PeiceCurrentInfo {
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
export type PeiceList = Piece[]

export function defaultPieceDraw(this: Piece, startX: number, startY: number, endX: number, endY: number, ctx?: CanvasRenderingContext2D) {
  if (ctx) {
    let centerX = (startX + endX) / 2, centerY = (startY + endY) / 2, radius = (endX - startX) / 2;
    let borderColor = this.isChoose ? '#fdec9e' : "ff0000"
    let textColor = this.side === "RED" ? "#ff000" : "#000"
    if (this.isChoose || this.isLastMove) {
      radius = radius / 0.9
    }
    drawPieceBackground(centerX, centerY, radius, "#fdec9e", "#000", ctx)
    // clear shadow
    clearShadow(ctx)
    drawPieceBoder(centerX, centerY, radius, 0, Math.PI * 2, borderColor, ctx)
    drawPieceBoder(centerX, centerY, radius - 3, 0, Math.PI * 2, borderColor, ctx)
    drawPieceText(centerX, centerY, "12px yahei", this.name, textColor, "center", "middle", ctx)
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
export const drawMovePointList = (x: number, y: number, radius: number, color: string, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = color
  ctx.beginPath();
  ctx.arc(x, y, radius * .25, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill()
}
export const notExistPoint: PeicePositonPoint = {
  x: 999,
  y: 999
}
export function defaultPieceMovePointDraw(this: Piece, pl: PeiceList, startX: number, startY: number, width: number, height: number, radius: number, color: string, ctx: CanvasRenderingContext2D) {
  this.getMovePointList(pl).forEach(p => {
    let x = startX + width * p.x
    let y = startY + height * p.y
    drawMovePointList(x, y, radius, color, ctx)
  })
}

export function defaultPieceMove(this: Piece, pos: PeicePositonPoint | MovePoint, pl: PeiceList): MoveResult {
  let mps = this.getMovePointList(pl)
  let find = mps.find(m => m.x === pos.x && m.y === pos.y)
  if (find) {
    return { flag: true }
  }
  return moveFailMessage()
}
export const movePointPush = (pointMinX: number, pointMaxX: number, pointMinY: number, pointMaxY: number, x: number, y: number, disPos: PeicePositonPoint, pl: (PeiceCurrentInfo | null)[][], arr: MovePointList) => {
  if (x > pointMaxX || x < pointMinX || y < pointMinY || y > pointMaxY || (pl[disPos.x] && pl[disPos.x][disPos.y])) {
    return
  }
  arr.push({ x, y, disPos })
}
export function getPiecePointArr(pl: PeiceList) {
  let arr: Array<Array<null | PeiceCurrentInfo>> = []
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
export const ChariotPieceDefaultUtils: PeiceUtils = {
  draw: defaultPieceDraw,
  getMovePointList(pl) {
    const points: MovePointList = []
    let peicePosArr = getPiecePointArr(pl)
    let diffKey: ["x", "y"] = ["x", "y"], boundary = [[0, 8], [0, 9]]
    for (let index = 0; index < 2; index++) {
      const key = diffKey[index];
      let minNum = this[key], maxNum = this[key], min = boundary[index][0], max = boundary[index][1];
      let isDiffX = key === "x"
      while (minNum >= min || maxNum <= max) {
        let x = --minNum, y = ++maxNum;
        if (x >= min) {
          let info = isDiffX ? peicePosArr[x][this.y] : peicePosArr[this.x][x]
          let p = isDiffX ? { x, y: this.y, disPos: notExistPoint } : { x: this.x, y: x, disPos: notExistPoint }
          if (!info || info.side !== this.side) {
            points.push(p)
          }
          if (info) {
            minNum = min - 1
          }
        }
        if (y <= max) {
          let info = isDiffX ? peicePosArr[y][this.y] : peicePosArr[this.x][y]
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
  drawMovePointList: defaultPieceMovePointDraw
}
// 马
export const HorsePieceDefaultUtils: PeiceUtils = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  drawMovePointList: defaultPieceMovePointDraw,
  getMovePointList(pl) {
    const mps: MovePointList = []
    const peicePosArr = getPiecePointArr(pl)
    for (let index = 0; index < 2; index++) {
      // 左
      const lx = this.x - 2
      const ly = index * 2 + (this.y - 1)
      movePointPush(0, 8, 0, 9, lx, ly, { x: this.x - 1, y: this.y }, peicePosArr, mps)

      // 右
      const rx = this.x + 2
      const ry = ly
      movePointPush(0, 8, 0, 9, rx, ry, { x: this.x + 1, y: this.y }, peicePosArr, mps)


      // 上
      const tx = index * 2 + (this.x - 1)
      const ty = this.y - 2
      movePointPush(0, 8, 0, 9, tx, ty, { x: this.x, y: this.y - 1 }, peicePosArr, mps)

      // 下
      const bx = tx
      const by = this.y + 2
      movePointPush(0, 8, 0, 9, bx, by, { x: this.x, y: this.y + 1 }, peicePosArr, mps)

    }
    return mps
  },
}
// 象
export const ElephantPieceDefaultUtils: PeiceUtils = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  drawMovePointList: defaultPieceMovePointDraw,
  getMovePointList(pl) {
    const mps: MovePointList = [], peicePosArr = getPiecePointArr(pl)
    let isRed = this.side === "RED"
    let minY = isRed ? 0 : 5, maxY = isRed ? 9 : 4;
    for (let index = 0; index < 2; index++) {
      // 上
      const tx = this.x - 2 + index * 4
      const ty = this.y - 2
      const tdx = this.x - 1 + index * 2
      const tdy = this.y - 1
      movePointPush(0, 8, minY, maxY, tx, ty, { x: tdx, y: tdy }, peicePosArr, mps)

      // 下
      const bx = this.x - 2 + index * 4
      const by = this.y + 2
      const bdx = tdx
      const bdy = this.y + 1
      movePointPush(0, 8, minY, maxY, bx, by, { x: bdx, y: bdy }, peicePosArr, mps)
    }
    return mps
  },
}
// 士
export const GuardPieceDefaultUtils: PeiceUtils = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  drawMovePointList: defaultPieceMovePointDraw,
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
export const GeneralPieceDefaultUtils: PeiceUtils = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  drawMovePointList: defaultPieceMovePointDraw,
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
export const CannonPieceDefaultUtils: PeiceUtils = {
  draw: defaultPieceDraw,
  move: defaultPieceMove,
  drawMovePointList: defaultPieceMovePointDraw,
  getMovePointList(pl) {
    const points: MovePointList = []
    let peicePosArr = getPiecePointArr(pl)
    let diffKey: ["x", "y"] = ["x", "y"], boundary = [[0, 8], [0, 9]]
    for (let index = 0; index < 2; index++) {
      const key = diffKey[index];
      let minNum = this[key], maxNum = this[key], min = boundary[index][0], max = boundary[index][1];
      let isDiffX = key === "x"
      while (minNum >= min || maxNum <= max) {
        let x = --minNum, y = ++maxNum;
        if (x >= min) {
          let info = isDiffX ? peicePosArr[x][this.y] : peicePosArr[this.x][x]
          let p = isDiffX ? { x, y: this.y, disPos: notExistPoint } : { x: this.x, y: x, disPos: notExistPoint }
          if (!info) {
            points.push(p)
            continue
          }
          let side = info.side
          let x1 = x - 1
          while (x1 >= min) {
            let next = isDiffX ? peicePosArr[x1][this.y] : peicePosArr[this.x][x1]
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
          let info = isDiffX ? peicePosArr[y][this.y] : peicePosArr[this.x][y]
          let p = isDiffX ? { x: y, y: this.y, disPos: notExistPoint } : { x: this.x, y, disPos: notExistPoint }
          if (!info) {
            points.push(p)
            continue
          }
          let side = info.side
          let y1 = y + 1
          while (y1 <= max) {
            let next = isDiffX ? peicePosArr[y1][this.y] : peicePosArr[this.x][y1]
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
export const SoldierPieceDefaultUtils: PeiceUtils = {
  move: defaultPieceMove,
  draw: defaultPieceDraw,
  drawMovePointList: defaultPieceMovePointDraw,
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

