import { Piece, PieceList, drawMovePoint, getBoardMatrix } from "./piece"
import { checkChessPieceMovement, checkWillCauseSelf } from "./rule"
import { BoardInfo, MoveResult, MoveType, PiecePositonPoint, PieceSide } from "./types"



export class Board {
  context?: CanvasRenderingContext2D
  width: number
  height: number
  pieceRadius: number
  padding: number
  scaleRatio: number
  pieceList: Piece[]
  viewSide: PieceSide
  choosePiece: undefined | Piece
  cell: number
  row: number
  constructor(info: BoardInfo) {
    this.context = info.context
    this.width = info.width
    this.height = info.height
    this.pieceRadius = this.getPieceRadius(info.padding)
    this.padding = info.padding
    this.scaleRatio = typeof info.scaleRatio === "number" ? info.scaleRatio : 1
    this.pieceList = []
    this.viewSide = info.viewSide
    this.cell = (this.width - 2 * this.padding) / 8
    this.row = (this.height - 2 * this.padding) / 9
  }
  getPieceRadius(padding: number) {
    let cell = (this.width - 2 * padding) / 9 / 2, row = (this.height - 2 * padding) / 10 / 2;
    // 给每个棋子留出间隙
    return (cell > row ? row : cell) * 0.9
  }
  getPieceViewPostion(x: number, y: number): PiecePositonPoint {
    if (this.viewSide === "RED") {
      return { x: this.padding + x * this.cell, y: this.padding + y * this.row }
    }
    return {
      x: this.padding + Math.abs(x - 8) * this.cell,
      y: this.padding + Math.abs(y - 9) * this.row
    }
  }
  changeViewSide(side: PieceSide) {
    this.viewSide = side
  }
  draw() {
    this.drawBackground()

    this.drawPiece()
  }
  drawBackground() {
    if (this.context) {
      const startY = this.padding, startX = this.padding,
        endX = this.width - this.padding,
        endY = this.height - this.padding;
      this.context.fillStyle = "#e3cd8d";
      this.context.fillRect(0, 0, this.width, this.width);
      this.context.strokeStyle = "#000";
      // 横线
      for (let index = 0; index < 10; index++) {
        this.context.beginPath();
        const y = startY + this.row * index;
        this.context.moveTo(startX, y);
        this.context.lineTo(endX, y);
        this.context.closePath();
        this.context.stroke();
      }
      // 竖线
      for (let index = 0; index < 9; index++) {
        const x = startX + index * this.cell;
        const midY = startY + this.row * 4;
        const by = startY + this.row * 9;
        if (index === 0 || index === 8) {
          this.context.beginPath();
          this.context.moveTo(x, startY);
          this.context.lineTo(x, by);
          this.context.closePath();
          this.context.stroke();
          continue;
        }
        this.context.beginPath();
        this.context.moveTo(x, startY);
        this.context.lineTo(x, midY);
        this.context.closePath();
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(x, midY + this.row);
        this.context.lineTo(x, endY);
        this.context.closePath();
        this.context.stroke();
      }
      // 士的两把叉
      for (let index = 0; index < 2; index++) {
        const x = startX + this.cell * 3;
        const points = getSquarePoints(
          { x, y: startY + this.row * 7 * index },
          this.cell * 2,
          this.row * 2
        );
        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);
        this.context.lineTo(points[2].x, points[2].y);
        this.context.moveTo(points[1].x, points[1].y);
        this.context.lineTo(points[3].x, points[3].y);
        this.context.closePath();
        this.context.stroke();
      }
      // 炮位 兵位 坐标的 ∟符号
      for (let i = 0; i < 9; i += 2) {
        const width = this.cell * .15
        const padding = this.cell * .1
        for (let j = 0; j < 2; j++) {
          let addx = j === 0 ? - padding : +padding
          let addy = j === 0 ? + padding : - padding
          let addw = j === 0 ? + width : - width
          for (let z = 0; z < 2; z++) {
            // 红 黑
            let y = z % 2 === 0 ? startY + 3 * this.row : startY + 6 * this.row
            // 左右两边
            for (let w = 0; w < 2; w++) {
              let x = w % 2 === 0 ? startX + i * this.cell + addx : startX + i * this.cell - addx
              let aw = w % 2 === 0 ? - addw : +addw
              if (x - startX > 0 && x - (startX + 8 * this.cell) < 0) {
                this.context.beginPath();
                this.context.moveTo(x, y + addy);
                this.context.lineTo(x + aw, y + addy);
                this.context.moveTo(x, y + addy);
                this.context.lineTo(x, y + addy + addw);
                this.context.stroke();
              }
            }
          }
        }
        if (i - 1 === 1 || i - 1 === 7) {
          for (let j = 0; j < 2; j++) {
            let addx = j === 0 ? - padding : +padding
            let addy = j === 0 ? + padding : - padding
            let addw = j === 0 ? + width : - width
            let x1 = startX + (i - 1) * this.cell
            for (let z = 0; z < 2; z++) {
              let y = (z % 2 === 0 ? startY + 2 * this.row : startY + 7 * this.row) + addy
              for (let w = 0; w < 2; w++) {
                let x = w % 2 === 0 ? x1 + addx : x1 - addx
                let aw = w % 2 === 0 ? -addw : +addw
                this.context.beginPath();
                this.context.moveTo(x, y);
                this.context.lineTo(x + aw, y);
                this.context.moveTo(x, y);
                this.context.lineTo(x, y + addw);
                this.context.stroke();
              }
            }

          }
        }
      }
      //  楚河 汉界
      this.context.textBaseline = "middle"
      this.context.textAlign = "left"
      this.context.fillStyle = "#000"
      const fontSize = this.row * .7
      this.context.font = fontSize + 'px serif'
      const leftWord = this.viewSide === "RED" ? "楚河" : "汉界", rightWord = this.viewSide !== "RED" ? "楚河" : "汉界";
      this.context.fillText(leftWord, startX + this.cell, startY + this.row * 4.5)
      this.context.textAlign = "right"
      this.context.translate(startX + this.cell * 7 - fontSize * 2, startY + this.row * 4.5)
      this.context.rotate(Math.PI);
      this.context.fillText(rightWord, 0, 0)
      this.context.setTransform(this.scaleRatio, 0, 0, this.scaleRatio, 0, 0);
    }
  }
  drawPiece() {
    const choose = this.pieceList.filter(p => {
      const pos = this.getPieceViewPostion(p.x, p.y)
      p.draw(pos.x, pos.y, this.pieceRadius, this.context)
      if (p.isChoose) {
        return true
      }
      return false
    })
    choose.forEach(p => {
      p.getMovePointList(this.pieceList).forEach(m => {
        const pos = this.getPieceViewPostion(m.x, m.y)
        drawMovePoint(pos.x, pos.y, this.pieceRadius, "#0044ee", this.context)
      })
    })
  }
  setPieceList(pl: PieceList) {
    this.pieceList = pl
  }
  update(mov: PiecePositonPoint, pos: PiecePositonPoint): MoveResult {
    const boardMatrix = getBoardMatrix(this.pieceList)
    let movPiece = boardMatrix[mov.x][mov.y], posPiece = boardMatrix[pos.x][pos.y]
    const movementResult = checkChessPieceMovement(movPiece, pos, this.pieceList)
    if (!movementResult.flag) {
      return movementResult
    }
    let moveType: MoveType = "MOVE"
    if (posPiece) {
      moveType = "EAT"
    }
    const causeSelf = checkWillCauseSelf(movPiece, pos, this.pieceList)
    if (!causeSelf.flag) {
      return causeSelf
    }
    return { flag: true }
  }
}

export function getSquarePoints(lt: PiecePositonPoint, width: number, height: number): PiecePositonPoint[] {
  return [
    { ...lt },
    { x: width + lt.x, y: lt.y },
    { x: width + lt.x, y: lt.y + height },
    { x: lt.x, y: lt.y + height },
  ]
}