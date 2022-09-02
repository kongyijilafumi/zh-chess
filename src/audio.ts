type AdEl = HTMLAudioElement

export class GameAudio {
  trouble: AdEl
  eat: AdEl
  over: AdEl
  fail: AdEl
  move: AdEl
  choose: AdEl
  constructor({ move, fail, over, trouble, eat, choose }: GameAudioInterface) {
    this.move = new Audio(move)
    this.fail = new Audio(fail)
    this.over = new Audio(over)
    this.eat = new Audio(eat)
    this.trouble = new Audio(trouble)
    this.choose = new Audio(choose)
  }
  playMove() {
    return this.move.play()
  }
  playFail() {
    return this.fail.play()
  }
  playOver() {
    return this.over.play()
  }
  playTrouble() {
    return this.trouble.play()
  }
  playEat() {
    return this.eat.play()
  }
  playChoose() {
    return this.choose.play()
  }
}

export interface GameAudioInterface {
  trouble: string
  over: string
  fail: string
  move: string
  eat: string
  choose: string
}