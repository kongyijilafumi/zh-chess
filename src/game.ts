import { ChessBoard, enemySideMap } from "./board";
import { Piece, PieceList } from "./piece";
import { GameWindowInfo, MoveResult, PiecePositonPoint, PieceSide } from "./types";
import { getBoardMatrix } from "./utils";

/** 移动历史记录项 */
interface MoveHistoryItem {
  /** 起始位置 */
  from: PiecePositonPoint;
  /** 目标位置 */
  to: PiecePositonPoint;
  /** 移动方 */
  side: PieceSide;
  /** 被吃掉的棋子（如果有） */
  capturedPiece?: {
    x: number;
    y: number;
    side: PieceSide;
    name: string;
  };
}

export class Game {
  /** 棋盘实例 */
  private board: ChessBoard;
  /** 棋子列表 */
  private pieceList: PieceList;
  /** 视角方（决定棋盘显示方向） */
  private viewSide: PieceSide;
  /** 当前游戏方（决定轮到谁走棋） */
  private gameSide: PieceSide;
  /** 游戏是否结束 */
  private isGameOver: boolean;
  /** 移动历史记录 */
  private moveHistory: MoveHistoryItem[] = [];
  /** 当前历史记录索引 */
  private currentHistoryIndex: number = -1;

  constructor(pl: PieceList, viewSide: PieceSide, gameSide: PieceSide, gameWindowInfo: GameWindowInfo, ctx?: CanvasRenderingContext2D) {
    this.board = new ChessBoard({ ...gameWindowInfo, viewSide: viewSide, context: ctx });
    this.pieceList = pl;
    this.viewSide = viewSide;
    this.gameSide = gameSide;
    this.isGameOver = false;

    // 初始化棋盘
    this.board.setPieceList(this.pieceList);
    this.board.changeViewSide(this.viewSide);
    this.board.draw();
  }

  /**
   * 获取当前游戏方
   */
  public getCurrentGameSide(): PieceSide {
    return this.gameSide;
  }

  /**
   * 切换游戏方
   */
  private switchGameSide() {
    this.gameSide = this.gameSide === "RED" ? "BLACK" : "RED";
  }

  /**
   * 处理移动棋子
   * @param mov 起始位置
   * @param pos 目标位置（可选，如果不提供则只是选中棋子）
   * @returns 移动是否成功
   */
  public handleMove(mov: PiecePositonPoint, pos?: PiecePositonPoint): MoveResult {
    if (this.isGameOver) {
      return { flag: false, message: "游戏已结束" };
    }
    const boardMatrix = getBoardMatrix(this.board.pieceList);
    const piece = boardMatrix[mov.x][mov.y]
    if (piece && this.gameSide !== piece.side) {
      return { flag: false, message: "当前棋子不属于当前游戏方" };
    }
    // 执行移动
    const boardMoveResult = this.board.move(mov, pos, boardMatrix);
    if (!boardMoveResult.flag) {
      return boardMoveResult
    }
    if (boardMoveResult.type === "CHOOSE") {
      return { flag: true }
    }
    // 记录移动历史记录
    const historyItem: MoveHistoryItem = {
      from: boardMoveResult.from,
      to: boardMoveResult.to,
      side: boardMoveResult.side,
      capturedPiece: boardMoveResult.capturedPiece
    };
    this.moveHistory.push(historyItem);
    this.currentHistoryIndex++;
    // 检查游戏是否结束
    this.checkGameOver(enemySideMap[this.gameSide]);
    this.switchGameSide();
    return { flag: true };
  }

  /**
   * 撤销上一步移动
   * @returns 是否成功撤销
   */
  public undo(): boolean {
    if (this.currentHistoryIndex < 0 || this.isGameOver) {
      return false;
    }

    const lastMove = this.moveHistory[this.currentHistoryIndex];
    const piece = this.pieceList.find(p =>
      p.x === lastMove.to.x &&
      p.y === lastMove.to.y &&
      p.side === lastMove.side
    );

    if (piece) {
      // 移动棋子回原位置
      piece.update(lastMove.from.x, lastMove.from.y);
      piece.setLast(false);

      // 如果有被吃掉的棋子，恢复它
      if (lastMove.capturedPiece) {
        const { x, y, side, name } = lastMove.capturedPiece;
        const newPiece = new Piece({
          x, y, side, name,
          isChoose: false,
          isLastMove: false,
          isGeneral: false,
          draw: piece.draw,
          move: piece.move,
          getMovePointList: piece.getMovePointList
        });
        this.pieceList.push(newPiece);
      }

      this.currentHistoryIndex--;
      this.switchGameSide();
      this.board.setPieceList(this.pieceList);
      this.board.draw();
      return true;
    }

    return false;
  }

  /**
   * 重做上一步撤销的移动
   * @returns 是否成功重做
   */
  public redo(): boolean {
    if (this.currentHistoryIndex >= this.moveHistory.length - 1 || this.isGameOver) {
      return false;
    }

    const nextMove = this.moveHistory[this.currentHistoryIndex + 1];
    const piece = this.pieceList.find(p =>
      p.x === nextMove.from.x &&
      p.y === nextMove.from.y &&
      p.side === nextMove.side
    );

    if (piece) {
      // 如果目标位置有棋子，移除它
      if (nextMove.capturedPiece) {
        this.pieceList = this.pieceList.filter(p =>
          !(p.x === nextMove.to.x && p.y === nextMove.to.y)
        );
      }

      // 移动棋子到目标位置
      piece.update(nextMove.to.x, nextMove.to.y);
      piece.setLast(true);

      this.currentHistoryIndex++;
      this.switchGameSide();
      this.board.setPieceList(this.pieceList);
      this.board.draw();
      return true;
    }

    return false;
  }

  /**
   * @param side 要检查的游戏方
   * 检查游戏是否结束
   */
  private checkGameOver(side: PieceSide) {
    // 检查当前游戏方是否还有解
    const hassolution = this.pieceList.some(p => {
      if (p.side === side) {
        return p.getMovePointList(this.pieceList).some(m => {
          return this.board.checkMove(p, m);
        });
      }
      return false;
    });

    if (!hassolution) {
      this.isGameOver = true;
      console.log(`游戏结束，${enemySideMap[side] === "RED" ? "红方" : "黑方"}胜利！`);
    }
  }

  /**
   * 重置游戏
   */
  public resetGame() {
    this.isGameOver = false;
    this.gameSide = "RED";
    this.moveHistory = [];
    this.currentHistoryIndex = -1;
    this.board.draw();
  }

  /**
   * 获取移动历史
   */
  public getMoveHistory(): MoveHistoryItem[] {
    return this.moveHistory;
  }

  /**
   * 获取当前历史记录索引
   */
  public getCurrentHistoryIndex(): number {
    return this.currentHistoryIndex;
  }
  /**
   * 处理画布点击事件
   * @param clickX 点击位置的x坐标
   * @param clickY 点击位置的y坐标
   * @returns 处理结果
   */
  public handleCanvasClick(clickX: number, clickY: number): MoveResult {
    // 将画布坐标转换为棋盘逻辑坐标
    const cell = (this.board.width - 2 * this.board.padding) / 8;
    const row = (this.board.height - 2 * this.board.padding) / 9;

    const boardMatrix = getBoardMatrix(this.pieceList);
    let selectedPiece: Piece | undefined;
    let clickPoint: PiecePositonPoint | undefined;
    boardMatrix.forEach((rowPieceList, x) => {
      rowPieceList.forEach((piece, y) => {
        if (piece && piece.isChoose) {
          selectedPiece = piece;
        }
        const adjustedX = this.board.padding + x * cell;
        const adjustedY = this.board.padding + y * row;
        // 检查是否是当前点击位置的棋子
        if (Math.pow(clickX - adjustedX, 2) + Math.pow(clickY - adjustedY, 2) <= Math.pow(this.board.pieceRadius, 2)) {
          clickPoint = { x, y };
        }
      })
    })

    // 如果已有选中的棋子
    if (selectedPiece) {
      // 如果点击位置在棋子范围内
      if (clickPoint) {
        // 点击在空白位置
        return this.handleMove(
          { x: selectedPiece.x, y: selectedPiece.y },
          { x: clickPoint.x, y: clickPoint.y }
        );
      }

    }

    // 如果找到了点击范围内的棋子，尝试选中它
    if (clickPoint) {
      return this.handleMove({ x: clickPoint.x, y: clickPoint.y });
    }

    // 点击在空白位置，不做任何操作
    return { flag: false, message: "未选中任何位置" };
  }
}