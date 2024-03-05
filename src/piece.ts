import { MovePoint, MovePointList, MoveResult, PeiceInputInfo, PeicePositonPoint, PeiceSide, PeiceUtils } from "./types";



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
export const RookPieceDefaultUtils: PeiceUtils = {
  draw: defaultPieceDraw,
  getMovePointList(pl) {
    const xpoints: MovePointList = Array.from({ length: 9 }, (_v, k) => ({ x: k, y: this.y, disPos: notExistPoint }))
    const ypoints: MovePointList = Array.from({ length: 10 }, (_v, k) => ({ x: this.x, y: k, disPos: notExistPoint }))
    const points = xpoints.concat(ypoints).filter(i => !(this.x === i.x && this.y === i.y))
    if (!pl) {
      return points
    }
    return points.filter(item => this.move(item, pl).flag === true)
  },
  move(pos, pl) {
    if (pos.x < 0 || pos.x > 8 || pos.y < 0 || pos.y > 9) {
      return { flag: false, message: "移动位置不符合规则" }
    }
    if (this.y === pos.y || this.x === pos.x) {
      // x 或者 y 轴
      const diffKey = this.x === pos.x ? "y" : "x"
      const key = diffKey === "x" ? "y" : "x"
      // 移动步数
      const diff = this[diffKey] - pos[diffKey]
      const min = diff > 0 ? pos[diffKey] : this[diffKey]
      const max = diff < 0 ? pos[diffKey] : this[diffKey]
      // 障碍物棋子列表
      const list = pl.filter(item => {
        const notSelf = !(this.x === item.x && this.y === item.y)
        const isOnSameLine = item[key] === pos[key]
        const inRangeY = item[diffKey] > min && item[diffKey] < max
        const isSameSide = item.side === this.side
        const inSameRangeY = item[diffKey] >= min && item[diffKey] <= max
        return (isOnSameLine && notSelf && inRangeY) || (isOnSameLine && notSelf && isSameSide && inSameRangeY)
      })
      if (list.length > 0) {
        return { flag: false, message: "移动距离中存在障碍物：" + list.join("---") }
      }
      return { flag: true }
    }
    return { flag: true }
  },
  drawMovePointList(pl: PeiceList, startX: number, startY: number, width: number, height: number, radius: number, color: string, ctx: CanvasRenderingContext2D) {
    this.getMovePointList(pl).forEach(p => {
      let x = startX + width * p.x
      let y = startY + height * p.y
      drawMovePointList(x, y, radius, color, ctx)
    })
  }
}
export interface PeiceCurrentInfo {
  side: PeiceSide;
  name: string;
  x: number;
  y: number;
  isChoose: boolean;
  isLastMove: boolean;
}
export function getPieceArrPoint(pl: PeiceList) {
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

export type PeiceList = Piece[]