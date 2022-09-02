import { findPiece } from './../utils/index';
import { ChessOfPeice, PieceList, chessOfPeiceMap, GeneralPiece } from './piece';
import { PieceSide, CheckPoint, PieceInfo, Point } from '../types/index';

export class GameRule {
  /**
 * 根据某方移动棋子判断自己将领是否安全
 * @param side 移动方
 * @param pos 移动棋子
 * @param cp 是去吃棋子还是移动棋子
 * @param pl 当前棋盘列表
 * @returns 是否安全
 */
  checkGeneralInTrouble(side: PieceSide, pos: ChessOfPeice, cp: CheckPoint, pl: PieceList) {
    const enemySide: PieceSide = side === "BLACK" ? "RED" : "BLACK"
    let list: PieceList;
    if ("move" in cp) {
      const pieceInfo = { ...pos, x: cp.move.x, y: cp.move.y } as PieceInfo
      const piece = chessOfPeiceMap[pieceInfo.name](pieceInfo)
      list = pl.filter(i => !(i.x === pos.x && i.y === pos.y))
      list.push(piece)
    } else {
      const pieceInfo = { ...pos, x: cp.eat.x, y: cp.eat.y } as PieceInfo
      const piece = chessOfPeiceMap[pieceInfo.name](pieceInfo)
      list = pl.filter(i => !(i.x === cp.eat.x && i.y === cp.eat.y) && !(i.x === pos.x && i.y === pos.y))
      list.push(piece)
    }
    const isFaceToFace = this.checkGeneralsFaceToFaceInTrouble(list)
    if (isFaceToFace) {
      return true
    }
    const enemySidePeiecList = list.filter(i => i.side === enemySide)
    const sideGeneralPiece = list.find(i => i.side === side && i instanceof GeneralPiece) as GeneralPiece
    const sidesideGeneralPoint = new Point(sideGeneralPiece.x, sideGeneralPiece.y)
    const hasTrouble = enemySidePeiecList.some(item => {
      const mf = item.move(sidesideGeneralPoint, list)
      if (mf.flag) {
        console.log(`${item} 可以 直接 攻击 ${sideGeneralPiece}`);
      }
      return mf.flag
    })
    return hasTrouble
  }

  /**
 * 检查棋子移动 双方将领在一条直线上 false 不危险 true 危险
 * @param pl 假设移动后的棋子列表
 * @param side 当前下棋方
 * @returns 是否危险
 */
  checkGeneralsFaceToFaceInTrouble(pl: PieceList) {
    const points = pl.filter(i => i instanceof GeneralPiece).map(i => ({ x: i.x, y: i.y }))
    const max = points[0].y > points[1].y ? points[0].y : points[1].y
    const min = points[0].y < points[1].y ? points[0].y : points[1].y
    // 在同一条直线上
    if (points[0].x === points[1].x) {
      const hasPeice = pl.find(i => i.y < max && i.y > min && i.x === points[0].x)
      // 如果有棋子 说明可以安全移动 
      if (hasPeice) {
        return false
      }
      return true
    }
    return false
  }



  /**
   * 判断敌方被将军时，是否有解
   * @param enemySide 敌方
   * @param pl 当前棋盘列表
   * @returns  返回是否有解
   */
  checkEnemySideInTroubleHasSolution(enemySide: PieceSide, pl: PieceList) {
    return pl.filter(i => i.side === enemySide).some(item => {
      const mps = item.getMovePoints(pl)
      // 是否有解法
      return mps.some(p => {
        const isDis = findPiece(pl, p.disPoint)
        if (isDis) {
          return false
        }
        const hasEat = findPiece(pl, p)
        const checkPoint: CheckPoint = hasEat ? { eat: p } : { move: p }
        const hasSolution = !this.checkGeneralInTrouble(enemySide, item, checkPoint, pl)
        console.log(`${item} 移动到 ${p}点 ${enemySide}方 ${!hasSolution ? '有' : '没有'} 危险！${hasSolution ? "有" : "无"}解法`);
        return hasSolution
      })
    })
  }
}