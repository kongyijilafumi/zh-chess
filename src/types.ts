import { PeiceList, Piece, defaultPieceDraw } from "./piece"

/**
 * 棋子双方
 */
export type PeiceSide = "RED" | "BLACK"

export interface PeicePositonPoint {
  x: number
  y: number
}

export interface PeiceInputInfo extends PeicePositonPoint, PeiceUtils {
  name: string
  side: PeiceSide
  isChoose: boolean
  draw: typeof defaultPieceDraw
  isLastMove: boolean
}


export interface PeiceUtils {
  draw: typeof defaultPieceDraw
  move: (this: Piece, pos: MovePoint | PeicePositonPoint, peiceList: PeiceList) => MoveResult
  getMovePointList: (this: Piece, pl: PeiceList) => MovePointList
  drawMovePointList: (this: Piece, pl: PeiceList, startX: number, startY: number, width: number, height: number, radius: number, color: string, ctx: CanvasRenderingContext2D) => void
}


export type MovePoint = PeicePositonPoint & {
  disPos: PeicePositonPoint
}


export type MovePointList = MovePoint[]
export type MoveResult = { flag: true } | { flag: false, message: string }