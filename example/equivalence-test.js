/**
 * 等价性测试：对比 lib-v2（旧版）与 lib（新版）在随机局面下
 * 走法生成集合与走子判定结果是否完全一致。
 * 用法: node example/equivalence-test.js [rounds]
 */
const libV2 = require("../lib-v2/zh-chess.cjs")
const libV3 = require("../lib/zh-chess.cjs")

const ROUNDS = Number(process.argv[2] || 300)

function makeGame(lib) {
  const g = new lib.default({ gameWidth: 800, gameHeight: 800 })
  g.gameStart("RED")
  return g
}

const seedPens = [
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
  "2bakab2/9/2n1c1n2/p1p1p1p1p/9/2P6/P2P1P1P1/2N1C1N2/9/2BAKAB2 w",
  "3k5/4a4/4b4/9/9/4P4/9/4B4/4A4/3K5 w",
  "r1ba1ab1r/4k4/2n1c1n2/p1p1p1p1p/9/9/P1P1P1P1P/2N1C1N2/4K4/R1BA1AB1R w",
]

function randomMove(lib, game, side, rand) {
  const pl = game.currentLivePieceList
  const cands = []
  for (const pc of pl) {
    if (pc.side !== side) continue
    for (const mp of pc.getMovePoints(pl)) {
      cands.push({ from: pc.getPoint(), to: mp })
    }
  }
  if (!cands.length) return null
  // 打乱并试走
  for (let i = cands.length - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0
    ;[cands[i], cands[j]] = [cands[j], cands[i]]
  }
  for (const c of cands) {
    const res = game.update(c.from, c.to, side, true)
    if (res.flag && res.move) {
      res.cb && res.cb()
      return c
    }
  }
  return null
}

// 用 libV3 随机生成局面（作为共同基准局面来源）
function genRandomPosition(rand, steps) {
  const g = makeGame(libV3)
  g.gameStart("RED")
  let side = g.currentSide
  for (let i = 0; i < steps; i++) {
    const m = randomMove(libV3, g, side, rand)
    if (!m) break
    side = g.currentSide
  }
  return g.getCurrentPenCode(g.currentSide)
}

function comparePosition(pen, stats) {
  const g2 = makeGame(libV2)
  const g3 = makeGame(libV3)
  g2.setPenCodeList(pen)
  g3.setPenCodeList(pen)
  const side = g2.currentSide
  const pl2 = g2.currentLivePieceList
  const pl3 = g3.currentLivePieceList

  const norm = (mp) => ({ x: mp.x, y: mp.y, dx: mp.disPoint ? mp.disPoint.x : null, dy: mp.disPoint ? mp.disPoint.y : null })
  const sortKey = (a) => `${a.x},${a.y}`

  // 1) 走法生成集合对比
  for (const p2 of pl2) {
    const p3 = pl3.find((q) => q.x === p2.x && q.y === p2.y)
    if (!p3) {
      stats.missingPiece++
      continue
    }
    const mps2 = p2.getMovePoints(pl2).map(norm).sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1))
    const mps3 = p3.getMovePoints(pl3).map(norm).sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1))
    const k2 = mps2.map((m) => `${m.x},${m.y},${m.dx},${m.dy}`).join("|")
    const k3 = mps3.map((m) => `${m.x},${m.y},${m.dx},${m.dy}`).join("|")
    if (k2 !== k3) {
      stats.genMismatch++
      if (stats.genMismatch <= 5) {
        console.log(`  [gen] mismatch piece at (${p2.x},${p2.y}) side=${p2.side} kind=${p2.constructor.name}`)
        console.log(`    v2: ${k2}`)
        console.log(`    v3: ${k3}`)
      }
    } else {
      stats.genSame++
    }
    // 2) 逐走法判定对比
    for (const mp of mps2) {
      const res2 = g2.update(p2.getPoint(), mp, side, false)
      const res3 = g3.update(p3.getPoint(), mp, side, false)
      const ok2 = !!(res2.flag && res2.move)
      const ok3 = !!(res3.flag && res3.move)
      stats.judge++
      if (ok2 !== ok3) {
        stats.judgeMismatch++
        if (stats.judgeMismatch <= 10) {
          console.log(`  [judge] mismatch piece(${p2.x},${p2.y}) -> (${mp.x},${mp.y}) v2=${ok2} v3=${ok3}`)
        }
      } else if (ok2 && ok3 && res2.message !== res3.message) {
        stats.msgMismatch++
        if (stats.msgMismatch <= 10) {
          console.log(`  [msg]   piece(${p2.x},${p2.y}) -> (${mp.x},${mp.y}) v2="${res2.message}" v3="${res3.message}"`)
        }
      }
    }
  }
}

// 可复现随机
let s = 42
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff
  return s / 0x7fffffff
}

const stats = { genSame: 0, genMismatch: 0, missingPiece: 0, judge: 0, judgeMismatch: 0, msgMismatch: 0 }

// 先对比固定局面
for (const pen of seedPens) {
  comparePosition(pen, stats)
}
// 再对比随机走子生成的中局局面
const startSteps = [10, 20, 30, 40, 50]
for (let r = 0; r < ROUNDS; r++) {
  const steps = startSteps[r % startSteps.length]
  const pen = genRandomPosition(rand, steps)
  comparePosition(pen, stats)
}

console.log("================================================")
console.log(`PEN positions compared     : ${seedPens.length + ROUNDS}`)
console.log(`getMovePoints same         : ${stats.genSame}`)
console.log(`getMovePoints mismatch     : ${stats.genMismatch}`)
console.log(`missing pieces             : ${stats.missingPiece}`)
console.log(`update judged              : ${stats.judge}`)
console.log(`update result mismatch     : ${stats.judgeMismatch}`)
console.log(`message-only mismatch      : ${stats.msgMismatch}`)
if (stats.genMismatch === 0 && stats.missingPiece === 0 && stats.judgeMismatch === 0) {
  console.log("RESULT: PASS (行为完全一致)")
} else {
  console.log("RESULT: FAIL (存在差异!)")
}
