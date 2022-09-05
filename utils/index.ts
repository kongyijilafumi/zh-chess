import { ChessOfPeiceName, HorsePiece } from './../src/piece';
import { PieceSide } from './../types/index';
import { Point } from '../types/index';
import { chessOfPeiceMap, PieceList } from '../src/piece';
export const getCtxWidth = () => {
  const deviceWidth = window.screen.availWidth
  const isLargDevice = deviceWidth > 800
  return isLargDevice ? 800 : deviceWidth
}

export const getBorderWidth = () => {
  return getCtxWidth() === 800 ? 20 : 5
}

export const getPaddingWidth = () => {
  return getCtxWidth() === 800 ? 30 : 5
}
/**
* 根据棋盘列表位置返回棋子 可能该位置没有棋子
* @param pl 棋盘列表
* @param p 棋盘坐标点
* @returns 返回当前棋盘坐标点上的棋子
*/
export const findPiece = (pl: PieceList, p: Point) => pl.find(item => item.x === p.x && item.y === p.y)


export const getModalWidth = () => {
  const deviceWidth = getCtxWidth()
  return deviceWidth === 800 ? 500 : deviceWidth - 30
}

export const isPc = () => {
  var UA = window.navigator.userAgent.toLowerCase();
  return !(
    UA.indexOf("phone") !== -1 ||
    UA.indexOf("mobile") !== -1 ||
    UA.indexOf("android") !== -1 ||
    UA.indexOf("ipad") !== -1 ||
    UA.indexOf("ipod") !== -1
  );
}


const numPos = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
const zhnumPos = ["一", "二", "三", "四", "五", "六", "七", "八", "九"]
const strPos = ["前", "中", "后"]
const moveStyles = ["进", "平", "退"]
const PieceNames = Object.keys(chessOfPeiceMap)
const move_reg_one = new RegExp(`(${strPos.concat(zhnumPos).concat(numPos).join("|")})(${PieceNames.join("|")})(${moveStyles.join("|")})(${numPos.concat(zhnumPos).join("|")})$`)

export const getPieceInfo = (str: string, side: PieceSide, pl: PieceList) => {
  let strRes;
  if (move_reg_one.test(str) && (strRes = move_reg_one.exec(str))) {
    move_reg_one.lastIndex = 0
    // 获得 棋子名字
    let pieceName = getSidePieceName(strRes[2] as ChessOfPeiceName, side)
    let moveStyle = strRes[3], moveStep = formatChooseNum(strRes[4]);
    let isRedSide = side === "RED"
    const findPL = pl.filter(p => p.side === side && p.name === pieceName)
    if (findPL.length) {
      return false
    }
    // 获取 棋子所对应的 x轴 的次数
    let maxX: number, lineX: string;
    const xmap: {
      [props: string]: number
    } = {}
    findPL.forEach(p => {
      if (xmap[p.x]) {
        xmap[p.x] += 1
      } else {
        xmap[p.x] = 1
      }
    })
    const linexs = Object.keys(xmap).sort((a, b) => xmap[b] - xmap[a])
    lineX = linexs[0]
    maxX = xmap[lineX]
    const linePL = findPL.filter(p => String(p.x) === lineX)
    let first = strRes[1] as string
    // 如果多个兵在一条竖线上 数字开头
    if (zhnumPos.concat(numPos).concat(strPos).includes(first) && maxX >= 3) {
      findPL.sort((a, b) => side === "RED" ? a.y - b.y : b.y - a.y)
      // 获取到棋子
      const choose = linePL[formatChooseNum(first) - 1]
      // 前进
      let y = side === "RED" ? choose.y - moveStep : choose.y + moveStep
      if (moveStyle === moveStyles[0]) {
        const mp = new Point(choose.x, y)
        return { mp, choose }
      }
      // 平
      if (moveStyle === moveStyles[1]) {
        const mp = new Point(moveStep, choose.y)
        return { mp, choose }
      }
    }
    // 如果两个相同的棋子在一条竖线上
    if (strPos.includes(first)) {
      
    }
    return false
  }
  return false
}

function getSidePieceName(name: ChessOfPeiceName, side: PieceSide): ChessOfPeiceName | null {
  switch (name) {
    case "车": case "車":
      return side === "BLACK" ? '車' : "车"
    case "兵": case "卒":
      return side === "BLACK" ? "卒" : "兵"
    case "仕": case "士":
      return side === "BLACK" ? "仕" : "士"
    case "将": case "帅":
      return side === "BLACK" ? "将" : "帅"
    case "炮": case "砲":
      return side === "BLACK" ? "砲" : "炮"
    case "相": case "象":
      return side === "BLACK" ? "象" : "相"
    case "馬": case "马":
      return side === "BLACK" ? "馬" : "马"
    default:
      return null
  }
}

function formatChooseNum(str: string): number {
  switch (str) {
    case "1": case "一": case "前":
      return 1
    case "2": case "二": case "中":
      return 2
    case "3": case "三": case "后":
      return 3
    case "4": case "四":
      return 4
    case "5": case "五":
      return 5
    case "6": case "六":
      return 6
    case "7": case "七":
      return 7
    case "8": case "八":
      return 8
    case "9": case "九":
      return 9
    default:
      return 10
  }
}