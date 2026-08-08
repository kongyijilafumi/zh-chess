import type { ChessOfPeice, PieceList } from './piece'
import type {
  CheckPoint,
  GamePieceGridDiffX,
  GamePieceGridDiffY,
  Move,
  PieceSide,
  Point
} from './types'

/**
 * 棋盘绘制布局信息（供自定义渲染器使用，避免直接访问 protected 字段）
 */
export interface DrawLayout {
  startX: number
  startY: number
  endX: number
  endY: number
  gridWidth: number
  gridHeight: number
  gridDiffX: GamePieceGridDiffX
  gridDiffY: GamePieceGridDiffY
  radius: number
  width: number
  height: number
  scaleRatio: number
  colors: DrawLayoutColors
}

/**
 * 棋盘/棋子配色
 */
export interface DrawLayoutColors {
  checkerboardBackground: string
  boardTextColor: string
  redPeiceBackground: string
  blackPeiceBackground: string
  redPeiceTextColor: string
  blackPeiceTextColor: string
  choosePeiceBorderColor: string
  movePointColor: string
}

/**
 * 单枚棋子绘制时的样式上下文
 */
export interface PieceDrawStyle {
  textColor: string
  bgColor: string
  /**
   * 显示用名称（可由变体 `getPieceDisplayName` 改写，例如揭棋未翻开显示「暗」）
   */
  displayName: string
}

/**
 * 游戏主机只读/可调用表面（插件与变体钩子中的 `game` 参数）
 *
 * 与 {@link ZhChess} 公共 API 对齐；实现类为 ZhChess 本身。
 */
export interface ChessGameHost {
  readonly currentLivePieceList: PieceList
  readonly currentGameSide: PieceSide | null
  readonly winnerSide: PieceSide | null
  readonly currentRadius: number
  readonly duration: number
  setLivePieceList(pl: PieceList): void
  setPenCodeList(penCode: string): void
  getCurrentPenCode(side: PieceSide): string
  generateLegalMoves(side: PieceSide): Move[]
  generateMoves(side: PieceSide): import('./types').MovePointList[]
  isLegalMove(side: PieceSide, from: Point, to: Point): boolean
  getPiecesOfSide(side: PieceSide): PieceList
  exportTextBoard(options?: TextBoardOptions): string
  draw(ctx: CanvasRenderingContext2D): void
  gameStart(side: PieceSide): void
  getDrawLayout(): DrawLayout
  use(plugin: ChessPlugin): this
  unuse(name: string): this
}

/**
 * 自定义渲染器
 *
 * 钩子返回 `true` 表示已自行绘制并跳过默认实现；返回 `false` / `void` 则继续默认绘制。
 */
export interface ChessRenderer {
  /**
   * 绘制棋盘（背景、线条、楚河汉界等）
   */
  drawBoard?(
    ctx: CanvasRenderingContext2D,
    layout: DrawLayout,
    game: ChessGameHost
  ): boolean | void
  /**
   * 绘制单枚棋子（可自定义形状、贴图等）
   */
  drawPiece?(
    ctx: CanvasRenderingContext2D,
    piece: ChessOfPeice,
    style: PieceDrawStyle,
    layout: DrawLayout,
    game: ChessGameHost
  ): boolean | void
  /**
   * 绘制可走点提示
   */
  drawMovePoints?(
    ctx: CanvasRenderingContext2D,
    piece: ChessOfPeice,
    points: import('./types').MovePointList,
    layout: DrawLayout,
    game: ChessGameHost
  ): boolean | void
  /**
   * 绘制上一步落点
   */
  drawLastMovePoint?(
    ctx: CanvasRenderingContext2D,
    point: Point,
    layout: DrawLayout,
    game: ChessGameHost
  ): boolean | void
}

/**
 * 走子完成后的上下文（供变体 `afterMove` 使用）
 */
export interface VariantAfterMoveContext {
  /**
   * 走子方
   */
  side: PieceSide
  /**
   * 起始坐标（走子前）
   */
  from: Point
  /**
   * 目标坐标
   */
  to: Point
  /**
   * 移动或吃子
   */
  checkpoint: CheckPoint
  /**
   * 被吃掉的棋子（无吃子时为 null）
   */
  captured: ChessOfPeice | null
  /**
   * 走子后的棋子实例（已更新坐标）
   */
  moved: ChessOfPeice
  /**
   * 敌方是否被将军（或变体自定义终局前的将军态）
   */
  enemyInTrouble: boolean
  /**
   * 是否已判定终局
   */
  isOver: boolean
}

/**
 * 变体规则钩子（揭棋等自定义玩法由此扩展；框架不内置完整揭棋）
 *
 * 扩展数据（如暗子真实身份）建议变体自行用 WeakMap 管理，不必改棋子类字段。
 */
export interface ChessVariant {
  /**
   * 变体名称
   */
  name: string
  /**
   * 自定义开局；若提供则跳过默认 `initBoardPen` 布局
   */
  initBoard?(game: ChessGameHost): void
  /**
   * 走子前拦截：返回 `false` 或错误信息字符串则阻止本次走子
   */
  beforeMove?(
    from: Point,
    to: Point,
    side: PieceSide,
    game: ChessGameHost
  ): boolean | string | void
  /**
   * 过滤/改写合法走法列表（作用于 `generateLegalMoves` / `isLegalMove`）
   */
  filterMoves?(side: PieceSide, moves: Move[], game: ChessGameHost): Move[]
  /**
   * 走子提交后回调（翻面、揭示暗棋等）
   */
  afterMove?(ctx: VariantAfterMoveContext, game: ChessGameHost): void
  /**
   * 自定义胜负；返回胜方则结束对局；返回 `null`/`undefined` 表示不干预默认判定
   */
  checkWinner?(game: ChessGameHost): PieceSide | null | undefined
  /**
   * 棋子显示名（文字导出与默认 Canvas 字共用）
   */
  getPieceDisplayName?(
    piece: ChessOfPeice,
    viewer: PieceSide | null,
    game: ChessGameHost
  ): string
}

/**
 * 文字棋盘单元格格式化函数
 *
 * 返回 `undefined` 表示交给下一个 formatter / 默认样式处理
 */
export type TextBoardCellFormatter = (
  piece: ChessOfPeice | null,
  x: number,
  y: number
) => string | undefined

/**
 * 文字棋盘导出选项
 */
export interface TextBoardOptions {
  /**
   * 导出样式
   * - `chinese`：中文棋子名（默认）
   * - `ascii`：PEN 风格字母（红大写 / 黑小写）
   */
  style?: 'ascii' | 'chinese'
  /**
   * 空格占位符
   * @defaultValue `·`（chinese）或 `.`（ascii）
   */
  emptyCell?: string
  /**
   * 是否显示坐标轴
   * @defaultValue `true`
   */
  showCoords?: boolean
  /**
   * 单元格自定义格式化（优先于 style）
   */
  formatCell?: TextBoardCellFormatter
  /**
   * 视角方：影响变体 `getPieceDisplayName` 的 viewer 参数
   */
  viewer?: PieceSide | null
  /**
   * 由实例方法注入：变体显示名解析
   * @internal
   */
  resolveDisplayName?: (piece: ChessOfPeice) => string
}

/**
 * 插件：可捆绑渲染器、变体与文字导出 formatter
 *
 * - 多个插件的 `renderer` / `variant`：后者覆盖前者（各仅保留一个生效实例）
 * - `formatCell`：按注册顺序链式调用，第一个返回非 `undefined` 的生效
 */
export interface ChessPlugin {
  name: string
  install?(game: ChessGameHost): void
  uninstall?(game: ChessGameHost): void
  renderer?: ChessRenderer
  variant?: ChessVariant
  formatCell?: TextBoardCellFormatter
}

/**
 * 棋子中文名 → PEN 字母（小写）；导出时再按 side 决定大小写
 */
const asciiLetterByPieceName: Record<string, string> = {
  车: 'r',
  車: 'r',
  马: 'n',
  馬: 'n',
  相: 'b',
  象: 'b',
  仕: 'a',
  士: 'a',
  帅: 'k',
  将: 'k',
  炮: 'c',
  砲: 'c',
  兵: 'p',
  卒: 'p'
}

/**
 * 默认：按棋子中文名输出（已区分红黑字形）
 */
function defaultChineseCell(piece: ChessOfPeice | null, emptyCell: string): string {
  if (!piece) return emptyCell
  return piece.name
}

/**
 * 默认：PEN 风格 ascii（红大写 / 黑小写，按 side 判定）
 */
function defaultAsciiCell(piece: ChessOfPeice | null, emptyCell: string): string {
  if (!piece) return emptyCell
  const letter = asciiLetterByPieceName[piece.name]
  if (!letter) return '?'
  return piece.side === 'RED' ? letter.toUpperCase() : letter
}

/**
 * 将存活棋子列表导出为文字棋盘（9 列 × 10 行）
 *
 * @example
 * ```ts
 * console.log(exportTextBoard(game.currentLivePieceList, { style: 'chinese' }))
 * ```
 */
export function exportTextBoard(pieces: PieceList, options?: TextBoardOptions): string {
  const style = options?.style ?? 'chinese'
  const emptyCell = options?.emptyCell ?? (style === 'ascii' ? '.' : '·')
  const showCoords = options?.showCoords !== false
  const formatCell = options?.formatCell
  const resolveDisplayName = options?.resolveDisplayName

  const board: Array<ChessOfPeice | null> = new Array(90).fill(null)
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i]
    if (p.x >= 0 && p.x <= 8 && p.y >= 0 && p.y <= 9) {
      board[p.x + p.y * 9] = p
    }
  }

  const lines: string[] = []
  if (showCoords) {
    lines.push('  ' + [0, 1, 2, 3, 4, 5, 6, 7, 8].join(' '))
  }

  for (let y = 9; y >= 0; y--) {
    const cells: string[] = []
    for (let x = 0; x <= 8; x++) {
      const piece = board[x + y * 9]
      let cell: string | undefined
      if (formatCell) {
        cell = formatCell(piece, x, y)
      }
      if (cell === undefined) {
        if (piece && resolveDisplayName) {
          const display = resolveDisplayName(piece)
          if (style === 'ascii') {
            const letter = asciiLetterByPieceName[display]
            cell = letter
              ? piece.side === 'RED'
                ? letter.toUpperCase()
                : letter
              : display
          } else {
            cell = display
          }
        } else if (style === 'ascii') {
          cell = defaultAsciiCell(piece, emptyCell)
        } else {
          cell = defaultChineseCell(piece, emptyCell)
        }
      }
      cells.push(cell)
    }
    const row = cells.join(' ')
    lines.push(showCoords ? `${y} ${row}` : row)
  }

  return lines.join('\n')
}

/**
 * 合并多个 formatCell：按顺序调用，取第一个非 undefined 结果
 */
export function chainFormatCells(
  formatters: Array<TextBoardCellFormatter | undefined>
): TextBoardCellFormatter | undefined {
  const list = formatters.filter((f): f is TextBoardCellFormatter => typeof f === 'function')
  if (!list.length) return undefined
  return (piece, x, y) => {
    for (let i = 0; i < list.length; i++) {
      const v = list[i](piece, x, y)
      if (v !== undefined) return v
    }
    return undefined
  }
}

export { asciiLetterByPieceName }
