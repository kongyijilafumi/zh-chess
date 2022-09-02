export class GameLog {
  log(str: string) {
    console.info(str)
  }
  succuess(str: string) {
    console.log(str)
  }
  fail(str: string) {
    console.error(str)
  }
}