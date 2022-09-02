import { ChessOfPeice } from '../src/piece';
import { Point, SquarePoints, PieceInfo } from '../types';



/**
 * 
 * @param ctx 
 * @param strokeStyle 
 * @param points 顺时针或者逆时针的四个点
 */
export const drawLineSquare = (ctx: CanvasRenderingContext2D, strokeStyle: string, points: SquarePoints) => {
  ctx.strokeStyle = strokeStyle
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  points.slice(1).forEach(item => {
    ctx.lineTo(item.x, item.y)
  })
  ctx.closePath()
  ctx.stroke()
}

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


export function drawChessLine(ctx: CanvasRenderingContext2D,
  ctxWidth: number, borderWidth: number,
  startX: number, startY: number, endX: number, endY: number,
  gridWidth: number, gridHeight: number,
) {
  // 画背景
  ctx.fillStyle = "#ff9200";
  ctx.fillRect(0, 0, ctxWidth, ctxWidth);
  ctx.fillStyle = "#faebd7";
  const insideWidth = ctxWidth - borderWidth * 2;
  ctx.fillRect(borderWidth, borderWidth, insideWidth, insideWidth);

  ctx.strokeStyle = "#000";
  // 横线
  for (let index = 0; index < 10; index++) {
    ctx.beginPath();
    const y = startY + gridHeight * index;
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.closePath();
    ctx.stroke();
  }
  // 竖线
  for (let index = 0; index < 9; index++) {
    const x = startX + index * gridWidth;
    const midY = startY + gridHeight * 4;
    const by = startY + gridHeight * 9;
    if (index === 0 || index === 8) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, by);
      ctx.closePath();
      ctx.stroke();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, midY);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, midY + gridHeight);
    ctx.lineTo(x, endY);
    ctx.closePath();
    ctx.stroke();
  }
  // 士的两把叉
  for (let index = 0; index < 2; index++) {
    const x = startX + gridWidth * 3;
    const points = getSquarePoints(
      { x, y: startY + gridHeight * 7 * index },
      gridWidth * 2,
      gridHeight * 2
    );
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.moveTo(points[1].x, points[1].y);
    ctx.lineTo(points[3].x, points[3].y);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.save();
}


/**
 * 画棋子
 * @param ctx 画布
 * @param startX 开始坐标x
 * @param startY 开始坐标y
 * @param width 象棋格子宽度
 * @param height 象棋格子高度
 * @param piece 棋子
 */
export function drawPeice(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number, piece: ChessOfPeice) {
  const bgfillStyle = piece.side === "BLACK" ? "#fdec9e" : "#feeca0";
  const textColor = piece.side === "BLACK" ? "#000" : "#c1190c";
  const borderColor = piece.isChoose ? "red" : "#000";
  const x = startX + piece.x * width;
  const y = startY + piece.y * height;
  ctx.beginPath();
  ctx.fillStyle = bgfillStyle;
  ctx.arc(x, y, piece.radius, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.arc(x, y, piece.radius, 0, 2 * Math.PI, true);
  ctx.arc(x, y, piece.radius - 3, 0, 2 * Math.PI, true);
  ctx.stroke();
  ctx.closePath();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = textColor;
  ctx.font = piece.radius + "px yahei";
  ctx.fillText(piece.name, x, y);
}

export function canvasClick(e: MouseEvent,
  startX: number, startY: number,
  gridWidth: number, gridHeight: number,
  pieceList: Array<PieceInfo>) {
  const { offsetX: x2, offsetY: y2 } = e
  const piece = pieceList.find(item => {
    const { x, y, radius } = item
    const x1 = x * gridWidth + startX
    const y1 = y * gridHeight + startY
    const isInPiece = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)) - radius < 0
    return isInPiece
  })
  if (!piece) {
    console.log("未找到点击的 棋子");
    return
  }
  console.log("棋子：", piece);

}