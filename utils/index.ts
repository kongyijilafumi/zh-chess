import { Point } from '../types/index';
import { PieceList } from '../src/piece';
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