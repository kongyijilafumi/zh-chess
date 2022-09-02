import { ModalOptionList, ModalChooseOption } from './../types/index';
import { Point } from '../types/index';
type CTX = CanvasRenderingContext2D

export class GameModal {
  /**
 * 游戏窗口高度
 */
  private gameWidth!: number;
  /**
   * 游戏窗口高度
   */
  private gameHeight!: number;


  /**
   *  棋子二维操作上下文
   */
  private ctx: CTX
  /**
   * 弹窗高度
   */
  modalHeight: number;
  /**
   * 弹窗宽度
   */
  modalWidth: number;


  currentOptions!: Array<ModalChooseOption>

  constructor(ctx: CTX, width: number, height: number) {
    this.ctx = ctx
    this.gameWidth = width
    this.gameHeight = height
    this.modalWidth = width >= 600 ? 500 : width - 100
    this.modalHeight = height >= 600 ? 400 : height - 80

  }
  drawModal(title: string, option: ModalOptionList) {
    this.ctx.fillStyle = "rgba(0,0,0,.6)"
    this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight)
    const modalX = (this.gameWidth - this.modalWidth) / 2
    const modalY = (this.gameHeight - this.modalHeight) / 2
    this.ctx.fillStyle = "#fff"
    this.ctx.fillRect(modalX, modalY, this.modalWidth, this.modalHeight)
    const titleHeight = 50

    this.ctx.fillStyle = "#000"
    this.ctx.font = titleHeight / 1.8 + "px serif";
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    this.ctx.fillText(title, this.gameWidth / 2, modalY + titleHeight / 2, this.modalWidth);

    const optionsHeight = 50
    const optionPaddingTop = 20, optionPaddingLeft = 30;
    const lastHeight = (this.modalHeight - titleHeight - optionPaddingTop * 2 - option.length * optionsHeight)
    const optionMarginTop = lastHeight / (option.length + 1)
    const optionStartY = titleHeight + modalY + optionPaddingTop
    const optionFontSize = 20
    const optionStartX = modalX + optionPaddingLeft
    const optionsWidth = (this.modalWidth - optionPaddingLeft * 2)
    this.currentOptions = []
    option.forEach((item, index) => {
      this.ctx.fillStyle = "#1890ff"
      this.ctx.strokeStyle = "#1890ff"
      const x = optionStartX, y = optionStartY + index * (optionsHeight) + (index + 1) * optionMarginTop;
      this.roundedRect(this.ctx, x, y, optionsWidth, optionsHeight, 10)
      this.ctx.fillStyle = "#fff"
      this.ctx.font = optionFontSize + "px serif"
      this.ctx.textBaseline = "top"
      this.ctx.fillText(item.lab, this.gameWidth / 2, y + ((optionsHeight - optionFontSize) / 1.8), optionsWidth)
      this.currentOptions.push({ ...item, width: optionsWidth, height: optionsHeight, x, y })
    })
  }
  roundedRect(ctx: CTX, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.fill();
  }
  getClickOption(p: Point) {
    return this.currentOptions.find((item) => {
      if (p.x >= item.x && p.x <= (item.x + item.width) && p.y >= item.y && p.y <= (item.y + item.height)) {
        return true
      }
      return false
    })
  }
}
