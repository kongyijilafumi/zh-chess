import type { ChessOfPeiceName, ChessOfPeice } from './piece';

/**
 * 游戏玩家方 固定为 RED | BLACK
 */
export type PieceSide = "RED" | "BLACK"
/**
 * 游戏玩家方(中文) 固定为 RED | BLACK
 */
export type PieceSideCN = "红方" | "黑方"
/**
 * 玩家Map数据类型
 */
export type PieceSideMap = {
  [prop in PieceSide]: PieceSideCN
}

/**
 * 玩家Map数据 根据 英文 映射中文名称
 * @example peiceSideMap["RED"] // 返回 红方
 * @example peiceSideMap["BLACK"] // 返回 黑方
 */
export const peiceSideMap: PieceSideMap = {
  "RED": "红方",
  "BLACK": "黑方"
}

/**
 * 象棋棋子信息
 */
export interface PieceInfo {
  /**
   * x坐标位置
   */
  x: number,
  /**
   * y坐标位置
   */
  y: number,
  /**
   * 棋子名称
   */
  name: ChessOfPeiceName,
  /**
   * 棋子所在的玩家方
   */
  side: PieceSide
  /**
   * 是否被选中
   */
  isChoose?: boolean
}
/**
 * 四变形的四个点
 * 以左上角坐标为起点
 * 顺时针或逆时针顺序存储的四个坐标点
 */
export type SquarePoints = [Point, Point, Point, Point]

/**
 * 坐标点
 */
export class Point {
  /**
   * 坐标x
   */
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  /**
   * 格式化输出坐标点
   * @returns 例如返回：`(1,1)`
   */
  toString() {
    return `(${this.x},${this.y})`
  }

}

/**
 * 象棋移动的坐标点
 */
export class MovePoint extends Point {
  /**
   * 阻碍点(坐标)
   */
  disPoint: Point
  constructor(x: number, y: number, p: Point) {
    super(x, y)
    this.disPoint = new Point(p.x, p.y)
  }
  /**
   * 格式化输出移动点
   * @returns 例如返回：`(1,1)` 或者 `(1,1)<阻碍点(2,2)>`
   */
  toString() {
    const hasDisPoint = !(this.disPoint.x === 10 && this.disPoint.y === 10)
    return `(${this.x},${this.y})${hasDisPoint ? '<阻碍点' + this.disPoint + '>' : ''}`
  }
}

/**
 * 棋子移动点列表
 */
export type MovePointList = Array<MovePoint>



/**
 * 移动成功的结果
 */
export type MoveSuccess = {
  /**
   * 移动成功
   */
  flag: true
}

/**
 * 移动失败的结果
 */
export type MoveFail = {
  /**
   * 移动失败
   */
  flag: false
  /**
   * 移动失败信息
   */
  message: string
}

/**
 * 棋子移动的结果
 */
export type MoveResult = MoveSuccess | MoveFail


/**
 * 象棋运动目标移动点
 */
export type Mp = {
  move: Point
}
/**
 * 象棋运动目标移动点且需要吃掉目标点上的棋子
 */
export type Ep = {
  eat: Point
}

/**
 * 象棋运动目标点
 */
export type CheckPoint = Mp | Ep

/**
 * 游戏四种状态
 * @example "INIT" //游戏初始化状态
 * @example "START" //游戏已经开始状态
 * @example "MOVE" //游戏棋子正在运动状态
 * @example "OVER" //游戏已经结束状态
 */
export type GameState = "INIT" | "START" | "OVER" | "MOVE"

/**
 * 监听棋子移动函数
 * @param peice 运动的象棋
 * @param cp
 * if("move" in cp) 成立 说明是 移动点 使用cp.move访问 
 * 否则是 吃掉坐标上点的棋子 使用 cp.eat 访问改坐标点
 * @param enemyhasTrouble 敌方是否被将军
 */
export type MoveCallback = (peice: ChessOfPeice, cp: CheckPoint, enemyhasTrouble: boolean, penCode: string) => void

/**
 * 监听棋子移动失败函数
 * @param pos 起始点
 * @param mov 结束点
 * @param msg 失败信息
 */
export type MoveFailCallback = (pos: Point | null, mov: Point | null, msg: string) => void

/**
 * 监听游戏运行日志
 * @param str 输出信息
 */
export type GameLogCallback = (str: any) => void

/**
 * 监听游戏结束
 * @param winnerSide 赢方
 */
export type GameOverCallback = (winnerSide: PieceSide) => void

/**
 * 监听游戏报错信息
 * @param error 报错信息
 */
export type GameErrorCallback = (error: any) => void
/**
 * 游戏监听事件名称
 * @example "move" //游戏棋子移动成功事件名称
 * @example "moveFail" //游戏棋子移动失败事件名称
 * @example "log" //游戏日志事件名称
 * @example "over" //游戏结束事件名称
 * @example "error" //游戏报错事件名称
 */
export type GameEventName = "move" | "moveFail" | "log" | "over" | "error"

/**
 * 游戏监听函数
 */
export type GameEventCallback = MoveCallback | MoveFailCallback | GameLogCallback | GameOverCallback

/**
 * 游戏象棋玩家格子x轴差值
 */
export type GamePeiceGridDiffX = 8 | 0
/**
 * 游戏象棋玩家格子y轴差值
 */
export type GamePeiceGridDiffY = 9 | 0

/**
 * 棋子PEN代码 小写表示黑方，大写表示红方
 * 
 * 博客介绍
 * https://www.cnblogs.com/royhoo/p/6424395.html
 * 
 * 规则介绍
 * https://www.xqbase.com/protocol/cchess_move.htm
 * https://www.xqbase.com/protocol/cchess_fen.htm
 * 
 */
export type PENPeiceNameCode =
  "K" |//帅
  "A" | //士
  "B" | //相
  "N" | //马
  "R" | //车
  "C" | //炮
  "P" | //兵
  // 黑棋 小写 
  "k" | //将
  "a" | //仕
  "b" | //象
  "n" | //馬
  "r" | //車
  "c" | //砲
  "p"  //卒

export type ParsePENStrData = {
  side: PieceSide
  notEatRound?: string
  round?: string
  list: Array<PeicePosInfo>
}

export type PeicePosInfo = {
  side: PieceSide;
  name: ChessOfPeiceName;
  x: number;
  y: number;
}

/**
 * 更新结果
 */
export type UpdateResult = UpdateFail | updateSuccess
/**
 * 更新失败
 */
export type UpdateFail = {
  /**
   * 更新失败
   */
  flag: false
  /**
   * 更新失败信息
   */
  message: string
}

/**
 * 更新成功
 */
export type updateSuccess = {
  /**
  * 更新成功
  */
  flag: true
  /**
   * 更新后是否需要 移动刷新布局
   * 
   * `false` 表示 无回调函数 当前布局暂无移动
   * 
   * `true` 表示 有回调函数`cb` 当前布局需要调用回调函数`cb()` 更新布局且游戏状态
   */
  move: boolean
  /**
   * 更新成功后的回调函数
   */
  cb?: () => void
}
export type UpdateMoveCallback = (posPeice: ChessOfPeice, newPoint: Point) => void