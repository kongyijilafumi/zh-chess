import { Piece, PieceList } from "./piece";
import { BoardMatrix, MoveResult, PiecePositonPoint, PieceSide, } from "./types";
import { getBoardMatrix } from "./utils";

/**
 * 检查棋子移动是否合法
 * @param movPiece 要移动的棋子
 * @param pos 目标位置
 * @param pl 当前棋盘上的所有棋子列表
 * @returns 移动结果，包含是否可移动的标志和错误信息
 */
export function checkChessPieceMovement(movPiece: Piece | null, pos: PiecePositonPoint, pl: PieceList): MoveResult {
  if (!movPiece) {
    return { flag: false, message: "移动的棋子不能为空！" }
  }
  const mp = movPiece.getMovePointList(pl).find(m => m.x === pos.x && m.y === pos.y)
  if (!mp) {
    return { flag: false, message: `不存在移动点位(${pos.x},${pos.y}),移动无效！` }
  }
  return { flag: true }
}

/**
 * 检查移动是否会导致自己被将军
 * @param movPiece 要移动的棋子
 * @param pos 目标位置
 * @param pl 当前棋盘上的所有棋子列表
 * @returns 检查结果，包含是否会造成自己被将军的标志和错误信息
 */
export function checkWillCauseSelf(movPiece: Piece | null, pos: PiecePositonPoint, pl: PieceList): MoveResult {
  if (!movPiece) {
    return { flag: false, message: "移动的棋子不能为空！" }
  }
  let currentSide = movPiece.side;
  const newPieice = new Piece({
    ...movPiece.getInfo(),
    ...pos,
    draw: movPiece.draw,
    getMovePointList: movPiece.getMovePointList,
    move: movPiece.move
  })

  const enemyPl: PieceList = [], newPl = pl.filter(item => {
    if (item.side !== currentSide) {
      enemyPl.push(item)
    }
    if ((item.x === movPiece.x && item.y === movPiece.y) || (item.x === pos.x && item.y === pos.y)) {
      return false
    }
    return true
  })
    .concat(newPieice)
  let currentGeneral = newPl.find(p => p.side === currentSide && p.isGeneral) as Piece
  let attack = enemyPl.some(item => {
    return item.move({ x: currentGeneral.x, y: currentGeneral.y }, newPl).flag
  })
  if (attack) {
    return { flag: false, message: "不可以送将！" }
  }
  return checkIfGeneralsAreInLine(getBoardMatrix(newPl))
}

/**
 * 检查双方将军是否在同一直线上
 * @param boardMatrix 棋盘矩阵
 * @returns 检查结果，包含是否在同一直线的标志和错误信息
 */
export function checkIfGeneralsAreInLine(boardMatrix: BoardMatrix): MoveResult {
  let generalPiece: Piece | undefined;
  for (let index = 0; index < boardMatrix.length; index++) {
    const x = boardMatrix[index];
    let j = 2;
    while (!generalPiece && j++ <= 5) {
      const p = x[j];
      if (p && p.isGeneral) {
        generalPiece = p
        break
      }
    }
    if (generalPiece) {
      const p = x[generalPiece.y]
      if (p && !p.isGeneral && p.y !== generalPiece.y) {
        return { flag: true }
      }
      if (p && p.isGeneral && p.y !== generalPiece.y) {
        return { flag: false, message: "不可以送将！" }
      }
    }
  }
  return { flag: true }
}

/**
 * 检查某一方是否有解脱困境的方法
 * @param side 要检查的一方（红方或黑方）
 * @param pl 当前棋盘上的所有棋子列表
 * @returns 是否有解脱困境的方法
 */
export function checkInTroubleHasSolution(side: PieceSide, pl: PieceList) {
  return pl.filter(p => p.side === side)
    .some(p => p.getMovePointList(pl)
      .some(m =>
        checkChessPieceMovement(p, m, pl).flag && checkWillCauseSelf(p, m, pl).flag
      )
    )
}

/**
 * 检查棋子是否可以移动到目标位置
 * @param piece 要移动的棋子
 * @param pos 目标位置
 * @param pl 当前棋盘上的所有棋子列表
 * @returns 移动结果，包含是否可移动的标志和错误信息
 */
export function pieceCanMove(piece: Piece, pos: PiecePositonPoint, pl: PieceList): MoveResult {
  const movementResult = checkChessPieceMovement(piece, pos, pl)
  if (!movementResult.flag) {
    return movementResult
  }

  const causeSelf = checkWillCauseSelf(piece, pos, pl)
  if (!causeSelf.flag) {
    return causeSelf
  }
  return { flag: true }
}