/**
 * 性能基准：模拟 AI 搜索热点（走法生成 + 走法合法性判定）
 * 用法: node example/bench.js [libPath]  (libPath 默认 ../lib/zh-chess.cjs)
 */
const libPath = process.argv[2] || "../lib/zh-chess.cjs"
const mod = require(libPath)
const ZhChess = mod.default
const { Point } = mod

const POSITIONS = [
  // 初始局面
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
  // 中局一（马炮战）
  "2bakab2/9/2n1c1n2/p1p1p1p1p/9/2P6/P2P1P1P1/2N1C1N2/9/2BAKAB2 w",
  // 中局二（车炮对攻）
  "r1ba1ab1r/4k4/2n1c1n2/p1p1p1p1p/9/9/P1P1P1P1P/2N1C1N2/4K4/R1BA1AB1R w",
  // 残局（车兵对士象全，含将军）
  "3k5/4a4/4b4/9/9/4P4/4R4/4B4/4A4/3K5 w",
  // 中局三（双车炮）
  "2bakab2/4r4/2n1c1n2/p1p1p1p1p/9/2P6/P1P1P1P1P/2N1C1N2/4R4/2BAKAB2 w",
  // 残局（马炮兵）
  "4k4/4a4/4b4/9/4p4/4P4/9/3N1N3/9/4K4 w",
]

function benchOnce(game, side, rounds) {
  let totalGen = 0n, totalUpd = 0n, totalMove = 0, totalLegal = 0
  for (let r = 0; r < rounds; r++) {
    const pl = game.currentLivePieceList
    // 走法生成
    const g0 = process.hrtime.bigint()
    let moveCount = 0
    for (const pc of pl) {
      if (pc.side !== side) continue
      moveCount += pc.getMovePoints(pl).length
    }
    totalGen += process.hrtime.bigint() - g0
    totalMove += moveCount

    // 逐走法判定（模拟 AI 试走：update post=false 不落子）
    const u0 = process.hrtime.bigint()
    let legalCount = 0
    for (const pc of pl) {
      if (pc.side !== side) continue
      const mps = pc.getMovePoints(pl)
      for (const mp of mps) {
        const res = game.update(pc.getPoint(), mp, side, false)
        if (res.flag && res.move) legalCount++
      }
    }
    totalUpd += process.hrtime.bigint() - u0
    totalLegal += legalCount
  }
  return { totalGen, totalUpd, totalMove, totalLegal }
}

const game = new ZhChess({ gameWidth: 800, gameHeight: 800 })
const ROUNDS = 10
let genSum = 0n, updSum = 0n, moveSum = 0, legalSum = 0, checks = 0
game.gameStart("RED")
for (const pen of POSITIONS) {
  game.setPenCodeList(pen)
  const side = game.currentSide
  const res = benchOnce(game, side, ROUNDS)
  genSum += res.totalGen
  updSum += res.totalUpd
  moveSum += res.totalMove
  legalSum += res.totalLegal
  checks++
  console.log(`PEN ${pen.slice(0, 30)}... side=${side} moves/round=${Math.round(res.totalMove / ROUNDS)}`)
}
const genMs = Number(genSum) / 1e6
const updMs = Number(updSum) / 1e6
const totalMs = genMs + updMs
console.log("-----------------------------------------------")
console.log(`positions=${checks} rounds/pos=${ROUNDS}`)
console.log(`total moves generated : ${moveSum}   (${(genMs).toFixed(2)} ms)`)
console.log(`total updates judged  : ${legalSum}   (${(updMs).toFixed(2)} ms)`)
console.log(`generate avg          : ${(genMs * 1e6 / moveSum).toFixed(1)} ns/move`)
console.log(`judge avg             : ${(updMs * 1e6 / legalSum).toFixed(1)} ns/update`)
console.log(`TOTAL                 : ${(totalMs).toFixed(2)} ms`)
