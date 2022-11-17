import { RookPiece, HorsePiece, ElephantPiece, CannonPiece, KnightPiece, GeneralPiece, SoldierPiece, ChessOfPeice } from './piece';

export const getPiecesList = () => {
  const piecesList: Array<ChessOfPeice> = []
  // 车 马 象 士 炮
  for (let index = 0; index < 2; index++) {
    const blackRook = new RookPiece({ x: 0 + index * 8, y: 0, name: "車", side: "BLACK", isChoose: false })
    const blackHorse = new HorsePiece({ x: 1 + index * 6, y: 0, name: "馬", side: "BLACK", isChoose: false })
    const blackElephant = new ElephantPiece({ x: 2 + index * 4, y: 0, name: "象", side: "BLACK", isChoose: false })
    const blackKnight = new KnightPiece({ x: 3 + index * 2, y: 0, name: "仕", side: "BLACK", isChoose: false })
    const blackCannon = new CannonPiece({ x: 1 + index * 6, y: 2, name: "砲", side: "BLACK", isChoose: false })

    const redRook = new RookPiece({ x: 0 + index * 8, y: 9, name: "车", side: "RED", isChoose: false })
    const redHorse = new HorsePiece({ x: 1 + index * 6, y: 9, name: "马", side: "RED", isChoose: false })
    const redElephant = new ElephantPiece({ x: 2 + index * 4, y: 9, name: "相", side: "RED", isChoose: false })
    const redKnight = new KnightPiece({ x: 3 + index * 2, y: 9, name: "士", side: "RED", isChoose: false })
    const redCannon = new CannonPiece({ x: 1 + index * 6, y: 7, name: "炮", side: "RED", isChoose: false })

    piecesList.push(
      blackRook, blackHorse, blackElephant, blackKnight, blackCannon,
      redRook, redHorse, redElephant, redKnight, redCannon
    )
  }

  // 兵
  for (let index = 0; index < 5; index++) {
    const blackSoldier = new SoldierPiece({ x: 2 * index, y: 3, name: "卒", side: "BLACK", isChoose: false })
    const redSoldier = new SoldierPiece({ x: 2 * index, y: 6, name: "兵", side: "RED", isChoose: false })
    piecesList.push(blackSoldier, redSoldier)
  }

  const blackGeneral = new GeneralPiece({ x: 4, y: 0, name: "将", side: "BLACK", isChoose: false })
  const redGeneral = new GeneralPiece({ x: 4, y: 9, name: "帅", side: "RED", isChoose: false })

  piecesList.push(
    blackGeneral,
    redGeneral
  )
  return piecesList
}

