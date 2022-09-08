import { ChessOfPeice } from './../src/piece';
import { ChessOfPeiceName } from '../src/piece';

export type PieceSide = "RED" | "BLACK"
type PieceSideCN = "红方" | "黑方"
export type PieceSideMap = {
  [prop in PieceSide]: PieceSideCN
}
export const peiceSideMap: PieceSideMap = {
  "RED": "红方",
  "BLACK": "黑方"
}
export type PieceType =
  1 | //能过河
  2 | // 不能过河
  3 // 只能在帅 附近活动

export interface PieceInfo {
  x: number,
  y: number,
  radius: number,
  name: ChessOfPeiceName,
  side: PieceSide
  isChoose: boolean
}

export type SquarePoints = [Point, Point, Point, Point]
export type PieceFilterFn = (p: PieceInfo, index: number) => boolean
export class Point {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  toString() {
    return `(${this.x},${this.y})`
  }
}

export class MovePoint extends Point {
  disPoint: Point
  constructor(x: number, y: number, p: { x: number, y: number }) {
    super(x, y)
    this.disPoint = new Point(p.x, p.y)
  }
  toString() {
    const hasDisPoint = !(this.disPoint.x === 10 && this.disPoint.y === 10)
    return `(${this.x},${this.y})${hasDisPoint ? '<阻碍点' + this.disPoint + '>' : ''}`
  }
}

export type MovePointList = Array<MovePoint>

// export interface GameWindowInfo {
//   startX: number
//   startY: number
//   endX: number
//   endY: number
//   gridWidth: number
//   gridHeight: number
//   radius: number
//   ww: number
//   wh: number
// }


export interface MoveSuccess {
  flag: true
}

export interface MoveFail {
  flag: false
  message: string
}

export type MoveFlag = MoveSuccess | MoveFail


type Mp = {
  move: Point
}
type Ep = {
  eat: Point
}
export type CheckPoint = Mp | Ep

export type GameState = "INIT" | "START" | "OVER"

export interface ModalOption {
  lab: string
  val: string
}
export interface ModalChooseOption extends ModalOption {
  x: number
  y: number
  height: number
  width: number
}
export type ModalOptionList = Array<ModalOption>

export type ModalChooseInfo = {
  title: string
  options: ModalOptionList
}

export type MoveCallback = (peice: ChessOfPeice, cp: CheckPoint, enemyhasTrouble: boolean) => void

export type MoveFailCallback = (peice: ChessOfPeice, p: Point, currentSideDanger: boolean, msg: string) => void

export type GameLogCallback = (str: any) => void

export type GameOverCallback = (winnerSide: PieceSide) => void

export type GameEventName = "move" | "moveFail" | "log" | "over"

export type GameEventCallback = MoveCallback | MoveFailCallback | GameLogCallback | GameOverCallback
