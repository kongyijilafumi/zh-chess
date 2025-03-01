import { PieceList, Piece } from "./piece"

/**
 * 棋子双方
 * 用于标识棋子属于红方还是黑方
 */
export type PieceSide = "RED" | "BLACK"

/**
 * 棋子坐标点
 * 用于表示棋子在棋盘上的位置
 */
export interface PiecePositonPoint {
  /**
   * x轴位置
   * 表示棋子在棋盘上的横向坐标（0-8）
   */
  x: number
  /**
   * y轴位置
   * 表示棋子在棋盘上的纵向坐标（0-9）
   */
  y: number
}

/**
 * 棋子输入信息
 * 用于初始化棋子时的完整信息，包含位置、属性和方法
 */
export interface PieceInputInfo extends PiecePositonPoint, PieceMethods {
  /** 棋子名称（如：车、马、炮等） */
  name: string
  /** 棋子所属方（红方或黑方） */
  side: PieceSide
  /** 是否被选中状态 */
  isChoose: boolean
  /** 是否是最后一次移动的棋子 */
  isLastMove: boolean
  /** 是否是将帅类棋子 */
  isGeneral: boolean
}

/**
 * 棋子具有的方法
 * 定义了棋子的核心行为，包括绘制、移动和获取可移动位置列表
 */
export interface PieceMethods {
  /**
   * 棋子绘画方法
   * 负责在画布上绘制棋子的外观
   * @param this 棋子本身
   * @param x x坐标点
   * @param y y坐标点
   * @param radius 棋子半径
   * @param ctx canvas绘画上下文
   */
  draw: (this: Piece, x: number, y: number, radius: number, ctx?: CanvasRenderingContext2D) => void
  /**
   * 棋子移动方法
   * 处理棋子的移动逻辑，包括位置更新和规则验证
   * @param this 棋子本身
   * @param pos 目标位置
   * @param PieceList 当前棋盘上的所有棋子列表
   */
  move: (this: Piece, pos: MovePoint | PiecePositonPoint, PieceList: PieceList) => MoveResult
  /**
   * 获取棋子可移动位置列表
   * 根据棋子类型和当前局面计算所有可能的移动位置
   * @param this 棋子本身
   * @param pl 当前棋盘上的所有棋子列表
   */
  getMovePointList: (this: Piece, pl: PieceList) => MovePointList
}

/**
 * 移动点信息
 * 包含目标位置和中间位置（用于马、象等需要确认中间点是否有棋子的情况）
 */
export type MovePoint = PiecePositonPoint & {
  /** 中间位置点（用于验证移动路径是否有阻碍） */
  disPos: PiecePositonPoint
}

/** 移动点列表类型 */
export type MovePointList = MovePoint[]

/**
 * 移动结果类型
 * 用于表示移动操作的执行结果
 */
export type MoveResult = { flag: true } | { flag: false, message: string }

/**
 * 棋盘信息接口
 * 定义了棋盘的基本属性和显示参数
 */
export interface BoardInfo {
  /** 棋盘宽度 */
  width: number
  /** 棋盘高度 */
  height: number
  /** 棋盘内边距 */
  padding: number
  /** 视角方（决定棋盘显示方向） */
  viewSide: PieceSide
  /** 缩放比例 */
  scaleRatio?: number
  /** Canvas绘画上下文 */
  context?: CanvasRenderingContext2D
}

/**
 * 棋盘矩阵类型
 * 用二维数组表示棋盘上每个位置的状态
 */
export type BoardMatrix = Array<Array<null | Piece>>

/**
 * 移动类型
 * 用于区分不同的移动情况
 */
export type MoveType = "MOVE" | "EAT" | "kINGUNDERATTACK"

/**
 * 棋子中文名称类型
 * 包含所有中国象棋棋子的中文名称
 */
export type PieceZhName = "车" | "車" | "马" | "馬" | "象" | "相" | "士" | "仕" | "帅" | "将" | "兵" | "卒" | "炮" | "砲"

/**
 * 棋子英文名称类型
 * 使用单个字母表示不同的棋子类型
 * r: 车, n: 马, b: 象, a: 士, k: 将/帅, c: 炮, p: 兵/卒
 */
export type PieceEnName = 'r' | 'n' | 'b' | 'a' | 'k' | 'c' | 'p'

/**
 * 棋子移动信息类型
 * 包含棋子对象和其可移动位置列表
 */
export type PieceMoveInfo = [Piece, MovePointList]

/**
 * 游戏窗口信息接口
 * 定义了游戏窗口的基本尺寸参数
 */
export interface GameWindowInfo {
  /** 窗口宽度 */
  width: number
  /** 窗口高度 */
  height: number
  /** 窗口内边距 */
  padding: number
  /** 缩放比例 */
  scaleRatio?: number
}