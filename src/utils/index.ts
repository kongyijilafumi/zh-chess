import { PieceList } from "src/piece";
import { BoardMatrix, PiecePositonPoint } from "src/types";


export function boardMatrixToString(boardMatrix: BoardMatrix) {
  let maxY = boardMatrix.length
  let maxX = boardMatrix[0].length
  let str = ''
  for (let x = 0; x < maxX; x++) {
    for (let y = 0; y < maxY; y++) {
      let item = boardMatrix[y][x]
      str += item?.name || '  '
      if (y !== maxY - 1) {
        str += '|'
      }
    }
    str += '\n'
  }
  return str
}

export function getBoardMatrix(pl: PieceList) {
  let arr: BoardMatrix = []
  for (let x = 0; x < 9; x++) {
    arr[x] = Array.from({ length: 10 }, () => null)
  }
  pl.forEach(item => {
    arr[item.x][item.y] = item
  })
  return arr
}


export function getBoardAllPoint(): PiecePositonPoint[][] {
  let arr = []
  for (let x = 0; x < 9; x++) {
    arr[x] = Array.from({ length: 10 }, (_, y) => ({ x, y }))
  }
  return arr
}
