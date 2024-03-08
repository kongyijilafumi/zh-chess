import { PieceList, Piece } from "./piece"

/**
 * 棋子双方
 */
export type PieceSide = "RED" | "BLACK"

export interface PiecePositonPoint {
  x: number
  y: number
}

export interface PieceInputInfo extends PiecePositonPoint, PieceMethods {
  name: string
  side: PieceSide
  isChoose: boolean
  isLastMove: boolean
}


export interface PieceMethods {
  draw: (this: Piece, startX: number, startY: number, endX: number, endY: number, ctx?: CanvasRenderingContext2D) => void
  move: (this: Piece, pos: MovePoint | PiecePositonPoint, PieceList: PieceList) => MoveResult
  getMovePointList: (this: Piece, pl: PieceList) => MovePointList
  drawMovePointList: (this: Piece, pl: PieceList, startX: number, startY: number, width: number, height: number, radius: number, color: string, ctx: CanvasRenderingContext2D) => void
}


export type MovePoint = PiecePositonPoint & {
  disPos: PiecePositonPoint
}


export type MovePointList = MovePoint[]
export type MoveResult = { flag: true } | { flag: false, message: string }