import { PieceList, Piece } from "./piece"

/**
 * 棋子双方
 */
export type PieceSide = "RED" | "BLACK"

/**
 * 棋子坐标点
 */
export interface PiecePositonPoint {
  /**
   * x轴位置
   */
  x: number
  /**
   * y轴位置
   */
  y: number
}

export interface PieceInputInfo extends PiecePositonPoint, PieceMethods {
  name: string
  side: PieceSide
  isChoose: boolean
  isLastMove: boolean
  isGeneral:boolean
}

/**
 * 棋子具有的方法
 */
export interface PieceMethods {
  /**
   * 棋子绘画
   * @param this 棋子本身
   * @param x x坐标点
   * @param y y坐标点
   * @param radius 半径
   * @param ctx canvas绘画
   * @returns 
   */
  draw: (this: Piece, x: number, y: number, radius: number, ctx?: CanvasRenderingContext2D) => void
  move: (this: Piece, pos: MovePoint | PiecePositonPoint, PieceList: PieceList) => MoveResult
  getMovePointList: (this: Piece, pl: PieceList) => MovePointList
}


export type MovePoint = PiecePositonPoint & {
  disPos: PiecePositonPoint
}


export type MovePointList = MovePoint[]
export type MoveResult = { flag: true } | { flag: false, message: string }

export interface BoardInfo {
  width: number
  height: number
  padding: number
  viewSide: PieceSide
  scaleRatio?: number
  context?: CanvasRenderingContext2D
}

export type BoardMatrix = Array<Array<null | Piece>>

export type MoveType = "MOVE" | "EAT" | "kINGUNDERATTACK"