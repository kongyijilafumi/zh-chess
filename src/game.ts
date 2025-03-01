import { ChessBoard } from "./board";
import { Piece, PieceList } from "./piece";
import { GameWindowInfo, MoveResult, PieceInputInfo, PiecePositonPoint, PieceSide } from "./types";

/** 移动历史记录项 */
interface MoveHistoryItem {
  /** 起始位置 */
  from: PiecePositonPoint;
  /** 目标位置 */
  to: PiecePositonPoint;
  /** 移动方 */
  side: PieceSide;
  /** 被吃掉的棋子（如果有） */
  capturedPiece?: PieceInputInfo;
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

    // 获取起始位置的棋子
    const boardMatrix = this.board.pieceList;
    const piece = boardMatrix.find(p => p.x === mov.x && p.y === mov.y);
    if (!piece) {
      return { flag: false, message: "不存在起始位置的棋子" };
    }
    // 检查是否是当前游戏方的棋子
    if (piece.side !== this.gameSide) {
      return { flag: false, message: "不是当前游戏方的棋子" };
    }
    // 如果是完整的移动（而不是选中），记录历史
    if (pos) {
      const targetPiece = boardMatrix.find(p => p.x === pos.x && p.y === pos.y);
      const historyItem: MoveHistoryItem = {
        from: { x: mov.x, y: mov.y },
        to: { x: pos.x, y: pos.y },
        side: piece.side
      };

      if (targetPiece) {
        historyItem.capturedPiece = {
          x: targetPiece.x,
          y: targetPiece.y,
          side: targetPiece.side,
          name: targetPiece.name,
          isChoose: false,
          isGeneral: false,
          isLastMove: false,
          draw: targetPiece.draw,
          move: targetPiece.move,
          getMovePointList: targetPiece.getMovePointList
        };
      }

      // 如果当前不是在历史记录的最新位置，清除之后的历史
      if (this.currentHistoryIndex < this.moveHistory.length - 1) {
        this.moveHistory = this.moveHistory.slice(0, this.currentHistoryIndex + 1);
      }

      this.moveHistory.push(historyItem);
      this.currentHistoryIndex++;
    }

    // 执行移动
    this.board.move(mov, pos);

    // 如果是完整的移动（而不是选中），则切换游戏方
    if (pos) {
      this.switchGameSide();
      // 检查游戏是否结束
      this.checkGameOver();
      return { flag: true };
    }

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
   * 检查游戏是否结束
   */
  private checkGameOver() {
    // 检查当前游戏方是否还有解
    const hassolution = this.pieceList.some(p => {
      if (p.side === this.gameSide) {
        return p.getMovePointList(this.pieceList).some(m => {
          return this.board.checkMove(p, m);
        });
      }
      return false;
    });

    if (!hassolution) {
      this.isGameOver = true;
      const winner = this.gameSide === "RED" ? "BLACK" : "RED";
      console.log(`游戏结束，${winner === "RED" ? "红方" : "黑方"}胜利！`);
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
   * @param x 点击位置的x坐标
   * @param y 点击位置的y坐标
   * @returns 处理结果
   */
  public handleCanvasClick(x: number, y: number): MoveResult {
    // 获取当前选中的棋子
    const selectedPiece = this.pieceList.find(p => p.isChoose);

    // 将画布坐标转换为棋盘逻辑坐标
    const cell = (this.board.width - 2 * this.board.padding) / 8;
    const row = (this.board.height - 2 * this.board.padding) / 9;

    const boardX = Math.floor((x - 2 * this.board.padding) / cell);
    const boardY = Math.floor((y - 2 * this.board.padding) / row);

    // 如果点击位置超出棋盘范围，返回错误
    if (boardX < 0 || boardX > 8 || boardY < 0 || boardY > 9) {
      return { flag: false, message: "点击位置超出棋盘范围" };
    }

    // 根据视角方向调整坐标
    const adjustedX = this.viewSide === "RED" ? boardX : Math.abs(boardX - 8);
    const adjustedY = this.viewSide === "RED" ? boardY : Math.abs(boardY - 9);

    // 计算点击位置在画布上的实际坐标
    const clickX = x;
    const clickY = y;

    // 如果已有选中的棋子，检查目标位置
    if (selectedPiece) {
      // 获取目标位置的棋子（如果有）
      const targetPiece = this.pieceList.find(p => p.x === adjustedX && p.y === adjustedY);

      // 如果目标位置有棋子，检查点击是否在棋子范围内
      if (targetPiece) {
        const piecePos = this.board.getPieceViewPostion(targetPiece.x, targetPiece.y);
        const distance = Math.sqrt(Math.pow(clickX - piecePos.x, 2) + Math.pow(clickY - piecePos.y, 2));

        // 如果点击不在棋子范围内，认为是点击了空白位置
        if (distance > this.board.pieceRadius) {
          return this.handleMove(
            { x: selectedPiece.x, y: selectedPiece.y },
            { x: adjustedX, y: adjustedY }
          );
        }
      }

      // 点击在空白位置或目标棋子范围内
      return this.handleMove(
        { x: selectedPiece.x, y: selectedPiece.y },
        { x: adjustedX, y: adjustedY }
      );
    }

    // 尝试选中点击位置的棋子
    const clickedPiece = this.pieceList.find(p => {
      if (p.x === adjustedX && p.y === adjustedY) {
        const piecePos = this.board.getPieceViewPostion(p.x, p.y);
        const distance = Math.sqrt(Math.pow(clickX - piecePos.x, 2) + Math.pow(clickY - piecePos.y, 2));
        return distance <= this.board.pieceRadius;
      }
      return false;
    });

    // 如果找到了点击范围内的棋子，尝试选中它
    if (clickedPiece) {
      return this.handleMove({ x: clickedPiece.x, y: clickedPiece.y });
    }

    // 点击在空白位置，不做任何操作
    return { flag: false, message: "未选中任何棋子" };
  }
}