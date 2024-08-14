import { Piece, PieceList, getBoardMatrix } from "./piece";
import { BoardMatrix, MoveResult, PiecePositonPoint, PieceSide, } from "./types";



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

export function checkInTroubleHasSolution(side: PieceSide, pl: PieceList) {
  return pl.filter(p => p.side === side)
    .some(p => p.getMovePointList(pl)
      .some(m =>
        checkChessPieceMovement(p, m, pl).flag && checkWillCauseSelf(p, m, pl).flag
      )
    )
}