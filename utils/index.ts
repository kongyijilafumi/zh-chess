import { ChessOfPeiceName } from './../src/piece';
import { PieceSide, Point } from './../types/index';
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
const numMergePos = numPos.concat(zhnumPos)
const numMergePosStr = numMergePos.join("|")
const PieceNames = Object.keys(chessOfPeiceMap)
const move_reg_one = new RegExp(`(${strPos.concat(numMergePos).join("|")})(${PieceNames.join("|")})(${moveStyles.join("|")})(${numMergePosStr})$`)
const move_reg_two = new RegExp(`(${PieceNames.join("|")})(${numMergePosStr})(${moveStyles.join("|")})(${numMergePosStr})$`)
const move_reg_three = new RegExp(`(${strPos.join("|")})(${numMergePosStr})(${moveStyles.join("|")})(${numMergePosStr})$`)
export const getPieceInfo = (str: string, side: PieceSide, pl: PieceList) => {
  let strRes;
  const currentSidePieceList = pl.filter(p => p.side === side)
  const isRedSide = side === "RED"
  const pieceDiffX = side === "BLACK" ? 8 : 0
  const pieceDiffY = side === "BLACK" ? 9 : 0
  const sideOpposite = isRedSide ? 1 : - 1
  // 前6进1 只有兵才会出现这种情况
  let strRes1;
  if (move_reg_three.test(str) && (strRes1 = move_reg_three.exec(str))) {
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
  if (move_reg_one.test(str) && (strRes = move_reg_one.exec(str))) {
    move_reg_one.lastIndex = 0
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
  if (move_reg_two.test(str) && (execRes = move_reg_two.exec(str))) {
    let pieceName = getSidePieceName(execRes[1] as ChessOfPeiceName, side)
    const pieceXPos = formatChooseNum(execRes[2]) - 1;
    const moveStyle = execRes[3];
    let moveStep = formatChooseNum(execRes[4]);
    if (moveStyle === "平") {
      moveStep -= 1
    }
    const px = Math.abs(pieceXPos - pieceDiffX)
    const choose = currentSidePieceList.find(p => p.x === px && p.name === pieceName)
    // 没找到棋子
    if (!choose) {
      return false
    }
    const cy = choose.y
    const cx = choose.x
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

function formatMoveStyle(str: string): string {
  switch (str) {
    case "进": case "進":
      return "进"
    case "平":
      return "平"
    case "退": case "后":
      return "退"
    default:
      return ""
  }
}