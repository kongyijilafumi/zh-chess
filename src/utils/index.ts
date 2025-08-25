import { PieceList } from "src/piece";
import { BoardMatrix, PieceEnName, PiecePositonPoint, PieceZhName } from "src/types";


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

export function pieceListToPenCode(pl: PieceList) {
  let numStr = 0;
  let str = '';
  const boardMatrix = getBoardMatrix(pl)
  let maxY = boardMatrix.length
  let maxX = boardMatrix[0].length
  const addNumStr = () => {
    if (numStr > 0) {
      str += String(numStr)
      numStr = 0
    }
  }
  for (let x = 0; x < maxX; x++) {
    for (let y = 0; y < maxY; y++) {
      let item = boardMatrix[y][x]
      if (item) {
        addNumStr()
        const isUp = item.side === 'RED'
        let enname = peiceZhNameToEnName(item.name as PieceZhName) || ''
        if (isUp) {
          enname = enname.toUpperCase()
        }
        str += enname
      } else {
        numStr++
      }
    }
    addNumStr()
    if (x < maxX - 1) {
      str += '/'
    }
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


function peiceZhNameToEnName(str: PieceZhName): PieceEnName | null {
  switch (str) {
    case '将': case '帅':
      return 'k'
    case '仕': case '士':
      return 'a'
    case '象': case '相':
      return 'b'
    case '馬': case '马':
      return 'n'
    case '車': case '车':
      return 'r'
    case "砲": case '炮':
      return 'c'
    case '卒': case "兵":
      return 'p'
    default:
      return null
  }
}
export function getBoardAllPoint(): PiecePositonPoint[][] {
  let arr = []
  for (let x = 0; x < 9; x++) {
    arr[x] = Array.from({ length: 10 }, (_, y) => ({ x, y }))
  }
  return arr
}
