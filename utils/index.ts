import type { ChessOfPeice, ChessOfPeiceName, PieceList } from './../src/piece';
import type { MovePoint, ParsePENStrData, PeicePosInfo, PENPeiceNameCode, PieceSide, } from '../src/types';
import { Point } from '../src/types';
import { chessOfPeiceMap } from '../src/piece';

/**
* 根据棋盘列表位置返回棋子 可能该位置没有棋子
* @param pl 棋盘列表
* @param p 棋盘坐标点
* @returns 返回当前棋盘坐标点上的棋子
*/


const numPos = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
const zhnumPos = ["一", "二", "三", "四", "五", "六", "七", "八", "九"]
const strPos = ["前", "中", "后"]
const moveStyles = ["进", "平", "退"], moveStyleInput = `(${moveStyles.join("|")})`
const numMergePos = numPos.concat(zhnumPos)
const numInput = `(${numMergePos.join("|")})`
const pieceNameInput = `(${Object.keys(chessOfPeiceMap).join("|")})`
// 前兵进一
const parse_reg_1 = new RegExp(`(${strPos.concat(numMergePos).join("|")})${pieceNameInput}${moveStyleInput}${numInput}$`)
// 车9进1
const parse_reg_2 = new RegExp(`${pieceNameInput}${numInput}${moveStyleInput}${numInput}$`)
// 前6进1
const parse_reg_3 = new RegExp(`(${strPos.join("|")})${numInput}${moveStyleInput}${numInput}$`)
export const parseStrToPoint = (str: string, side: PieceSide, pl: PieceList) => {
  let strRes;
  const currentSidePieceList = pl.filter(p => p.side === side)
  const isRedSide = side === "RED"
  const pieceDiffX = side === "BLACK" ? 8 : 0
  const pieceDiffY = side === "BLACK" ? 9 : 0
  const sideOpposite = isRedSide ? 1 : - 1
  // 前6进1 只有兵才会出现这种情况
  let strRes1;
  if (parse_reg_3.test(str) && (strRes1 = parse_reg_3.exec(str))) {
    const pieceXPos = Math.abs((formatChooseNum(strRes1[2]) - 1) - pieceDiffX);
    const moveStyle = strRes1[3];
    let moveStep = formatChooseNum(strRes1[4]);
    const pieceName = getSidePieceName("兵", side)
    if (moveStyle === "平") {
      moveStep -= 1
    }
    // 获取 该棋子列表 
    const findPL = currentSidePieceList.filter(p => p.x === pieceXPos && p.name === pieceName)
    // 如果小于 2 不适用 此正则匹配
    if (findPL.length < 2) {
      return false
    }
    findPL.sort((a, b) => isRedSide ? a.y - b.y : b.y - a.y)
    const index = findPL.length === 3 ? formatChooseNum(strRes1[1]) - 1 : (strRes1[1] === "前" ? 0 : 1)
    // 获取到棋子
    const choose = findPL[index]
    const cy = Math.abs(choose.y - pieceDiffY)

    // 前进
    let y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite
    if (moveStyle === moveStyles[0]) {
      const mp = new Point(choose.x, y)
      return { mp, choose }
    }
    // 平
    if (moveStyle === moveStyles[1]) {
      const mp = new Point(Math.abs(moveStep - pieceDiffX), cy)
      return { mp, choose }
    }
  }
  //  前车进八  or  一兵进1
  if (parse_reg_1.test(str) && (strRes = parse_reg_1.exec(str))) {
    parse_reg_1.lastIndex = 0
    // 获得 棋子名字
    let pieceName = getSidePieceName(strRes[2] as ChessOfPeiceName, side)
    let moveStyle = strRes[3], moveStep = formatChooseNum(strRes[4]);
    if (moveStyle === "平") {
      moveStep -= 1
    }
    // 获取 该棋子列表 
    const findPL = currentSidePieceList.filter(p => p.name === pieceName)
    // 如果小于 2 不适用 此正则匹配
    if (findPL.length < 2) {
      return false
    }
    // 获取 棋子所对应的 x轴 的次数
    let maxX = 0, lineX: string;
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
    const linexs = Object.keys(xmap)
    for (let i = 0; i < linexs.length; i++) {
      const ele = xmap[linexs[i]];
      if (maxX < ele) {
        maxX = ele
      } else if (maxX === ele) {
        // 如果两个兵 两组并排 不适用 此正则
        return false
      }
    }
    lineX = linexs[0]
    maxX = xmap[lineX]
    if (maxX < 2) {
      return false
    }
    const linePL = findPL.filter(p => String(p.x) === lineX)
    let firstStr = strRes[1] as string
    // 如果取中字 必须有三个兵在一条竖线上
    if (firstStr === strPos[1] && maxX !== 3) {
      return false
    }
    // 如果多个兵在一条竖线上 数字开头
    if (maxX >= 3) {
      linePL.sort((a, b) => isRedSide ? a.y - b.y : b.y - a.y)
      // 获取到棋子
      const choose = linePL[formatChooseNum(firstStr) - 1]
      const cy = Math.abs(choose.y - pieceDiffY)

      // 前进
      let y = isRedSide ? cy - moveStep * sideOpposite : cy + moveStep * sideOpposite
      if (moveStyle === moveStyles[0]) {
        const mp = new Point(choose.x, y)
        return { mp, choose }
      }
      // 平
      if (moveStyle === moveStyles[1]) {
        const mp = new Point(Math.abs(moveStep - pieceDiffX), cy)
        return { mp, choose }
      }
    }
    // 如果两个相同的棋子在一条竖线上
    if (maxX === 2 && strPos.filter(i => i !== "中").includes(firstStr)) {
      const index = firstStr === strPos[0] ? 0 : 1
      const choose = linePL[index]
      const cy = choose.y
      const cx = choose.x
      // x 距离差
      const diffX = cx - moveStep
      // 前进 后退 x 一致 y取想法
      if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
        // 距离长度
        const absDiffX = Math.abs(diffX)
        const yOpposite = moveStyle === moveStyles[2] ? -1 : 1
        // 马
        if (pieceName === "马" || pieceName === "馬") {
          if (absDiffX >= 1 && absDiffX <= 2) {
            const isRow = absDiffX == 1 ? true : false
            const y = isRow ? cy - (2 * sideOpposite * yOpposite) : cy - (1 * sideOpposite * yOpposite)
            const x = diffX < 0 ? (isRow ? cx - (1 * sideOpposite) : cx - (2 * sideOpposite)) : (isRow ? cx + (1 * sideOpposite) : cx + (2 * sideOpposite))
            return { choose, mp: new Point(x, y) }
          } else {
            return false
          }
        }
        // 象 士
        const elePieceList = ["相", "象"], kinPieceList = ["仕", "士"], isEle = elePieceList.includes(pieceName as string);
        if (isEle || kinPieceList.includes(pieceName as string)) {
          const mStep = isEle ? 2 : 1
          if (isEle && absDiffX !== 3) {
            return false
          }
          if (!isEle && absDiffX !== 1) {
            return false
          }
          const x = diffX > 0 ? cx + (mStep * sideOpposite) : cx - (mStep * sideOpposite)
          const y = cy - (mStep * sideOpposite * yOpposite)
          return { choose, mp: new Point(x, y) }
        }
        // 车 将 兵 跑
        const y = cy - (moveStep * sideOpposite * yOpposite)
        return { choose, mp: new Point(cx, y) }
      }
      // 平
      if (moveStyle === moveStyles[1]) {
        // 车 将 兵 跑
        return { choose, mp: new Point(Math.abs(moveStep - pieceDiffX), cy) }
      }

    }
    return false
  }
  // 车9进1
  let execRes
  if (parse_reg_2.test(str) && (execRes = parse_reg_2.exec(str))) {
    let pieceName = getSidePieceName(execRes[1] as ChessOfPeiceName, side)
    const pieceXPos = formatChooseNum(execRes[2]) - 1;
    const moveStyle = execRes[3];
    let moveStep = formatChooseNum(execRes[4]);
    if (moveStyle === "平") {
      moveStep -= 1
    }
    const px = Math.abs(pieceXPos - pieceDiffX)
    const choose = currentSidePieceList.filter(p => p.x === px && p.name === pieceName)
    // 没找到棋子
    if (!choose.length) {
      return false
    }
    // 当两个或更多棋子在一条直线上
    if (choose.length >= 2) {
      return false
    }
    const cy = choose[0].y
    const cx = choose[0].x
    const diffX = Math.abs(cx - pieceDiffX) - moveStep
    const absDiffX = Math.abs(diffX)
    // 前进 后退 x 一致 y取移动相反
    if (moveStyle === moveStyles[0] || moveStyle === moveStyles[2]) {
      // 距离长度
      const yOpposite = moveStyle === moveStyles[2] ? -1 : 1
      // 马
      if (pieceName === "马" || pieceName === "馬") {
        const absx = Math.abs((Math.abs(cx - pieceDiffX) - (moveStep - 1)))
        if (absx >= 1 && absx <= 2) {
          const isRow = absx === 1 ? true : false
          const y = isRow ? cy - (2 * sideOpposite * yOpposite) : cy - (1 * sideOpposite * yOpposite)
          const x = (diffX + 1) < 0 ? (isRow ? cx + (1 * sideOpposite) : cx + (2 * sideOpposite)) : (isRow ? cx - (1 * sideOpposite) : cx - (2 * sideOpposite))
          return { choose: choose[0], mp: new Point(x, y) }
        } else {
          return false
        }
      }
      // 象 士
      const elePieceList = ["相", "象"], kinPieceList = ["仕", "士"], isEle = elePieceList.includes(pieceName as string);
      if (isEle || kinPieceList.includes(pieceName as string)) {
        const mStep = isEle ? 2 : 1
        if (isEle && absDiffX !== 3) {
          return false
        }
        if (!isEle && absDiffX !== 1) {
          return false
        }
        const x = diffX > 0 ? cx + (mStep * sideOpposite) : cx - (mStep * sideOpposite)
        const y = cy - (mStep * sideOpposite * yOpposite)
        return { choose: choose[0], mp: new Point(x, y) }
      }
      // 车 将 兵 跑
      const y = cy - (moveStep * sideOpposite * yOpposite)
      return { choose: choose[0], mp: new Point(cx, y) }
    }
    // 平
    if (moveStyle === moveStyles[1]) {
      // 车 将 兵 跑
      return { choose: choose[0], mp: new Point(Math.abs(moveStep - pieceDiffX), cy) }
    }
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

export function parse_PEN_PeiceName(penPeiceNameCode: PENPeiceNameCode): ChessOfPeiceName | null {
  switch (penPeiceNameCode) {
    case 'K':
      return "帅"
    case 'k':
      return '将'
    case 'A':
      return '士'
    case 'a':
      return '仕'
    case 'B':
      return '相'
    case 'b':
      return '象'
    case 'N':
      return '马'
    case 'n':
      return '馬'
    case 'R':
      return '车'
    case 'r':
      return '車'
    case 'C':
      return '炮'
    case "c":
      return '砲'
    case "P":
      return '兵'
    case 'p':
      return '卒'
    default:
      return null
  }
}
function get_PEN_PieceName(str: ChessOfPeiceName): PENPeiceNameCode | null {
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

export function parse_PEN_SideName(sideCode: string): PieceSide {
  switch (sideCode) {
    case 'b': case 'B':
      return 'BLACK'
    default:
      return 'RED'
  }
}

export function gen_PEN_SideCode(side: PieceSide) {
  switch (side) {
    case "BLACK":
      return 'b'
    case "RED":
      return 'w'
    default:
      return 'w'
  }
}

export function parse_PEN_Str(penStr: string): ParsePENStrData {
  const layoutRegexp = /(.*)\s+(w|b)\s*(-\s*-\s*(\d)+\s*(\d)+)?/
  const isNumber = (str: string) => /\d/.test(str)
  const matchRes = penStr.match(layoutRegexp)
  if (!matchRes) {
    throw new Error("不符合 PEN 棋盘布局代码格式!");
  }
  const peiceLayout = matchRes[1]
  const side = parse_PEN_SideName(matchRes[2])
  const notEatRound = matchRes[4]
  const round = matchRes[5]
  const peiceCodeList = peiceLayout.split("/")
  // 中国象棋 有10条横线
  if (peiceCodeList.length !== 10) {
    throw new Error("不符合 PEN 棋盘布局代码格式!");
  }
  let pl = []

  for (let y = 0; y < peiceCodeList.length; y++) {
    const pieceCodeStr = peiceCodeList[y];
    let px = 9;
    let strLen = pieceCodeStr.length
    if (strLen > 9) {
      throw new Error("不符合 PEN 棋盘布局代码格式!");
    }
    for (let j = 0; j < strLen; j++, px--) {
      const str = pieceCodeStr[j] as PENPeiceNameCode;
      const pieceName = parse_PEN_PeiceName(str)
      if (pieceName) {
        const p_side: PieceSide = str.toLocaleLowerCase() === str ? 'BLACK' : 'RED'
        pl.push({ side: p_side, name: pieceName, x: 9 - (px), y })
      } else if (isNumber(str)) {
        px -= Number(str) - 1
      }
    }
  }
  return {
    side,
    notEatRound,
    round,
    list: pl
  }
}

export function gen_PEN_Str(pl: PieceList, side: PieceSide): string {
  let PENList = Array.from({ length: 10 }, () => [] as Array<PeicePosInfo>)
  pl.forEach(p => {
    const data = p.getCurrentInfo()
    const index = data.y
    PENList[index].push(data)
  })
  PENList = PENList.map(item => {
    item = item.sort((a, b) => b.x - a.x)
    return item
  })
  let str = ''
  for (let y = 0; y < PENList.length; y++) {
    const peiceList = PENList[y];
    const len = peiceList.length
    let x = 8
    if (len === 0) {
      str += '9'
    }
    for (let j = 0; j < len; j++, x--) {
      const current = peiceList[j];
      const isUp = current.side === "RED"
      const penCode = get_PEN_PieceName(current.name)
      if (!penCode) {
        throw new Error(`未找到 ${current.name} 对应的 PEN 代码，请检查棋子名称是否符合正确格式:
例如： 车 "车","車"...`);
      }
      const step = (j > 0 ? (peiceList[j - 1].x - 1) : x) - (current.x)
      if (step > 0) {
        str += String(step)
      }
      str += isUp ? penCode.toUpperCase() : penCode
      //  结尾
      if (j + 1 === len) {
        const end = current.x
        if (end > 0) {
          str += String(end)
        }
      }
    }
    if (y < PENList.length - 1) {
      str += "/"
    }
  }
  return str + ' ' + gen_PEN_SideCode(side)
}

export function gen_PEN_Point_Str(p: Point | MovePoint | ChessOfPeice) {
  const x = p.x, y = p.y
  return String.fromCharCode(String(x).charCodeAt(0) + 49) + String(9 - y)
}

function parse_PEN_Point(word: string) {
  const x = String.fromCharCode(word.charCodeAt(0) - 49)
  const y = Number(word.charAt(1))
  return { x, y }
}

export function parse_PEN_Point_Str(str: string) {
  if (str.length !== 4) {
    return null
  }
  const pointPart = str.slice(0, 2), movePart = str.slice(2)
  return {
    point: parse_PEN_Point(pointPart),
    move: parse_PEN_Point(movePart)
  }
}

export function diffPenStr(oldStr: string, newStr: string) {

  const { list: oldList } = parse_PEN_Str(oldStr)
  const { list: newList } = parse_PEN_Str(newStr)
  const plList = oldList.map(item => chessOfPeiceMap[item.name](item))
  const delList: PeicePosInfo[] = [];
  // 被吃了
  const moveList: { point: Point; move: Point; }[] = []

  oldList.forEach(item => {
    const findindex = newList.findIndex(p =>
      p.x === item.x &&
      item.y === p.y &&
      item.side === p.side &&
      p.name === item.name
    )
    // 找到 说明 没有移动
    if (findindex !== -1) {
      newList.splice(findindex, 1)
      return
    }
    // 没找到说明 移动了
    const peice = chessOfPeiceMap[item.name](item)
    const mps = peice.getMovePoints(plList)
    // 如果 有移动点
    if (mps.length) {
      const hasMp = mps.find(mp => {
        // 这个棋子的移动点 出现在新的棋盘上 说明他移动过去了
        const findPointIndex = newList.findIndex(_item =>
          _item.x === mp.x &&
          _item.y === mp.y &&
          _item.side === item.side &&
          _item.name === item.name
        )
        const isFind = findPointIndex !== -1
        console.log(isFind, item, mp);

        // 如果找到了 说明 移动了
        if (isFind) {
          moveList.push({
            point: new Point(item.x, item.y),
            move: new Point(newList[findPointIndex].x, newList[findPointIndex].y)
          })
          newList.splice(findPointIndex, 1)
        }
        return isFind
      })
      // 如果没有 说明这个棋子已经不存在了 可能是被吃掉了
      if (!hasMp) {
        delList.push(item)
      }
    } else {
      delList.push(item)
    }
  })

  return {
    moveList: moveList.map(item => JSON.stringify(item)),
    delList
  }
}
