import type { Point, SquarePoints } from '../src/types';

/**
 * 根据左上点得出方形的四个点的坐标
 * @param lt 左上点
 * @param width 方形的宽度
 * @param height 方形的高度
 */
export function getSquarePoints(lt: Point, width: number, height: number): SquarePoints {
  return [
    { ...lt },
    { x: width + lt.x, y: lt.y },
    { x: width + lt.x, y: lt.y + height },
    { x: lt.x, y: lt.y + height },
  ]
}